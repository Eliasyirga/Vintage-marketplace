import type { Listing } from './listing'

export interface RecentlyViewedItem {
  id: string
  listingId: string
  viewedAt: string
  listing: Listing
}
