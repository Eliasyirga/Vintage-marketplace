/**
 * Recommendation Scoring Engine
 *
 * Pure functions — no DB calls, no side effects.
 * Each function returns a value in [0, 1] which is then multiplied by its weight.
 *
 * Final score = sum of (componentScore * weight)
 * This is easy to explain to technical judges:
 *   "We score each listing on category match, price similarity, location,
 *    condition preference, behavior signals, popularity, and freshness."
 */

import {
  WEIGHTS,
  HALF_LIFE_DAYS,
  LOCATION_SCORES,
  CONDITION_ORDER,
  POPULARITY_VIEW_CAP,
  NOT_INTERESTED_PENALTY,
} from '../config/recommendation.config'
import type { SafeListing } from '../types/listing.types'
import type { UserProfile } from './recommendation.candidates'

export interface ScoredListing {
  listing: SafeListing
  score: number
  reason: string
}

// ── Individual scoring components ─────────────────────────────────────────────

/**
 * Category match: 1.0 if first category match, 0.5 if second, etc.
 * Uses the user's ranked category list.
 */
function categoryScore(listing: SafeListing, profile: UserProfile): number {
  const idx = profile.topCategoryIds.indexOf(listing.category.id)
  if (idx === -1) return 0
  // Decay by rank: rank 0 → 1.0, rank 1 → 0.75, rank 2 → 0.5, rank 3+ → 0.25
  return Math.max(0.25, 1.0 - idx * 0.25)
}

/**
 * Price similarity: normalized by how far the listing price is from the user's
 * typical price range. Returns 1.0 if inside range, drops off smoothly outside.
 */
function priceScore(listing: SafeListing, profile: UserProfile): number {
  if (profile.minPrice === null || profile.maxPrice === null) return 0.5 // neutral
  const price = listing.price
  const mid = (profile.minPrice + profile.maxPrice) / 2
  const range = Math.max(profile.maxPrice - profile.minPrice, 1)

  if (price >= profile.minPrice && price <= profile.maxPrice) return 1.0
  // Outside range: score drops based on how many "range widths" away it is
  const distanceFactor = Math.abs(price - mid) / range
  return Math.max(0, 1 - distanceFactor * 0.5)
}

/**
 * Location match: neighborhood > sub_city > city > other
 */
function locationScore(listing: SafeListing, profile: UserProfile): number {
  if (!profile.preferredCity) return 0.4 // neutral if no location preference

  const cityMatch =
    listing.city.toLowerCase() === profile.preferredCity.toLowerCase()
  if (!cityMatch) return LOCATION_SCORES.DIFFERENT

  const subCityMatch =
    profile.preferredSubCity &&
    listing.subCity &&
    listing.subCity.toLowerCase() === profile.preferredSubCity.toLowerCase()

  const neighborhoodMatch =
    subCityMatch &&
    profile.preferredNeighborhood &&
    listing.neighborhood &&
    listing.neighborhood.toLowerCase() === profile.preferredNeighborhood.toLowerCase()

  if (neighborhoodMatch) return LOCATION_SCORES.SAME_NEIGHBORHOOD
  if (subCityMatch) return LOCATION_SCORES.SAME_SUB_CITY
  return LOCATION_SCORES.SAME_CITY
}

/**
 * Condition match: 1.0 for exact match, declining for adjacent conditions.
 */
function conditionScore(listing: SafeListing, profile: UserProfile): number {
  if (!profile.preferredCondition) return 0.5 // neutral
  const userIdx = CONDITION_ORDER.indexOf(profile.preferredCondition)
  const listingIdx = CONDITION_ORDER.indexOf(listing.condition)
  if (userIdx === -1 || listingIdx === -1) return 0.5
  const distance = Math.abs(userIdx - listingIdx)
  // 0 away → 1.0, 1 away → 0.7, 2 away → 0.4, 3+ → 0.1
  return Math.max(0.1, 1.0 - distance * 0.3)
}

/**
 * Popularity score: normalized by POPULARITY_VIEW_CAP.
 */
function popularityScore(listing: SafeListing): number {
  return Math.min(listing.viewCount / POPULARITY_VIEW_CAP, 1.0)
}

/**
 * Freshness score: exponential decay from published_at.
 * Very recent listings score close to 1.0; older ones decay smoothly.
 * Formula: exp(-daysSince / HALF_LIFE_DAYS)
 */
function freshnessScore(listing: SafeListing): number {
  const publishedAt = listing.publishedAt
    ? new Date(listing.publishedAt)
    : new Date(listing.createdAt)
  const daysSince = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
  return Math.exp(-daysSince / HALF_LIFE_DAYS)
}

/**
 * Search term match: boosts listings whose title/description match recent searches.
 */
function searchTermScore(listing: SafeListing, profile: UserProfile): number {
  if (!profile.recentSearchTerms.length) return 0.5
  const haystack = `${listing.title} ${listing.description} ${listing.category.name}`.toLowerCase()
  let best = 0
  for (const term of profile.recentSearchTerms) {
    if (haystack.includes(term)) {
      best = Math.max(best, 1.0)
    } else if (term.split(/\s+/).some((word) => word.length > 2 && haystack.includes(word))) {
      best = Math.max(best, 0.6)
    }
  }
  return best || 0.2
}

