import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import * as adminController from '../controllers/admin.controller'

const router = Router()

// Every admin route requires authentication + ADMIN role
// authorizeRoles('ADMIN') returns 403 if role !== ADMIN — backend enforced, not just React
const requireAdmin = [requireAuth, authorizeRoles('ADMIN')]

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', ...requireAdmin, adminController.getDashboardStats)

// ── Reports ──────────────────────────────────────────────────────────────────
router.get('/reports', ...requireAdmin, adminController.getReports)
router.get('/reports/:id', ...requireAdmin, adminController.getReportById)
router.patch('/reports/:id', ...requireAdmin, adminController.updateReport)

// ── Users ────────────────────────────────────────────────────────────────────
router.get('/users', ...requireAdmin, adminController.getUsers)
router.patch('/users/:id/status', ...requireAdmin, adminController.updateUserStatus)

// ── Listings ─────────────────────────────────────────────────────────────────
router.get('/listings', ...requireAdmin, adminController.getListings)
router.patch('/listings/:id/status', ...requireAdmin, adminController.updateListingStatus)

// ── Verifications ─────────────────────────────────────────────────────────────
router.get('/verifications', ...requireAdmin, adminController.getVerifications)
router.patch('/verifications/:id/approve', ...requireAdmin, adminController.approveVerification)
router.patch('/verifications/:id/reject', ...requireAdmin, adminController.rejectVerification)

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews', ...requireAdmin, adminController.getReviews)

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', ...requireAdmin, adminController.getAuditLogs)

export default router
