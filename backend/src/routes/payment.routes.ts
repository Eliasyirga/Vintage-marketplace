import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import * as paymentController from '../controllers/payment.controller'

const router = Router()

// Initialize a payment (User)
router.post('/initialize', requireAuth, paymentController.initializePayment)

// Verify payment status (User / Return callback)
router.get('/verify/:reference', requireAuth, paymentController.verifyPayment)

// My Payment history (User)
router.get('/my-history', requireAuth, paymentController.getMyPayments)

// Provider Webhook / Callback Endpoint (No direct user auth; verified server-side)
router.post('/chapa/callback', (req, res, next) => {
  ;(req.params as any).provider = 'CHAPA'
  paymentController.handleWebhook(req, res, next)
})
router.post('/webhook/:provider', paymentController.handleWebhook)

// Development/Sandbox Payment Simulator
router.post('/mock/simulate', requireAuth, paymentController.simulateMockPayment)

// Admin refund endpoint
router.post('/refund/:id', requireAuth, authorizeRoles('ADMIN'), paymentController.refundPaymentAdmin)

export default router
