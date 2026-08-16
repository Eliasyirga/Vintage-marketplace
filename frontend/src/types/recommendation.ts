import type { Listing } from './listing'

export interface RecommendationItem {
  listing: Listing
  score: number
  reason: string
}

export interface RecommendationResponse {
  items: RecommendationItem[]
  isPersonalized: boolean
  fallbackReason?: 'trending' | 'new_user' | 'no_candidates'
}

export interface SimilarProductsResponse {
  items: RecommendationItem[]
}
