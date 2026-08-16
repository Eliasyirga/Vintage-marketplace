import type { Listing } from '../types/listing'

const GUEST_RECENT_KEY = 'vintage_recently_viewed'
const MAX_RECENT_ITEMS = 20

export interface GuestRecentListing {
  listingId: string
  viewedAt: number
  listing: Listing
}

export function getGuestRecentlyViewed(): Listing[] {
  try {
    const raw = localStorage.getItem(GUEST_RECENT_KEY)
    if (!raw) return []
    const items: GuestRecentListing[] = JSON.parse(raw)
    return items
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, MAX_RECENT_ITEMS)
      .map((item) => item.listing)
  } catch {
    return []
  }
}

export function recordGuestRecentlyViewed(listing: Listing): void {
  try {
    const raw = localStorage.getItem(GUEST_RECENT_KEY)
    let items: GuestRecentListing[] = raw ? JSON.parse(raw) : []

    // Remove any existing entry for this listing
    items = items.filter((item) => item.listingId !== listing.id)

    // Prepend new entry
    items.unshift({
      listingId: listing.id,
      viewedAt: Date.now(),
      listing,
    })

    // Slice to MAX_RECENT_ITEMS
    items = items.slice(0, MAX_RECENT_ITEMS)

    localStorage.setItem(GUEST_RECENT_KEY, JSON.stringify(items))
  } catch {
    // localStorage may be disabled or full; silently handle
  }
}

export function clearGuestRecentlyViewed(): void {
  try {
    localStorage.removeItem(GUEST_RECENT_KEY)
  } catch {
    // Silently handle
  }
}
