import { Op } from 'sequelize'
import { Listing, Entitlement, User, Category, ListingImage } from '../models'
import { formatListing } from './listing.service'
import type { SafeListing } from '../types/listing.types'

const listingIncludes = [
  {
    model: Category,
    as: 'category',
    attributes: ['id', 'name', 'slug', 'description', 'image'],
  },
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

/**
 * Retrieve Fair-Ranked Featured Listings.
 * Constraints:
 * 1. Only active listings with active FEATURED entitlement.
 * 2. Maximum 2 items per seller to prevent monopoly.
 * 3. Freshness and relevance balanced.
 */
export async function getFeaturedListings(limit = 8): Promise<SafeListing[]> {
  const now = new Date()

  // 1. Find all active featured entitlements
  const entitlements = await Entitlement.findAll({
    where: {
      type: 'FEATURED',
      status: 'ACTIVE',
      listing_id: { [Op.ne]: null },
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
    },
    order: [['created_at', 'DESC']],
    limit: limit * 3, // Candidate pool
  })

  const listingIds = entitlements
    .map((e) => e.listing_id)
    .filter((id): id is string => id !== null)

  if (listingIds.length === 0) {
    return []
  }

  // 2. Fetch the listings
  const listings = await Listing.findAll({
    where: {
      id: { [Op.in]: listingIds },
      status: 'ACTIVE',
    },
    include: listingIncludes,
    order: [['created_at', 'DESC']],
  })

  // 3. Apply Fair Seller Diversity: max 2 per seller
  const sellerCounts: Record<string, number> = {}
  const selected: SafeListing[] = []

  for (const listing of listings) {
    const sellerId = listing.seller_id
    const count = sellerCounts[sellerId] ?? 0
    if (count < 2) {
      sellerCounts[sellerId] = count + 1
      selected.push(formatListing(listing))
    }
    if (selected.length >= limit) break
  }

  return selected
}

/**
 * Get map of currently boosted listing IDs with their boost multipliers
 */
export async function getActiveBoostedListingMap(): Promise<Map<string, number>> {
  const now = new Date()
  const entitlements = await Entitlement.findAll({
    where: {
      type: 'BOOST',
      status: 'ACTIVE',
      listing_id: { [Op.ne]: null },
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
    },
  })

  const boostMap = new Map<string, number>()
  for (const e of entitlements) {
    if (!e.listing_id) continue
    if (!e.expires_at) {
      boostMap.set(e.listing_id, 0.25)
      continue
    }

    const start = new Date(e.start_at).getTime()
    const end = new Date(e.expires_at).getTime()
    const remaining = Math.max(end - now.getTime(), 0)
    const ratio = remaining / Math.max(end - start, 1)
    const score = Math.max(0.05, ratio * 0.35)
    boostMap.set(e.listing_id, score)
  }

  return boostMap
}
