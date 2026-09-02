import type { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import * as adminAnalyticsService from '../services/adminAnalytics.service'
import * as reportService from '../services/report.service'
import * as verificationService from '../services/verification.service'
import * as reviewService from '../services/review.service'
import type { ReportStatus, ReportPriority } from '../models/Report'
import type { UserStatus } from '../types/auth.types'

// ── Dashboard & Analytics ──────────────────────────────────────────────────────

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminAnalyticsService.getOverviewStats()
    res.json({ success: true, data: { stats } })
  } catch (err) {
    next(err)
  }
}

export async function getTimeseriesAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(String(req.query.days ?? '30')) || 30
    const timeseries = await adminAnalyticsService.getTimeseriesGrowth(days)
    const tiers = await adminAnalyticsService.getAccountTierBreakdown()
    res.json({ success: true, data: { timeseries, tiers } })
  } catch (err) {
    next(err)
  }
}

export async function getRiskSignals(_req: Request, res: Response, next: NextFunction) {
  try {
    const signals = await adminAnalyticsService.getRiskSignals()
    res.json({ success: true, data: { signals } })
  } catch (err) {
    next(err)
  }
}

// ── Reports ────────────────────────────────────────────────────────────────────

export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getReports({
      status: req.query.status ? (String(req.query.status) as ReportStatus) : undefined,
      priority: req.query.priority ? (String(req.query.priority) as ReportPriority) : undefined,
      targetType: req.query.targetType ? (String(req.query.targetType) as any) : undefined,
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const reportId = String(req.params.id)
    const report = await reportService.getReportById(reportId)
    res.json({ success: true, data: { report } })
  } catch (err) {
    next(err)
  }
}

export async function updateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const reportId = String(req.params.id)
    const { status, priority, adminNote } = req.body

    const report = await reportService.updateReport(reportId, adminId, {
      status: status ? (String(status) as ReportStatus) : undefined,
      priority: priority ? (String(priority) as ReportPriority) : undefined,
      adminNote: adminNote !== undefined ? String(adminNote) : undefined,
    })

    // Audit log
    await adminService.createAuditLog({
      adminId,
      action: status ? `REPORT_${status}` : 'REPORT_NOTE_UPDATED',
      targetType: 'REPORT',
      targetId: report.id,
      reason: adminNote ? String(adminNote) : undefined,
      metadata: { status, priority },
    })

    res.json({ success: true, message: 'Report updated.', data: { report: report.toSafeObject() } })
  } catch (err) {
    next(err)
  }
}

// ── Users ──────────────────────────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getUsers({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      search: req.query.search ? String(req.query.search) : undefined,
      status: req.query.status ? (String(req.query.status) as UserStatus) : undefined,
      role: req.query.role ? (String(req.query.role) as 'USER' | 'ADMIN') : undefined,
      verification: req.query.verification ? (String(req.query.verification) as any) : undefined,
      tier: req.query.tier ? (String(req.query.tier) as any) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getUserDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = String(req.params.id)
    const result = await adminService.getUserDetailsAdmin(userId)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const userId = String(req.params.id)
    const { status, reason } = req.body

    if (!status) {
      res.status(400).json({ success: false, message: 'status is required.' })
      return
    }

    const updatedUser = await adminService.updateUserStatus(
      userId,
      adminId,
      status as UserStatus,
      reason ? String(reason) : undefined,
    )

    res.json({
      success: true,
      message: `User status updated to ${status}.`,
      data: { user: updatedUser.toSafeObject() },
    })
  } catch (err) {
    next(err)
  }
}

