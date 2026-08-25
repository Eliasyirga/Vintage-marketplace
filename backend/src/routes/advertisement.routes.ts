import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import { createAdLimiter, adTrackingLimiter } from '../middleware/rateLimit.middleware'
import { adImageUpload, handleMulterError } from '../middleware/upload.middleware'
import * as adController from '../controllers/advertisement.controller'

const router = Router()

// ── Public routes ────────────────────────────────────────────────────────────
// Single request returns all 3 active slots: { marketplaceBanner, marketplaceFeatured, marketplaceSidebar }
router.get('/active', adController.getActiveSlots)
router.get('/available-placements', adController.getAvailablePlacements)
router.get('/plans', adController.getAdPlans)

// Analytics tracking (rate-limited against abuse)
router.post('/:id/impression', adTrackingLimiter, adController.recordImpression)
router.post('/:id/click', adTrackingLimiter, adController.recordClick)
router.get('/:id/click', adTrackingLimiter, adController.handleClickRedirect)

// ── Advertiser authenticated routes ──────────────────────────────────────────
// createAd accepts multipart/form-data: image file + form fields
router.post(
  '/',
  requireAuth,
  createAdLimiter,
  adImageUpload,
  handleMulterError,
  adController.createAd,
)

router.get('/my', requireAuth, adController.getMyAds)
router.get('/my-ads', requireAuth, adController.getMyAds)  // alias
router.get('/:id', requireAuth, adController.getAdById)

router.patch('/:id/pause', requireAuth, adController.pauseAd)
router.post('/:id/pause', requireAuth, adController.pauseAd)    // backward compat

router.patch('/:id/resume', requireAuth, adController.resumeAd)
router.post('/:id/resume', requireAuth, adController.resumeAd)  // backward compat

router.post('/:id/cancel', requireAuth, adController.cancelAd)
router.patch('/:id/cancel', requireAuth, adController.cancelAd) // backward compat

// ── Admin moderation routes ───────────────────────────────────────────────────
router.get('/admin', requireAuth, authorizeRoles('ADMIN'), adController.getAllAdsAdmin)
router.patch(
  '/admin/:id/approve',
  requireAuth,
  authorizeRoles('ADMIN'),
  adController.approveAdAdmin,
)
router.post(
  '/admin/:id/approve',
  requireAuth,
  authorizeRoles('ADMIN'),
  adController.approveAdAdmin,  // backward compat
)
router.patch(
  '/admin/:id/reject',
  requireAuth,
  authorizeRoles('ADMIN'),
  adController.rejectAdAdmin,
)
router.post(
  '/admin/:id/reject',
  requireAuth,
  authorizeRoles('ADMIN'),
  adController.rejectAdAdmin,   // backward compat
)

export default router
