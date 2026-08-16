import { Op, fn, col, literal } from 'sequelize'
import { Review, User, Listing, SellerProfile } from '../models'
import { AppError } from '../middleware/error.middleware'

export interface CreateReviewInput {
  reviewerId: string
  sellerId: string
  listingId: string
  rating: number
  comment: string
}

export interface ReviewFilters {
  page?: number
  limit?: number
}

/**
 * Create a review for a seller.
 * Security rules enforced here (not in controller):
 *  - Reviewer cannot be the seller
 *  - One review per (reviewer, listing)
 *  - Rating must be integer 1-5
 *  - Seller and listing must both exist
 */
export async function createReview(input: CreateReviewInput) {
  const { reviewerId, sellerId, listingId, rating, comment } = input

  // Guard: cannot review yourself
  if (reviewerId === sellerId) {
    throw new AppError('You cannot review yourself.', 400)
  }

  // Guard: rating must be integer 1-5
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError('Rating must be an integer between 1 and 5.', 400)
  }

  // Guard: seller must exist
  const seller = await User.findByPk(sellerId, { attributes: ['id', 'status'] })
  if (!seller) throw new AppError('Seller not found.', 404)

  // Guard: listing must belong to that seller
  const listing = await Listing.findOne({
    where: { id: listingId, seller_id: sellerId },
    attributes: ['id'],
  })
  if (!listing) throw new AppError('Listing not found for this seller.', 404)

  // Guard: one review per (reviewer, listing) — enforced in DB too, but friendly message here
  const existing = await Review.findOne({
    where: { reviewer_id: reviewerId, listing_id: listingId },
    attributes: ['id'],
  })
  if (existing) {
    throw new AppError('You have already reviewed this listing.', 409)
  }

  const review = await Review.create({
    reviewer_id: reviewerId,
    seller_id: sellerId,
    listing_id: listingId,
    rating,
    comment: comment.trim(),
  })

  return review
}

/**
 * Get paginated reviews for a seller with reviewer public info.
 * Never returns private reviewer data.
 */
export async function getSellerReviews(sellerId: string, filters: ReviewFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10))
  const offset = (page - 1) * limit

  const { count, rows } = await Review.findAndCountAll({
    where: { seller_id: sellerId },
    include: [
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'full_name', 'avatar_url'],
        include: [
          {
            model: SellerProfile,
            as: 'sellerProfile',
            attributes: ['display_name', 'profile_image'],
            required: false,
          },
        ],
      },
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  const reviews = rows.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    listing: r.listing ? { id: r.listing.id, title: r.listing.title } : null,
    reviewer: {
      id: r.reviewer.id,
      displayName: r.reviewer.sellerProfile?.display_name || r.reviewer.full_name,
      avatarUrl: r.reviewer.sellerProfile?.profile_image || r.reviewer.avatar_url || null,
    },
  }))

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

/**
 * Calculate the aggregated rating summary for a seller.
 * Uses DB-level aggregation — no JS math on full datasets.
 */
export async function getSellerRatingSummary(sellerId: string) {
  const result = await Review.findOne({
    where: { seller_id: sellerId },
    attributes: [
      [fn('COUNT', col('id')), 'totalReviews'],
      [fn('AVG', col('rating')), 'avgRating'],
      [fn('SUM', literal(`CASE WHEN rating = 5 THEN 1 ELSE 0 END`)), 'five'],
      [fn('SUM', literal(`CASE WHEN rating = 4 THEN 1 ELSE 0 END`)), 'four'],
      [fn('SUM', literal(`CASE WHEN rating = 3 THEN 1 ELSE 0 END`)), 'three'],
      [fn('SUM', literal(`CASE WHEN rating = 2 THEN 1 ELSE 0 END`)), 'two'],
      [fn('SUM', literal(`CASE WHEN rating = 1 THEN 1 ELSE 0 END`)), 'one'],
    ],
    raw: true,
  }) as any

  const totalReviews = parseInt(result?.totalReviews ?? '0', 10)
  const avgRating = totalReviews > 0 ? parseFloat(parseFloat(result.avgRating).toFixed(1)) : 0

  return {
    totalReviews,
    avgRating,
    distribution: {
      5: parseInt(result?.five ?? '0', 10),
      4: parseInt(result?.four ?? '0', 10),
      3: parseInt(result?.three ?? '0', 10),
      2: parseInt(result?.two ?? '0', 10),
      1: parseInt(result?.one ?? '0', 10),
    },
  }
}

/**
 * Check if a user has already reviewed a specific listing.
 */
export async function hasUserReviewedListing(reviewerId: string, listingId: string) {
  const review = await Review.findOne({
    where: { reviewer_id: reviewerId, listing_id: listingId },
    attributes: ['id'],
  })
  return !!review
}

/**
 * Admin: get all reviews with optional filters and pagination.
 */
export async function getAllReviewsAdmin(filters: { page?: number; limit?: number; sellerId?: string }) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20))
  const offset = (page - 1) * limit
  const where: any = {}
  if (filters.sellerId) where.seller_id = filters.sellerId

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, as: 'reviewer', attributes: ['id', 'full_name'] },
      { model: User, as: 'seller', attributes: ['id', 'full_name'] },
      { model: Listing, as: 'listing', attributes: ['id', 'title'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    reviews: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}
