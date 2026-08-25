import { Router } from 'express'
import * as listingController from '../controllers/listing.controller'
import * as recommendationController from '../controllers/recommendation.controller'
import { requireAuth, optionalAuth } from '../middleware/auth.middleware'
import {
  listingImagesUpload,
  handleMulterError,
} from '../middleware/upload.middleware'
import {
  createListingLimiter,
  listingMutationLimiter,
} from '../middleware/rateLimit.middleware'

const router = Router()

router.get('/', listingController.getListings)
// /limits/me MUST be registered before /:id to avoid wildcard conflict
router.get('/limits/me', requireAuth, listingController.getListingLimits)
router.get('/:id/similar', recommendationController.getSimilarListings)
router.get('/:id', optionalAuth, listingController.getListingById)

router.post(
  '/',
  requireAuth,
  createListingLimiter,
  listingImagesUpload,
  handleMulterError,
  listingController.createListing,
)

router.patch(
  '/:id',
  requireAuth,
  listingMutationLimiter,
  listingImagesUpload,
  handleMulterError,
  listingController.updateListing,
)

router.patch(
  '/:id/status',
  requireAuth,
  listingMutationLimiter,
  listingController.updateListingStatus,
)

router.delete(
  '/:id',
  requireAuth,
  listingMutationLimiter,
  listingController.deleteListing,
)

export default router
