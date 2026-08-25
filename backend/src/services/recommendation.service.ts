/**
 * Recommendation Service — Main Orchestrator
 *
 * Flow for personalized recommendations:
 *   1. Build user profile from Favorites + RecentlyViewed
 *   2. Fetch candidate listings from DB (filtered by top categories)
 *   3. Score each candidate (category, price, location, condition, behavior, popularity, freshness)
 *   4. Rank + apply diversity constraint
 *   5. Return with human-readable reason strings
 *
 * Flow for similar products:
 *   1. Fetch candidates near the source listing (same category + popular)
 *   2. Score against source listing attributes as synthetic profile
 *   3. Exclude source listing, rank, return
 *
 * Cold start / guest:
 *   - Return popular + recently added listings
 */

import { Op } from 'sequelize'
import { Favorite, RecentlyViewed, Listing, Category, User, ListingImage, UserInteraction } from '../models'
import { formatListing } from './listing.service'
import { fetchCandidates, fetchFallbackCandidates } from './recommendation.candidates'
import type { UserProfile } from './recommendation.candidates'
import { rankAndDiversify, scoreForSimilarity } from './recommendation.scoring'
import type { ScoredListing } from './recommendation.scoring'
import type { SafeListing } from '../types/listing.types'
import {
  SIGNAL_LOOKBACK_DAYS,
  MAX_RECENT_VIEWS_FOR_PROFILE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_PER_CATEGORY,
  MAX_CANDIDATES,
  HALF_LIFE_DAYS,
  SIGNAL_WEIGHTS,
} from '../config/recommendation.config'

// ── Time decay ────────────────────────────────────────────────────────────────

/** Recent interactions count more; older ones decay exponentially. */
function timeDecayFactor(date: Date): number {
  const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  return Math.exp(-daysSince / HALF_LIFE_DAYS)
}

// ── Profile building ──────────────────────────────────────────────────────────

type SignalEntry = {
  listing: SafeListing | null
  weight: number
  date: Date
  source: 'favorite' | 'view' | 'contact'
}

/**
 * Build a lightweight user profile by aggregating signals from:
 * - UserInteraction events (CONTACT, SEARCH, CATEGORY, NOT_INTERESTED)
 * - Favorite listings (strong signal)
 * - RecentlyViewed listings (medium signal)
 *
 * Derived at query-time — no separate UserPreference table needed.
 */