/**
 * Behavior score: affinity based on user's top interacted categories.
 * 1.0 = strong affinity, 0 = no interaction.
 */
function behaviorScore(listing: SafeListing, profile: UserProfile): number {
  // Primary signal: is this category in the user's top 2?
  const idx = profile.topCategoryIds.indexOf(listing.category.id)
  if (idx === -1) return 0
  if (idx === 0) return 1.0
  if (idx === 1) return 0.7
  return 0.4
}

// ── Reason string generation ───────────────────────────────────────────────────

function buildReason(listing: SafeListing, profile: UserProfile): string {
  const catIdx = profile.topCategoryIds.indexOf(listing.category.id)

  if (profile.recentSearchTerms.length) {
    const haystack = `${listing.title} ${listing.description}`.toLowerCase()
    const matchedTerm = profile.recentSearchTerms.find((term) => haystack.includes(term))
    if (matchedTerm) {
      return `Based on your search for "${matchedTerm}"`
    }
  }

  if (profile.hasFavoriteSignals && catIdx !== -1) {
    return `Similar to items you saved`
  }

  if (catIdx === 0) {
    return `Because you browse ${listing.category.name}`
  }
  if (catIdx !== -1) {
    return `Because you viewed similar ${listing.category.name.toLowerCase()}`
  }

  const cityMatch =
    profile.preferredCity &&
    listing.city.toLowerCase() === profile.preferredCity.toLowerCase()
  if (cityMatch) return `Popular near you`

  if (profile.minPrice !== null && profile.maxPrice !== null) {
    if (listing.price >= profile.minPrice && listing.price <= profile.maxPrice) {
      return `Similar price range`
    }
  }

  return `Based on your recent activity`
}

// ── Main scoring function ──────────────────────────────────────────────────────

/**
 * Score a single listing against a user profile.
 * Returns total score (higher = more relevant) and a human-readable reason.
 */
export function scoreListing(listing: SafeListing, profile: UserProfile): ScoredListing {
  const catScore = categoryScore(listing, profile)
  const pScore = priceScore(listing, profile)
  const locScore = locationScore(listing, profile)
  const condScore = conditionScore(listing, profile)
  const behScore = behaviorScore(listing, profile)
  const popScore = popularityScore(listing)
  const freshScore = freshnessScore(listing)
  const searchScore = searchTermScore(listing, profile)

  let total =
    catScore * WEIGHTS.CATEGORY +
    pScore * WEIGHTS.PRICE +
    locScore * WEIGHTS.LOCATION +
    condScore * WEIGHTS.CONDITION +
    behScore * WEIGHTS.BEHAVIOR +
    popScore * WEIGHTS.POPULARITY +
    freshScore * WEIGHTS.FRESHNESS +
    searchScore * WEIGHTS.SEARCH

  if (profile.notInterestedListingIds.includes(listing.id)) {
    total *= NOT_INTERESTED_PENALTY
  }

  return {
    listing,
    score: total,
    reason: buildReason(listing, profile),
  }
}

/**
 * Score all candidates and return top N with diversity enforcement.
 * Diversity: no more than MAX_PER_CATEGORY listings from the same category.
 */
export function rankAndDiversify(
  candidates: SafeListing[],
  profile: UserProfile,
  limit: number,
  maxPerCategory: number,
): ScoredListing[] {
  // Score all candidates
  const scored = candidates.map((listing) => scoreListing(listing, profile))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Apply diversity constraint + deduplicate by listing ID
  const categoryCount: Record<string, number> = {}
  const seenIds = new Set<string>()
  const result: ScoredListing[] = []

  for (const item of scored) {
    if (seenIds.has(item.listing.id)) continue
    const catId = item.listing.category.id
    const count = categoryCount[catId] ?? 0
    if (count < maxPerCategory) {
      categoryCount[catId] = count + 1
      seenIds.add(item.listing.id)
      result.push(item)
    }
    if (result.length >= limit) break
  }

  return result
}

/**
 * Score candidates for "Similar Products" — purely feature-based, no user profile.
 * Uses the source listing's own fields as the reference point.
 */
export function scoreForSimilarity(
  candidates: SafeListing[],
  sourceListing: SafeListing,
  limit: number,
): ScoredListing[] {
  // Build a synthetic profile from the source listing
  const syntheticProfile: UserProfile = {
    topCategoryIds: [sourceListing.category.id],
    minPrice: sourceListing.price * 0.5,
    maxPrice: sourceListing.price * 1.5,
    preferredCity: sourceListing.city,
    preferredSubCity: sourceListing.subCity,
    preferredNeighborhood: sourceListing.neighborhood,
    preferredCondition: sourceListing.condition,
    recentSearchTerms: [],
    notInterestedListingIds: [],
    hasFavoriteSignals: false,
  }

  const scored = candidates
    .filter((c) => c.id !== sourceListing.id)
    .map((listing) => ({
      ...scoreListing(listing, syntheticProfile),
      reason: `Similar to this listing`,
    }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}
