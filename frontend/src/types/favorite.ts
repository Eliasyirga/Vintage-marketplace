import type { Listing } from './listing'

export interface FavoriteItem {
  id: string
  createdAt: string
  listing: Listing
}

export interface FavoritesResponse {
  success: boolean
  data: FavoriteItem[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
