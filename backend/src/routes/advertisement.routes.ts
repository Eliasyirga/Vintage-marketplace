import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import { createAdLimiter, adTrackingLimiter } from '../middleware/rateLimit.middleware'
import * as adController from '../controllers/advertisement.controller'

const router = Router()

// ── Public Marketplace Ad Routes ─────────────────────────────────────────────
// Single request returns all 3 active slots: { homeTop, marketplaceMiddle, marketplaceBottom }
router.get('/active', adController.getActiveSlots)
router.get('/available-placements', adController.getAvailablePlacements)
router.get('/plans', adController.getAdPlans)

// Analytics tracking (rate-limited against fraud)
router.post('/:id/impression', adTrackingLimiter, adController.recordImpression)
router.post('/:id/click', adTrackingLimiter, adController.recordClick)
router.get('/:id/click', adTrackingLimiter, adController.handleClickRedirect)

// ── Advertiser Authenticated Routes ──────────────────────────────────────────
router.post('/', requireAuth, createAdLimiter, adController.createAd)
router.get('/my', requireAuth, adController.getMyAds)
router.get('/my-ads', requireAuth, adController.getMyAds)
router.get('/:id', requireAuth, adController.getAdById)
router.post('/:id/pause', requireAuth, adController.pauseAd)
router.post('/:id/resume', requireAuth, adController.resumeAd)
router.post('/:id/cancel', requireAuth, adController.cancelAd)

// ── Admin Moderation Routes ──────────────────────────────────────────────────
router.get('/admin', requireAuth, authorizeRoles('ADMIN'), adController.getAllAdsAdmin)
router.post('/admin/:id/approve', requireAuth, authorizeRoles('ADMIN'), adController.approveAdAdmin)
router.patch('/admin/:id/approve', requireAuth, authorizeRoles('ADMIN'), adController.approveAdAdmin)
router.post('/admin/:id/reject', requireAuth, authorizeRoles('ADMIN'), adController.rejectAdAdmin)
router.patch('/admin/:id/reject', requireAuth, authorizeRoles('ADMIN'), adController.rejectAdAdmin)

export default router
