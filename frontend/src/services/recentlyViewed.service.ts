import api from './api'
import type { Listing } from '../types/listing'
import {
  getGuestRecentlyViewed,
  recordGuestRecentlyViewed,
  clearGuestRecentlyViewed,
} from '../utils/recentViewsStorage'

export async function getRecentlyViewed(
  isAuthenticated: boolean,
  limit = 20,
): Promise<Listing[]> {
  if (isAuthenticated) {
    try {
      const res = await api.get('/recently-viewed', { params: { limit } })
      return res.data.data || []
    } catch {
      return getGuestRecentlyViewed()
    }
  }
  return getGuestRecentlyViewed()
}

export async function recordRecentlyViewed(
  listing: Listing,
  isAuthenticated: boolean,
): Promise<void> {
  // Always store in guest localStorage so offline/guest switch remains smooth
  recordGuestRecentlyViewed(listing)

  if (isAuthenticated) {
    try {
      await api.post(`/recently-viewed/${listing.id}`)
    } catch {
      // Silently ignore background tracking error
    }
  }
}

export async function clearRecentlyViewed(isAuthenticated: boolean): Promise<void> {
  clearGuestRecentlyViewed()
  if (isAuthenticated) {
    try {
      await api.delete('/recently-viewed')
    } catch {
      // Silently handle
    }
  }
}
