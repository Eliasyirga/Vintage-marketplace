import { Router } from 'express'
import * as favoriteController from '../controllers/favorite.controller'
import { requireAuth, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', requireAuth, favoriteController.getUserFavorites)
router.get('/check/:listingId', optionalAuth, favoriteController.checkFavoriteStatus)
router.post('/batch-check', optionalAuth, favoriteController.getBatchStatus)
router.post('/:listingId', requireAuth, favoriteController.addFavorite)
router.delete('/:listingId', requireAuth, favoriteController.removeFavorite)

export default router
