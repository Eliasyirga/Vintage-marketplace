import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import * as adminController from '../controllers/admin.controller'

const router = Router()

// Every admin route requires authentication + ADMIN role
const requireAdmin = [requireAuth, authorizeRoles('ADMIN')]

// ── Dashboard & Analytics ──────────────────────────────────────────────────────
router.get('/dashboard/stats', ...requireAdmin, adminController.getDashboardStats)
router.get('/analytics/timeseries', ...requireAdmin, adminController.getTimeseriesAnalytics)
router.get('/analytics/sellers', ...requireAdmin, adminController.getSellerAnalytics)
router.get('/analytics/risk', ...requireAdmin, adminController.getRiskSignals)

// ── Global Search ─────────────────────────────────────────────────────────────
router.get('/search', ...requireAdmin, adminController.globalSearch)

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', ...requireAdmin, adminController.getAdminNotifications)

// ── System Settings & Health ──────────────────────────────────────────────────
router.get('/settings', ...requireAdmin, adminController.getSystemSettings)

// ── Reports ──────────────────────────────────────────────────────────────────
router.get('/reports', ...requireAdmin, adminController.getReports)
router.get('/reports/:id', ...requireAdmin, adminController.getReportById)
router.patch('/reports/:id', ...requireAdmin, adminController.updateReport)

// ── Users ────────────────────────────────────────────────────────────────────
router.get('/users', ...requireAdmin, adminController.getUsers)
router.get('/users/:id/details', ...requireAdmin, adminController.getUserDetails)
router.patch('/users/:id/status', ...requireAdmin, adminController.updateUserStatus)

// ── Listings ─────────────────────────────────────────────────────────────────
router.get('/listings', ...requireAdmin, adminController.getListings)
router.patch('/listings/:id/status', ...requireAdmin, adminController.updateListingStatus)

// ── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', ...requireAdmin, adminController.getOrders)
router.get('/orders/:id', ...requireAdmin, adminController.getOrderById)

// ── Payments (Chapa Gateway) ─────────────────────────────────────────────────
router.get('/payments', ...requireAdmin, adminController.getPayments)

// ── Businesses ────────────────────────────────────────────────────────────────
router.get('/businesses', ...requireAdmin, adminController.getBusinesses)
router.patch('/businesses/:id/status', ...requireAdmin, adminController.updateBusinessStatus)

// ── Verifications ─────────────────────────────────────────────────────────────
router.get('/verifications', ...requireAdmin, adminController.getVerifications)
router.patch('/verifications/:id/approve', ...requireAdmin, adminController.approveVerification)
router.patch('/verifications/:id/reject', ...requireAdmin, adminController.rejectVerification)

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews', ...requireAdmin, adminController.getReviews)

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', ...requireAdmin, adminController.getAuditLogs)

export default router

