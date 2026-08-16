import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as analyticsController from '../controllers/sellerAnalytics.controller'

const router = Router()

router.get('/', requireAuth, analyticsController.getMyAnalytics)

export default router
