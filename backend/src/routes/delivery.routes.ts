import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as deliveryController from '../controllers/delivery.controller'

const router = Router()

// Public rate preview
router.get('/estimate', deliveryController.estimateDeliveryFee)

// Authenticated status updates
router.patch('/:id/status', requireAuth, deliveryController.updateDeliveryStatus)

export default router
