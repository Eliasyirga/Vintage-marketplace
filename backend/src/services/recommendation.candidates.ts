import { Op } from 'sequelize'
import { Listing, Category, User, ListingImage } from '../models'
import type { SafeListing } from '../types/listing.types'
import { formatListing } from './listing.service'
import { MAX_CANDIDATES } from '../config/recommendation.config'

export interface UserProfile {
  /** Category IDs the user has interacted with, ordered by frequency */
  topCategoryIds: string[]
  /** Estimated typical min price (10th percentile of interacted listing prices) */
  minPrice: number | null
  /** Estimated typical max price (90th percentile of interacted listing prices) */
  maxPrice: number | null
  /** Preferred city based on interaction history */
  preferredCity: string | null
  /** Preferred sub_city */
  preferredSubCity: string | null
  /** Preferred neighborhood */
  preferredNeighborhood: string | null
  /** Preferred condition based on most frequently interacted */
  preferredCondition: string | null
  /** Recent search terms (decayed, deduplicated) */
  recentSearchTerms: string[]
  /** Listing IDs the user marked as not interested */
  notInterestedListingIds: string[]
  /** Whether profile was built primarily from favorites */
  hasFavoriteSignals: boolean
}

/**
 * Fetch a candidate pool of active listings from the database.
 *
 * Strategy: Start with listings from the user's top categories, then pad with
 * popular recent listings from other categories if the pool is small.
 * All heavy filtering happens in DB — we only score a capped number in Node.js.
 */
export async function fetchCandidates(
  profile: UserProfile,
  excludeIds: string[],
  limit: number = MAX_CANDIDATES,
): Promise<SafeListing[]> {
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

  const safeExclude = excludeIds.filter(Boolean)
  const whereBase: Record<string, unknown> = { status: 'ACTIVE' }
  if (safeExclude.length > 0) {
    whereBase.id = { [Op.notIn]: safeExclude }
  }

  // ── Phase 1: Listings from user's top categories ─────────────────────────
  let categoryListings: Listing[] = []
  if (profile.topCategoryIds.length > 0) {
    categoryListings = await Listing.findAll({
      where: {
        ...whereBase,
        category_id: { [Op.in]: profile.topCategoryIds },
      } as any,
      include: listingIncludes,
      order: [
        ['published_at', 'DESC'],
        ['view_count', 'DESC'],
      ],
      limit: Math.ceil(limit * 0.75), // 75% of candidates from matching categories
    })
  }

  // ── Phase 2: Pad with popular recent listings from any category ──────────
  const alreadyFetched = new Set([
    ...safeExclude,
    ...categoryListings.map((l) => l.id),
  ])

  const padLimit = limit - categoryListings.length
  let popularListings: Listing[] = []
  if (padLimit > 0) {
    popularListings = await Listing.findAll({
      where: {
        ...whereBase,
        id: { [Op.notIn]: Array.from(alreadyFetched) },
      } as any,
      include: listingIncludes,
      order: [
        ['view_count', 'DESC'],
        ['published_at', 'DESC'],
      ],
      limit: padLimit,
    })
  }

  const combined = [...categoryListings, ...popularListings]
  return combined.map((l) => formatListing(l))
}

/**
 * For cold-start / guest: return popular and recently published active listings.
 */
export async function fetchFallbackCandidates(limit: number): Promise<SafeListing[]> {
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

  // 50% popular, 50% newest — diversity for cold start
  const half = Math.ceil(limit / 2)

  const [popular, newest] = await Promise.all([
    Listing.findAll({
      where: { status: 'ACTIVE' },
      include: listingIncludes,
      order: [['view_count', 'DESC']],
      limit: half,
    }),
    Listing.findAll({
      where: { status: 'ACTIVE' },
      include: listingIncludes,
      order: [['published_at', 'DESC']],
      limit: half,
    }),
  ])

  // Deduplicate
  const seen = new Set<string>()
  const combined: Listing[] = []
  for (const listing of [...popular, ...newest]) {
    if (!seen.has(listing.id)) {
      seen.add(listing.id)
      combined.push(listing)
    }
  }

  return combined.slice(0, limit).map((l) => formatListing(l))
}
