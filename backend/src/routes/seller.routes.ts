import { Router } from 'express'
import * as sellerController from '../controllers/seller.controller'
import * as reviewController from '../controllers/review.controller'
import { requireAuth } from '../middleware/auth.middleware'
import { listingMutationLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────────────────

/** GET /api/sellers/:sellerId — public seller profile */
router.get('/:sellerId', sellerController.getPublicSellerProfile)

/** GET /api/sellers/:sellerId/listings — seller's active listings (public) */
router.get('/:sellerId/listings', sellerController.getSellerPublicListings)

/** GET /api/sellers/:sellerId/reviews — seller's paginated reviews with rating summary */
router.get('/:sellerId/reviews', reviewController.getSellerReviews)

/** GET /api/sellers/:sellerId/rating — seller rating summary only (no review list) */
router.get('/:sellerId/rating', reviewController.getSellerRatingSummary)

export default router