// ── Listings ─────────────────────────────────────────────────────────────────

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getListingsAdmin({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      search: req.query.search ? String(req.query.search) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      categoryId: req.query.categoryId ? String(req.query.categoryId) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function updateListingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const listingId = String(req.params.id)
    const { status, reason, adminNote } = req.body

    if (!status) {
      res.status(400).json({ success: false, message: 'status is required.' })
      return
    }

    const updated = await adminService.updateListingStatus(
      listingId,
      status,
      adminId,
      reason ? String(reason) : undefined,
      adminNote ? String(adminNote) : undefined,
    )

    res.json({
      success: true,
      message: `Listing status updated to ${status}.`,
      data: { listing: updated.toJSON() },
    })
  } catch (err) {
    next(err)
  }
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getOrdersAdmin({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      search: req.query.search ? String(req.query.search) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      paymentStatus: req.query.paymentStatus ? String(req.query.paymentStatus) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = String(req.params.id)
    const order = await adminService.getOrderByIdAdmin(orderId)
    res.json({ success: true, data: { order } })
  } catch (err) {
    next(err)
  }
}

// ── Payments (Chapa Gateway) ─────────────────────────────────────────────────

export async function getPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getPaymentsAdmin({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      search: req.query.search ? String(req.query.search) : undefined,
      purpose: req.query.purpose ? String(req.query.purpose) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Businesses ────────────────────────────────────────────────────────────────

export async function getBusinesses(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getBusinessesAdmin({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      search: req.query.search ? String(req.query.search) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function updateBusinessStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const businessId = String(req.params.id)
    const { status, reason } = req.body

    const updated = await adminService.updateBusinessStatusAdmin(
      businessId,
      status,
      adminId,
      reason ? String(reason) : undefined,
    )

    res.json({ success: true, message: `Business profile marked as ${status}.`, data: { business: updated } })
  } catch (err) {
    next(err)
  }
}

// ── Verifications ─────────────────────────────────────────────────────────────

export async function getVerifications(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status ? (String(req.query.status) as any) : undefined
    const page = parseInt(String(req.query.page ?? '1')) || 1
    const limit = parseInt(String(req.query.limit ?? '20')) || 20
    const result = await verificationService.getPendingVerifications({ status, page, limit })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function approveVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const id = String(req.params.id)
    const verification = await verificationService.approveVerification(id, adminId)

    await adminService.createAuditLog({
      adminId,
      action: 'VERIFICATION_APPROVED',
      targetType: 'USER_VERIFICATION',
      targetId: id,
    })

    res.json({ success: true, message: 'Verification approved.', data: { verification } })
  } catch (err) {
    next(err)
  }
}

export async function rejectVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const id = String(req.params.id)
    const { reason } = req.body

    const verification = await verificationService.rejectVerification(id, adminId, reason ? String(reason) : 'Rejected by administrator')

    await adminService.createAuditLog({
      adminId,
      action: 'VERIFICATION_REJECTED',
      targetType: 'USER_VERIFICATION',
      targetId: id,
      reason: reason ? String(reason) : 'Rejected by administrator',
    })

    res.json({ success: true, message: 'Verification rejected.', data: { verification } })
  } catch (err) {
    next(err)
  }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(String(req.query.page ?? '1')) || 1
    const limit = parseInt(String(req.query.limit ?? '20')) || 20
    const result = await reviewService.getAllReviewsAdmin({ page, limit })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(String(req.query.page ?? '1')) || 1
    const limit = parseInt(String(req.query.limit ?? '50')) || 50
    const adminId = req.query.adminId ? String(req.query.adminId) : undefined
    const result = await adminService.getAuditLogs({ page, limit, adminId })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Global Search ─────────────────────────────────────────────────────────────

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const query = String(req.query.q ?? req.query.search ?? '')
    const result = await adminService.globalSearch(query)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Seller Analytics ──────────────────────────────────────────────────────────

export async function getSellerAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getSellerAnalytics()
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Admin Notifications ───────────────────────────────────────────────────────

export async function getAdminNotifications(_req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await adminService.getAdminNotifications()
    res.json({ success: true, data: { notifications } })
  } catch (err) {
    next(err)
  }
}

// ── System Operational Settings ───────────────────────────────────────────────

export async function getSystemSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await adminService.getSystemSettings()
    res.json({ success: true, data: { settings } })
  } catch (err) {
    next(err)
  }
}

