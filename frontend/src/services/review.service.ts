import api from './api'
import type { CreateReviewInput, PaginatedReviews, RatingSummary, ReviewItem } from '../types/review'

export async function createReview(data: CreateReviewInput): Promise<ReviewItem> {
  const response = await api.post('/reviews', data)
  return response.data.data.review
}

export async function getSellerReviews(
  sellerId: string,
  page = 1,
  limit = 10,
): Promise<PaginatedReviews> {
  const response = await api.get(`/sellers/${sellerId}/reviews`, {
    params: { page, limit },
  })
  return response.data.data
}

export async function getSellerRatingSummary(sellerId: string): Promise<RatingSummary> {
  const response = await api.get(`/sellers/${sellerId}/rating`)
  return response.data.data.summary
}

export async function checkUserReviewedListing(listingId: string): Promise<boolean> {
  const response = await api.get(`/reviews/check/${listingId}`)
  return response.data.data.hasReviewed
}
