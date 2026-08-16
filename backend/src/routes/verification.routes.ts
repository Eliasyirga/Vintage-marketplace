import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as verificationController from '../controllers/verification.controller'

const router = Router()

// GET /api/verifications/me — view own verification statuses
router.get('/me', requireAuth, verificationController.getMyVerifications)

// POST /api/verifications/request — request a new verification type
router.post('/request', requireAuth, verificationController.requestVerification)

export default router
