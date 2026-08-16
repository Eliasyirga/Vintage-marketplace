import { RecentlyViewed, Listing, Category, User, ListingImage } from '../models'
import { formatListing } from './listing.service'
import { trackInteraction } from './interaction.service'
import type { SafeListing } from '../types/listing.types'

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
      'is_face_verified',
    ],
  },
  { model: ListingImage, as: 'images' },
]

const MAX_RECENTLY_VIEWED = 20

export async function recordRecentlyViewed(userId: string, listingId: string): Promise<void> {
  const listing = await Listing.findByPk(listingId)
  if (!listing) return

  const now = new Date()

  // Upsert recently viewed entry
  const existing = await RecentlyViewed.findOne({
    where: { user_id: userId, listing_id: listingId },
  })

  if (existing) {
    existing.viewed_at = now
    await existing.save()
  } else {
    await RecentlyViewed.create({
      user_id: userId,
      listing_id: listingId,
      viewed_at: now,
    })

    // Prune if count exceeds MAX_RECENTLY_VIEWED
    const allUserEntries = await RecentlyViewed.findAll({
      where: { user_id: userId },
      order: [['viewed_at', 'DESC']],
      attributes: ['id'],
    })

    if (allUserEntries.length > MAX_RECENTLY_VIEWED) {
      const idsToDelete = allUserEntries.slice(MAX_RECENTLY_VIEWED).map((e) => e.id)
      await RecentlyViewed.destroy({
        where: { id: idsToDelete },
      })
    }
  }

  trackInteraction(userId, 'VIEW', listingId)
}

export async function getRecentlyViewed(
  userId: string,
  limit = 20,
): Promise<SafeListing[]> {
  const safeLimit = Math.min(MAX_RECENTLY_VIEWED, Math.max(1, limit))

  const entries = await RecentlyViewed.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Listing,
        as: 'listing',
        include: listingIncludes,
        where: { status: 'ACTIVE' }, // Only show active public listings
      },
    ],
    order: [['viewed_at', 'DESC']],
    limit: safeLimit,
  })

  return entries
    .filter((e) => (e as RecentlyViewed & { listing?: Listing }).listing)
    .map((e) => formatListing((e as RecentlyViewed & { listing: Listing }).listing))
}

export async function clearRecentlyViewed(userId: string): Promise<void> {
  await RecentlyViewed.destroy({
    where: { user_id: userId },
  })
}
