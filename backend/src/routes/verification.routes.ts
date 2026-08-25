import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { faydaVerificationLimiter } from '../middleware/rateLimit.middleware'
import * as verificationController from '../controllers/verification.controller'

const router = Router()

// GET /api/verifications/me — view own verification statuses
router.get('/me', requireAuth, verificationController.getMyVerifications)

// POST /api/verifications/request — request a new verification type (manual review)
router.post('/request', requireAuth, verificationController.requestVerification)

// ── Fayda OIDC Verification ──────────────────────────────────────────────────
// POST /api/verifications/fayda/initiate — create OIDC session and return Fayda consent URL
router.post('/fayda/initiate', requireAuth, faydaVerificationLimiter, verificationController.initiateFayda)

// GET /api/verifications/fayda/callback — Fayda OIDC redirect target (public, validates state & code)
router.get('/fayda/callback', verificationController.faydaCallback)

export default router
