import { fn, col, literal, Op } from 'sequelize'
import { User, Listing, Report, Review, UserVerification, AdminAuditLog } from '../models'
import { AppError } from '../middleware/error.middleware'
import type { UserStatus } from '../types/auth.types'

// ── Dashboard Statistics ───────────────────────────────────────────────────────

/**
 * Aggregate dashboard statistics using DB-level counts.
 * Never loads full rows — only COUNT/SUM aggregates.
 */
export async function getDashboardStats() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    newUsersToday,
    totalListings,
    activeListings,
    soldListings,
    pendingReports,
    pendingVerifications,
    totalReviews,
    newListingsToday,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { created_at: { [Op.gte]: todayStart } } }),
    Listing.count({ paranoid: false }),
    Listing.count({ where: { status: 'ACTIVE' } }),
    Listing.count({ where: { status: 'SOLD' } }),
    Report.count({ where: { status: 'PENDING' } }),
    UserVerification.count({ where: { status: 'PENDING' } }),
    Review.count(),
    Listing.count({ where: { created_at: { [Op.gte]: todayStart } } }),
  ])

  return {
    totalUsers,
    newUsersToday,
    totalListings,
    activeListings,
    soldListings,
    pendingReports,
    pendingVerifications,
    totalReviews,
    newListingsToday,
  }
}

// ── User Management ────────────────────────────────────────────────────────────

export interface GetUsersFilters {
  page?: number
  limit?: number
  search?: string
  status?: UserStatus
  role?: 'USER' | 'ADMIN'
}

export async function getUsers(filters: GetUsersFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.role) where.role = filters.role
  if (filters.search) {
    where[Op.or] = [
      { full_name: { [Op.iLike]: `%${filters.search}%` } },
      { email: { [Op.iLike]: `%${filters.search}%` } },
      { phone: { [Op.iLike]: `%${filters.search}%` } },
    ]
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: [
      'id', 'full_name', 'email', 'phone', 'role', 'status',
      'is_email_verified', 'is_phone_verified', 'is_fayda_verified', 'is_face_verified',
      'created_at',
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    users: rows,
    pagination: { currentPage: page, totalPages: Math.ceil(count / limit), totalItems: count, limit },
  }
}

/**
 * Admin: update user account status (ACTIVE / SUSPENDED / DEACTIVATED).
 * Guard: prevents admin from suspending themselves.
 */
export async function updateUserStatus(userId: string, adminId: string, status: UserStatus, reason?: string) {
  if (userId === adminId) {
    throw new AppError('You cannot change your own account status.', 403)
  }

  const user = await User.findByPk(userId)
  if (!user) throw new AppError('User not found.', 404)

  // Guard: cannot demote another admin accidentally
  if (user.role === 'ADMIN' && status === 'SUSPENDED') {
    throw new AppError('Cannot suspend another admin account.', 403)
  }

  user.status = status
  await user.save()
  return user
}

// ── Listing Management ────────────────────────────────────────────────────────

export interface GetListingsFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export async function getListingsAdmin(filters: GetListingsFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.search) {
    where.title = { [Op.iLike]: `%${filters.search}%` }
  }

  const { count, rows } = await Listing.findAndCountAll({
    where,
    paranoid: false, // include soft-deleted
    include: [
      { model: User, as: 'seller', attributes: ['id', 'full_name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    listings: rows,
    pagination: { currentPage: page, totalPages: Math.ceil(count / limit), totalItems: count, limit },
  }
}

/**
 * Admin: update listing status.
 * Valid admin transitions: ACTIVE → REMOVED, REMOVED → ACTIVE (restore)
 */
export async function updateListingStatus(listingId: string, status: string) {
  const validStatuses = ['ACTIVE', 'REMOVED', 'ARCHIVED', 'SOLD']
  if (!validStatuses.includes(status)) throw new AppError('Invalid status.', 400)

  const listing = await Listing.findByPk(listingId, { paranoid: false })
  if (!listing) throw new AppError('Listing not found.', 404)

  listing.status = status as any
  // Restore soft-deleted listing if needed
  if (status === 'ACTIVE' && listing.deleted_at) {
    listing.set({ deleted_at: null } as any)
  }
  await listing.save()
  return listing
}

// ── Audit Logging ─────────────────────────────────────────────────────────────

/**
 * Record an auditable admin action.
 * Called after every moderation action from the controller.
 */
export async function createAuditLog(entry: {
  adminId: string
  action: string
  targetType: string
  targetId: string
  reason?: string
  metadata?: object
}) {
  return AdminAuditLog.create({
    admin_id: entry.adminId,
    action: entry.action,
    target_type: entry.targetType,
    target_id: entry.targetId,
    reason: entry.reason || null,
    metadata: entry.metadata || null,
  })
}

export async function getAuditLogs(filters: { page?: number; limit?: number; adminId?: string }) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit
  const where: any = {}
  if (filters.adminId) where.admin_id = filters.adminId

  const { count, rows } = await AdminAuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'admin', attributes: ['id', 'full_name'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    logs: rows,
    pagination: { currentPage: page, totalPages: Math.ceil(count / limit), totalItems: count, limit },
  }
}
