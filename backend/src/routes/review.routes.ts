import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as reviewController from '../controllers/review.controller'

const router = Router()

// POST /api/reviews — authenticated buyers submit a review
router.post('/', requireAuth, reviewController.createReview)

// GET /api/reviews/check/:listingId — check if current user reviewed this listing
router.get('/check/:listingId', requireAuth, reviewController.checkUserReviewedListing)

export default router
