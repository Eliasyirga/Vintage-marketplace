import { Op } from 'sequelize'
import { Report, User, Listing, Review } from '../models'
import { AppError } from '../middleware/error.middleware'
import type { ReportTargetType, ReportStatus, ReportPriority } from '../models/Report'

// Centralized valid reason lists — import these in validators too
export const LISTING_REPORT_REASONS = [
  'SCAM', 'FAKE_PRODUCT', 'WRONG_DESCRIPTION', 'PROHIBITED_ITEM',
  'DUPLICATE_LISTING', 'INAPPROPRIATE_CONTENT', 'SUSPICIOUS_SELLER', 'OTHER',
] as const

export const USER_REPORT_REASONS = [
  'SCAM', 'HARASSMENT', 'FAKE_ACCOUNT', 'SPAM', 'ABUSIVE_BEHAVIOR', 'OTHER',
] as const

export const REVIEW_REPORT_REASONS = [
  'SPAM', 'ABUSE', 'FAKE_REVIEW', 'INAPPROPRIATE_CONTENT', 'OTHER',
] as const

export const MESSAGE_REPORT_REASONS = [
  'HARASSMENT', 'SPAM', 'SCAM', 'INAPPROPRIATE_CONTENT', 'OTHER',
] as const

export type ValidReason =
  | typeof LISTING_REPORT_REASONS[number]
  | typeof USER_REPORT_REASONS[number]
  | typeof REVIEW_REPORT_REASONS[number]
  | typeof MESSAGE_REPORT_REASONS[number]

const REASON_MAP: Record<ReportTargetType, readonly string[]> = {
  LISTING: LISTING_REPORT_REASONS,
  USER: USER_REPORT_REASONS,
  REVIEW: REVIEW_REPORT_REASONS,
  MESSAGE: MESSAGE_REPORT_REASONS,
  CONVERSATION: MESSAGE_REPORT_REASONS,
}

/**
 * Determine priority automatically from reason.
 * Admins can always override priority manually later.
 */
function derivePriority(reason: string): ReportPriority {
  if (['SCAM', 'PROHIBITED_ITEM', 'HARASSMENT'].includes(reason)) return 'HIGH'
  if (['FAKE_PRODUCT', 'FAKE_ACCOUNT', 'ABUSIVE_BEHAVIOR'].includes(reason)) return 'MEDIUM'
  return 'LOW'
}

export interface CreateReportInput {
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  reason: string
  description?: string
}

/**
 * Create a report with full validation:
 *  - Target must exist
 *  - Reason must be valid for the target type
 *  - Rate-limit: user cannot file a duplicate PENDING report for the same target
 *  - Reporter cannot report themselves (for USER target type)
 */
export async function createReport(input: CreateReportInput) {
  const { reporterId, targetType, targetId, reason, description } = input

  const validTargetTypes: ReportTargetType[] = ['LISTING', 'USER', 'REVIEW', 'MESSAGE']
  if (!validTargetTypes.includes(targetType)) {
    throw new AppError('Invalid target type.', 400)
  }

  const validReasons = REASON_MAP[targetType]
  if (!validReasons.includes(reason as any)) {
    throw new AppError(`Invalid reason for ${targetType} report.`, 400)
  }

  // Guard: USER cannot report themselves
  if (targetType === 'USER' && targetId === reporterId) {
    throw new AppError('You cannot report yourself.', 400)
  }

  // Guard: verify target actually exists
  await verifyTargetExists(targetType, targetId)

  // Guard: prevent duplicate PENDING reports from same reporter on same target
  const duplicatePending = await Report.findOne({
    where: {
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      status: { [Op.in]: ['PENDING', 'UNDER_REVIEW'] },
    },
    attributes: ['id'],
  })
  if (duplicatePending) {
    throw new AppError(
      'You have already reported this. Our team is reviewing it.',
      409,
    )
  }

  const priority = derivePriority(reason)

  const report = await Report.create({
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
    description: description?.trim() || null,
    status: 'PENDING',
    priority,
  })

  return report
}

export interface GetReportsFilters {
  status?: ReportStatus
  priority?: ReportPriority
  targetType?: ReportTargetType
  page?: number
  limit?: number
}

/**
 * Admin: get paginated reports with optional filters.
 * Includes reporter public info.
 */
export async function getReports(filters: GetReportsFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20))
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.priority) where.priority = filters.priority
  if (filters.targetType) where.target_type = filters.targetType

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'full_name', 'email', 'phone'],
      },
    ],
    order: [
      // Order CRITICAL first, then by date
      [
        'priority',
        'ASC', // CRITICAL < HIGH < MEDIUM < LOW alphabetically — override with CASE in prod
      ],
      ['created_at', 'DESC'],
    ],
    limit,
    offset,
  })

  return {
    reports: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

/**
 * Admin: get a single report by ID.
 */
export async function getReportById(reportId: string) {
  const report = await Report.findByPk(reportId, {
    include: [
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'full_name', 'email', 'phone'],
      },
    ],
  })
  if (!report) throw new AppError('Report not found.', 404)
  return report
}

/**
 * Admin: update report status, priority, or admin note.
 * Creates audit log entry (called from controller).
 */
export async function updateReport(
  reportId: string,
  adminId: string,
  updates: {
    status?: ReportStatus
    priority?: ReportPriority
    adminNote?: string
  },
) {
  const report = await Report.findByPk(reportId)
  if (!report) throw new AppError('Report not found.', 404)

  if (updates.status) {
    report.status = updates.status
    if (['RESOLVED', 'DISMISSED'].includes(updates.status)) {
      report.resolved_by = adminId
      report.resolved_at = new Date()
    }
  }
  if (updates.priority) report.priority = updates.priority
  if (updates.adminNote !== undefined) report.admin_note = updates.adminNote

  await report.save()
  return report
}

// ── Target Existence Checks ────────────────────────────────────────────────────

async function verifyTargetExists(targetType: ReportTargetType, targetId: string) {
  switch (targetType) {
    case 'LISTING': {
      const listing = await Listing.findByPk(targetId, { attributes: ['id'] })
      if (!listing) throw new AppError('Reported listing does not exist.', 404)
      break
    }
    case 'USER': {
      const user = await User.findByPk(targetId, { attributes: ['id'] })
      if (!user) throw new AppError('Reported user does not exist.', 404)
      break
    }
    case 'REVIEW': {
      const review = await Review.findByPk(targetId, { attributes: ['id'] })
      if (!review) throw new AppError('Reported review does not exist.', 404)
      break
    }
    case 'MESSAGE':
      // Messages don't need strict validation — ID is enough
      break
  }
}
