import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as businessController from '../controllers/business.controller'

const router = Router()

router.get('/profile', requireAuth, businessController.getMyBusinessProfile)
router.post('/profile', requireAuth, businessController.updateMyBusinessProfile)
router.patch('/profile', requireAuth, businessController.updateMyBusinessProfile)

export default router
