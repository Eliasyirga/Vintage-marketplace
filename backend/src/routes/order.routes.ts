import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import * as orderController from '../controllers/order.controller'
import {
  buyNowPreflightSchema,
  createOrderSchema,
  cancelOrderSchema,
} from '../validators/order.validator'

const router = Router()

// All order endpoints require authentication
router.use(requireAuth)

// Pre-flight check
router.post(
  '/check-eligibility',
  validate(buyNowPreflightSchema),
  orderController.checkBuyNowEligibility,
)

// Order Creation
router.post('/', validate(createOrderSchema), orderController.createOrder)

// Dashboard lists
router.get('/buyer/my-orders', orderController.getBuyerOrders)
router.get('/seller/my-orders', orderController.getSellerOrders)

// Single order details & timeline
router.get('/:id', orderController.getOrderById)

// Fulfillment actions
router.post('/:id/confirm', orderController.confirmOrder)
router.post('/:id/ready', orderController.markOrderReady)
router.post('/:id/complete', orderController.completeOrder)
router.post('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder)

export default router
