import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import * as monetizationController from '../controllers/monetization.controller'

const router = Router()

// Public plans
router.get('/plans', monetizationController.getPublicPlans)

// Public featured products
router.get('/featured', monetizationController.getFeaturedProducts)

// User active entitlements
router.get('/my-entitlements', requireAuth, monetizationController.getMyEntitlements)

// Admin monetization management
router.get('/admin/stats', requireAuth, authorizeRoles('ADMIN'), monetizationController.getAdminStats)
router.get('/admin/plans', requireAuth, authorizeRoles('ADMIN'), monetizationController.getAdminPlans)
router.post('/admin/plans', requireAuth, authorizeRoles('ADMIN'), monetizationController.createPlanAdmin)
router.patch('/admin/plans/:id', requireAuth, authorizeRoles('ADMIN'), monetizationController.updatePlanAdmin)

export default router
