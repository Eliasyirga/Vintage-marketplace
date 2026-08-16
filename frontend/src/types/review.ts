export interface ReviewerPublic {
  id: string
  displayName: string
  avatarUrl: string | null
}

export interface ReviewItem {
  id: string
  rating: number
  comment: string
  createdAt: string
  listing?: {
    id: string
    title: string
  } | null
  reviewer: ReviewerPublic
}

export interface RatingSummary {
  totalReviews: number
  avgRating: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface PaginatedReviews {
  reviews: ReviewItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
  }
  summary?: RatingSummary
}

export interface CreateReviewInput {
  sellerId: string
  listingId: string
  rating: number
  comment: string
}
