import { Router } from 'express'
import * as recentlyViewedController from '../controllers/recentlyViewed.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', requireAuth, recentlyViewedController.getRecentlyViewed)
router.post('/:listingId', requireAuth, recentlyViewedController.recordRecentlyViewed)
router.delete('/', requireAuth, recentlyViewedController.clearRecentlyViewed)

export default router