async function buildUserProfile(userId: string): Promise<UserProfile | null> {
  const lookbackDate = new Date()
  lookbackDate.setDate(lookbackDate.getDate() - SIGNAL_LOOKBACK_DAYS)

  const listingIncludes = [
    { model: Category, as: 'category', attributes: ['id', 'name'] },
  ]

  const [favorites, recentViews, interactions] = await Promise.all([
    Favorite.findAll({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: lookbackDate },
      },
      include: [
        {
          model: Listing,
          as: 'listing',
          where: { status: 'ACTIVE' },
          include: listingIncludes,
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 50,
    }),
    RecentlyViewed.findAll({
      where: {
        user_id: userId,
        viewed_at: { [Op.gte]: lookbackDate },
      },
      include: [
        {
          model: Listing,
          as: 'listing',
          include: listingIncludes,
          required: false,
        },
      ],
      order: [['viewed_at', 'DESC']],
      limit: MAX_RECENT_VIEWS_FOR_PROFILE,
    }),
    UserInteraction.findAll({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: lookbackDate },
      },
      include: [
        {
          model: Listing,
          as: 'listing',
          include: listingIncludes,
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 100,
    }),
  ])

  const signals: SignalEntry[] = []
  const categoryScores: Record<string, number> = {}
  const searchTermScores: Record<string, number> = {}
  const notInterestedListingIds: string[] = []
  let hasFavoriteSignals = false

  const addCategoryScore = (categoryId: string, weight: number) => {
    categoryScores[categoryId] = (categoryScores[categoryId] ?? 0) + weight
  }

  for (const fav of favorites) {
    const listing = (fav as any).listing
    if (listing) {
      const decay = timeDecayFactor(fav.created_at)
      const weight = SIGNAL_WEIGHTS.FAVORITE * decay
      signals.push({
        listing: formatListing(listing),
        weight,
        date: fav.created_at,
        source: 'favorite',
      })
      addCategoryScore(listing.category_id, weight)
      hasFavoriteSignals = true
    }
  }

  for (const view of recentViews) {
    const listing = (view as any).listing
    if (listing) {
      const decay = timeDecayFactor(view.viewed_at)
      const weight = SIGNAL_WEIGHTS.VIEW * decay
      signals.push({
        listing: formatListing(listing),
        weight,
        date: view.viewed_at,
        source: 'view',
      })
      addCategoryScore(listing.category_id, weight)
    }
  }

  for (const interaction of interactions) {
    const decay = timeDecayFactor(interaction.created_at)
    const listing = (interaction as any).listing as Listing | undefined

    switch (interaction.interaction_type) {
      case 'CONTACT':
        if (listing && listing.status === 'ACTIVE') {
          const weight = SIGNAL_WEIGHTS.CONTACT * decay
          signals.push({
            listing: formatListing(listing),
            weight,
            date: interaction.created_at,
            source: 'contact',
          })
          addCategoryScore(listing.category_id, weight)
        }
        break

      case 'SEARCH': {
        const query = String(interaction.metadata?.query ?? '').trim().toLowerCase()
        if (query) {
          searchTermScores[query] =
            (searchTermScores[query] ?? 0) + SIGNAL_WEIGHTS.SEARCH * decay
        }
        break
      }

      case 'CATEGORY': {
        const categoryId = String(interaction.metadata?.categoryId ?? '')
        if (categoryId) {
          addCategoryScore(categoryId, SIGNAL_WEIGHTS.CATEGORY * decay)
        }
        break
      }

      case 'NOT_INTERESTED':
        if (interaction.listing_id) {
          notInterestedListingIds.push(interaction.listing_id)
        }
        break

      default:
        break
    }
  }

  if (signals.length === 0 && Object.keys(categoryScores).length === 0) {
    return null
  }

  const topCategoryIds = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  const prices = signals
    .filter((s) => s.listing)
    .flatMap(({ listing, weight }) => Array(Math.max(1, Math.round(weight))).fill(listing!.price) as number[])
    .sort((a, b) => a - b)

  const minPrice = prices.length > 0 ? prices[Math.floor(prices.length * 0.1)] : null
  const maxPrice = prices.length > 0 ? prices[Math.floor(prices.length * 0.9)] : null

  const cityCounts: Record<string, number> = {}
  const subCityCounts: Record<string, number> = {}
  const neighborhoodCounts: Record<string, number> = {}
  const conditionCounts: Record<string, number> = {}

  for (const { listing, weight } of signals) {
    if (!listing) continue
    cityCounts[listing.city] = (cityCounts[listing.city] ?? 0) + weight
    if (listing.subCity) {
      subCityCounts[listing.subCity] = (subCityCounts[listing.subCity] ?? 0) + weight
    }
    if (listing.neighborhood) {
      neighborhoodCounts[listing.neighborhood] =
        (neighborhoodCounts[listing.neighborhood] ?? 0) + weight
    }
    conditionCounts[listing.condition] = (conditionCounts[listing.condition] ?? 0) + weight
  }

  const preferredCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const preferredSubCity =
    Object.entries(subCityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const preferredNeighborhood =
    Object.entries(neighborhoodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const preferredCondition =
    Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const recentSearchTerms = Object.entries(searchTermScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term)

  return {
    topCategoryIds,
    minPrice,
    maxPrice,
    preferredCity,
    preferredSubCity,
    preferredNeighborhood,
    preferredCondition,
    recentSearchTerms,
    notInterestedListingIds: [...new Set(notInterestedListingIds)],
    hasFavoriteSignals,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RecommendationItem {
  listing: SafeListing
  score: number
  reason: string
}

export interface RecommendationResult {
  items: RecommendationItem[]
  isPersonalized: boolean
  fallbackReason?: string
}

/**
 * Get personalized recommendations for a user (or cold-start for guests).
 */
export async function getRecommendations(
  userId: string | undefined,
  limit: number = DEFAULT_LIMIT,
): Promise<RecommendationResult> {
  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT)

  // ── Guest / cold start ───────────────────────────────────────────────────
  if (!userId) {
    const fallback = await fetchFallbackCandidates(safeLimit)
    return {
      isPersonalized: false,
      fallbackReason: 'trending',
      items: fallback.slice(0, safeLimit).map((listing) => ({
        listing,
        score: 0,
        reason: 'Trending on Vintage',
      })),
    }
  }

  // ── Build user profile ───────────────────────────────────────────────────
  let profile: UserProfile | null = null
  try {
    profile = await buildUserProfile(userId)
  } catch {
    // Profile build failure is non-fatal — fall back to popular
  }

  if (!profile) {
    // New user / no interaction history — cold start
    const fallback = await fetchFallbackCandidates(safeLimit)
    return {
      isPersonalized: false,
      fallbackReason: 'new_user',
      items: fallback.slice(0, safeLimit).map((listing) => ({
        listing,
        score: 0,
        reason: 'Popular on Vintage',
      })),
    }
  }

  // ── Collect listings to exclude (user's own listings + already viewed) ───
  const ownListingsP = Listing.findAll({
    where: { seller_id: userId, status: { [Op.in]: ['ACTIVE', 'SOLD', 'ARCHIVED', 'DRAFT'] } },
    attributes: ['id'],
    limit: 100,
  })
  const recentViewedP = RecentlyViewed.findAll({
    where: { user_id: userId },
    attributes: ['listing_id'],
    order: [['viewed_at', 'DESC']],
    limit: 30,
  })

  const [ownListings, recentViewed] = await Promise.all([ownListingsP, recentViewedP])

  // We exclude own listings, but DON'T exclude recently viewed — they're signals, not blockers
  const excludeIds = [
    ...ownListings.map((l) => l.id),
    ...profile.notInterestedListingIds,
  ]

  // ── Fetch candidates ──────────────────────────────────────────────────────
  const candidates = await fetchCandidates(profile, excludeIds, MAX_CANDIDATES)

  if (candidates.length === 0) {
    const fallback = await fetchFallbackCandidates(safeLimit)
    return {
      isPersonalized: false,
      fallbackReason: 'no_candidates',
      items: fallback.slice(0, safeLimit).map((listing) => ({
        listing,
        score: 0,
        reason: 'Popular on Vintage',
      })),
    }
  }

  // ── Score and rank ────────────────────────────────────────────────────────
  const ranked: ScoredListing[] = rankAndDiversify(candidates, profile, safeLimit, MAX_PER_CATEGORY)

  return {
    isPersonalized: true,
    items: ranked.map(({ listing, score, reason }) => ({ listing, score, reason })),
  }
}

/**
 * Get listings similar to a specific product.
 * Uses the source listing's own features as the scoring reference.
 */
export async function getSimilarListings(
  listingId: string,
  limit: number = 8,
): Promise<RecommendationItem[]> {
  const safeLimit = Math.min(Math.max(1, limit), 12)

  // Fetch the source listing
  const listingIncludes = [
    { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description', 'image'] },
    {
      model: User,
      as: 'seller',
      attributes: [
        'id',
        'full_name',
        'avatar_url',
        'is_email_verified',
        'is_phone_verified',
        'is_fayda_verified',
      ],
    },
    { model: ListingImage, as: 'images' },
  ]

  const sourceListing = await Listing.findOne({
    where: { id: listingId, status: 'ACTIVE' },
    include: listingIncludes,
  })

  if (!sourceListing) {
    // Source not found or not active — return popular fallback
    const fallback = await fetchFallbackCandidates(safeLimit)
    return fallback.slice(0, safeLimit).map((listing) => ({
      listing,
      score: 0,
      reason: 'Popular on Vintage',
    }))
  }

  const source = formatListing(sourceListing)

  // Build a candidate pool for similar listings
  const profile: UserProfile = {
    topCategoryIds: [source.category.id],
    minPrice: null,
    maxPrice: null,
    preferredCity: source.city,
    preferredSubCity: source.subCity,
    preferredNeighborhood: source.neighborhood,
    preferredCondition: source.condition,
    recentSearchTerms: [],
    notInterestedListingIds: [],
    hasFavoriteSignals: false,
  }

  const candidates = await fetchCandidates(profile, [listingId], MAX_CANDIDATES)

  if (candidates.length === 0) {
    return []
  }

  const scored = scoreForSimilarity(candidates, source, safeLimit)
  return scored.map(({ listing, score, reason }) => ({ listing, score, reason }))
}
