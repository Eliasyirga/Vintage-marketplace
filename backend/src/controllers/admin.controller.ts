import type { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import * as reportService from '../services/report.service'
import * as verificationService from '../services/verification.service'
import * as reviewService from '../services/review.service'
import type { ReportStatus, ReportPriority } from '../models/Report'
import type { UserStatus } from '../types/auth.types'

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getDashboardStats()
    res.json({ success: true, data: { stats } })
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
    })
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

    const user = await adminService.updateUserStatus(
      userId,
      adminId,
      status as UserStatus,
      reason ? String(reason) : undefined,
    )

    await adminService.createAuditLog({
      adminId,
      action: `USER_${status}`,
      targetType: 'USER',
      targetId: user.id,
      reason: reason ? String(reason) : undefined,
    })

    res.json({ success: true, message: `User status updated to ${status}.`, data: { userId: user.id, status: user.status } })
  } catch (err) {
    next(err)
  }
}

// ── Listings ───────────────────────────────────────────────────────────────────

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getListingsAdmin({
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

export async function updateListingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const listingId = String(req.params.id)
    const { status, reason } = req.body

    if (!status) {
      res.status(400).json({ success: false, message: 'status is required.' })
      return
    }

    const listing = await adminService.updateListingStatus(listingId, String(status))

    await adminService.createAuditLog({
      adminId,
      action: status === 'REMOVED' ? 'LISTING_REMOVED' : `LISTING_${status}`,
      targetType: 'LISTING',
      targetId: listing.id,
      reason: reason ? String(reason) : undefined,
    })

    res.json({ success: true, message: `Listing status updated to ${status}.`, data: { listingId: listing.id, status: listing.status } })
  } catch (err) {
    next(err)
  }
}

// ── Verifications ──────────────────────────────────────────────────────────────

export async function getVerifications(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await verificationService.getPendingVerifications({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      status: req.query.status ? (String(req.query.status) as any) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function approveVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const verificationId = String(req.params.id)
    const verification = await verificationService.approveVerification(verificationId, adminId)

    await adminService.createAuditLog({
      adminId,
      action: 'VERIFICATION_APPROVED',
      targetType: 'VERIFICATION',
      targetId: verificationId,
      metadata: { verificationType: verification.verificationType },
    })

    res.json({ success: true, message: 'Verification approved.', data: { verification } })
  } catch (err) {
    next(err)
  }
}

export async function rejectVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id
    const verificationId = String(req.params.id)
    const { reason } = req.body

    const verification = await verificationService.rejectVerification(
      verificationId,
      adminId,
      String(reason || ''),
    )

    await adminService.createAuditLog({
      adminId,
      action: 'VERIFICATION_REJECTED',
      targetType: 'VERIFICATION',
      targetId: verificationId,
      reason: reason ? String(reason) : undefined,
      metadata: { verificationType: verification.verificationType },
    })

    res.json({ success: true, message: 'Verification rejected.', data: { verification } })
  } catch (err) {
    next(err)
  }
}

// ── Reviews ────────────────────────────────────────────────────────────────────

export async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewService.getAllReviewsAdmin({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      sellerId: req.query.sellerId ? String(req.query.sellerId) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Audit Logs ─────────────────────────────────────────────────────────────────

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getAuditLogs({
      page: parseInt(String(req.query.page ?? '1')) || 1,
      limit: parseInt(String(req.query.limit ?? '20')) || 20,
      adminId: req.query.adminId ? String(req.query.adminId) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
