import api from './api'
import type { FavoritesResponse } from '../types/favorite'

export async function addFavorite(listingId: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post(`/favorites/${listingId}`)
  return res.data
}

export async function removeFavorite(listingId: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete(`/favorites/${listingId}`)
  return res.data
}

export async function checkFavorite(listingId: string): Promise<boolean> {
  try {
    const res = await api.get(`/favorites/check/${listingId}`)
    return !!res.data.isFavorite
  } catch {
    return false
  }
}

export async function batchCheckFavorites(listingIds: string[]): Promise<Record<string, boolean>> {
  if (listingIds.length === 0) return {}
  try {
    const res = await api.post('/favorites/batch-check', { listingIds })
    return res.data.data || {}
  } catch {
    return {}
  }
}

export async function getMyFavorites(page = 1, limit = 20): Promise<FavoritesResponse> {
  const res = await api.get('/favorites', { params: { page, limit } })
  return res.data
}
