import { fn, col, literal, Op } from 'sequelize'
import {
  User,
  Listing,
  ListingImage,
  Category,
  Order,
  OrderEvent,
  MeetingOrder,
  DeliveryOrder,
  Payment,
  Report,
  Review,
  UserVerification,
  AdminAuditLog,
  BusinessProfile,
  Subscription,
  Entitlement,
  SellerProfile,
} from '../models'
import { AppError } from '../middleware/error.middleware'
import type { UserStatus } from '../types/auth.types'

// ── Dashboard Statistics ───────────────────────────────────────────────────────

/**
 * Aggregate dashboard statistics using DB-level counts.
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
    Report.count({ where: { status: { [Op.in]: ['PENDING', 'UNDER_REVIEW'] } } }),
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
  verification?: 'VERIFIED' | 'UNVERIFIED'
  tier?: 'BASIC' | 'PREMIUM' | 'BUSINESS'
}

export async function getUsers(filters: GetUsersFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.role) where.role = filters.role
  if (filters.verification === 'VERIFIED') {
    where.is_fayda_verified = true
  } else if (filters.verification === 'UNVERIFIED') {
    where.is_fayda_verified = false
  }

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
      'id',
      'full_name',
      'email',
      'phone',
      'role',
      'status',
      'avatar_url',
      'is_email_verified',
      'is_phone_verified',
      'is_fayda_verified',
      'created_at',
    ],
    include: [
      {
        model: BusinessProfile,
        as: 'businessProfile',
        attributes: ['id', 'business_name', 'status'],
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  // Get active listing counts for each user
  const userIds = rows.map((u) => u.id)
  const listingCounts = await Listing.findAll({
    where: { seller_id: { [Op.in]: userIds } },
    attributes: ['seller_id', [fn('COUNT', col('id')), 'count']],
    group: ['seller_id'],
    raw: true,
  })
  const listingCountMap = new Map((listingCounts as any[]).map((l) => [l.seller_id, Number(l.count)]))

  const formattedUsers = rows.map((user) => {
    const safe = user.toSafeObject()
    const listingCount = listingCountMap.get(user.id) || 0
    const hasBusiness = !!(user as any).businessProfile
    const tier = hasBusiness ? 'BUSINESS' : 'BASIC'

    return {
      ...safe,
      listingsCount: listingCount,
      tier,
      businessProfile: (user as any).businessProfile || null,
    }
  })

  return {
    users: formattedUsers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

/**
 * Fetch full dossier for a specific user (profile, listings, orders, payments, reports, verifications).
 */
export async function getUserDetailsAdmin(userId: string) {
  const user = await User.findByPk(userId, {
    attributes: [
      'id',
      'full_name',
      'email',
      'phone',
      'role',
      'status',
      'avatar_url',
      'is_email_verified',
      'is_phone_verified',
      'is_fayda_verified',
      'created_at',
      'updated_at',
    ],
    include: [
      { model: SellerProfile, as: 'sellerProfile' },
      { model: BusinessProfile, as: 'businessProfile' },
    ],
  })

  if (!user) throw new AppError('User not found.', 404)

  const [
    listings,
    salesOrders,
    purchaseOrders,
    payments,
    reportsAgainst,
    verifications,
    entitlements,
  ] = await Promise.all([
    Listing.findAll({
      where: { seller_id: userId },
      attributes: ['id', 'title', 'price', 'status', 'views_count', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 20,
    }),
    Order.findAll({
      where: { seller_id: userId },
      attributes: ['id', 'order_number', 'total_amount', 'status', 'payment_status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
    }),
    Order.findAll({
      where: { buyer_id: userId },
      attributes: ['id', 'order_number', 'total_amount', 'status', 'payment_status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
    }),
    Payment.findAll({
      where: { user_id: userId },
      attributes: ['id', 'reference', 'amount', 'currency', 'purpose', 'status', 'paid_at', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
    }),
    Report.findAll({
      where: { target_type: 'USER', target_id: userId },
      attributes: ['id', 'reason', 'status', 'priority', 'description', 'created_at'],
      order: [['created_at', 'DESC']],
    }),
    UserVerification.findAll({
      where: { user_id: userId },
      attributes: ['id', 'verification_type', 'status', 'document_reference', 'verified_at', 'rejection_reason', 'created_at'],
    }),
    Entitlement.findAll({
      where: { user_id: userId },
      attributes: ['id', 'type', 'status', 'start_at', 'end_at'],
    }),
  ])

  return {
    user: user.toSafeObject(),
    businessProfile: (user as any).businessProfile,
    sellerProfile: (user as any).sellerProfile,
    listings,
    salesOrders,
    purchaseOrders,
    payments,
    reportsAgainst,
    verifications,
    entitlements,
    stats: {
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.status === 'ACTIVE').length,
      totalSales: salesOrders.length,
      totalPurchases: purchaseOrders.length,
      totalPaidETB: payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount), 0),
    },
  }
}

/**
 * Admin: update user account status (ACTIVE / SUSPENDED / DEACTIVATED).
 */
export async function updateUserStatus(userId: string, adminId: string, status: UserStatus, reason?: string) {
  if (userId === adminId) {
    throw new AppError('You cannot change your own account status.', 403)
  }

  const user = await User.findByPk(userId)
  if (!user) throw new AppError('User not found.', 404)

  if (user.role === 'ADMIN' && status === 'SUSPENDED') {
    throw new AppError('Cannot suspend another admin account.', 403)
  }

  user.status = status
  await user.save()

  // Audit log
  await createAuditLog({
    adminId,
    action: `USER_${status}`,
    targetType: 'USER',
    targetId: user.id,
    reason,
    metadata: { newStatus: status },
  })

  return user
}

// ── Listing Management ────────────────────────────────────────────────────────

export interface GetListingsFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoryId?: string
}

export async function getListingsAdmin(filters: GetListingsFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.categoryId) where.category_id = filters.categoryId
  if (filters.search) {
    where.title = { [Op.iLike]: `%${filters.search}%` }
  }

  const { count, rows } = await Listing.findAndCountAll({
    where,
    paranoid: false,
    include: [
      { model: User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: ListingImage, as: 'images', attributes: ['id', 'image_url', 'is_primary'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    listings: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

/**
 * Admin: update listing status (ACTIVE / REMOVED / ARCHIVED / SOLD).
 */
export async function updateListingStatus(
  listingId: string,
  status: string,
  adminId: string,
  reason?: string,
  adminNote?: string,
) {
  const validStatuses = ['ACTIVE', 'REMOVED', 'ARCHIVED', 'SOLD', 'PENDING_REVIEW']
  if (!validStatuses.includes(status)) throw new AppError('Invalid status.', 400)

  const listing = await Listing.findByPk(listingId, { paranoid: false })
  if (!listing) throw new AppError('Listing not found.', 404)

  listing.status = status as any

  if (status === 'ACTIVE' && listing.deleted_at) {
    listing.set({ deleted_at: null } as any)
  }
  await listing.save()

  // Audit log
  await createAuditLog({
    adminId,
    action: `LISTING_${status}`,
    targetType: 'LISTING',
    targetId: listing.id,
    reason: reason || adminNote,
    metadata: { newStatus: status, reason, adminNote },
  })

  return listing
}

// ── Order Management ──────────────────────────────────────────────────────────

export interface GetOrdersFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  paymentStatus?: string
}

export async function getOrdersAdmin(filters: GetOrdersFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  if (filters.paymentStatus) where.payment_status = filters.paymentStatus
  if (filters.search) {
    where[Op.or] = [
      { order_number: { [Op.iLike]: `%${filters.search}%` } },
      { id: { [Op.iLike]: `%${filters.search}%` } },
    ]
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: 'buyer', attributes: ['id', 'full_name', 'email', 'phone'] },
      { model: User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone'] },
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'price'],
        include: [{ model: ListingImage, as: 'images', attributes: ['image_url', 'is_primary'], limit: 1 }],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    orders: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

export async function getOrderByIdAdmin(orderId: string) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: User, as: 'buyer', attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'] },
      { model: User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'] },
      {
        model: Listing,
        as: 'listing',
        include: [{ model: ListingImage, as: 'images', attributes: ['image_url', 'is_primary'] }],
      },
      { model: OrderEvent, as: 'events', order: [['created_at', 'ASC']] },
    ],
  })

  if (!order) throw new AppError('Order not found.', 404)
  return order
}

// ── Payment Management (Chapa Gateway) ───────────────────────────────────────

export interface GetPaymentsFilters {
  page?: number
  limit?: number
  search?: string
  purpose?: string
  status?: string
}

export async function getPaymentsAdmin(filters: GetPaymentsFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.purpose) where.purpose = filters.purpose
  if (filters.status) where.status = filters.status
  if (filters.search) {
    where[Op.or] = [
      { reference: { [Op.iLike]: `%${filters.search}%` } },
      { provider_reference: { [Op.iLike]: `%${filters.search}%` } },
    ]
  }

  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  // Summary counts
  const [totalVolumeRow, successCount, failedCount, pendingCount] = await Promise.all([
    Payment.findOne({
      attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'totalVolume']],
      where: { status: 'SUCCESS' },
      raw: true,
    }),
    Payment.count({ where: { status: 'SUCCESS' } }),
    Payment.count({ where: { status: 'FAILED' } }),
    Payment.count({ where: { status: 'PENDING' } }),
  ])

  return {
    payments: rows,
    summary: {
      totalVolume: Number((totalVolumeRow as any)?.totalVolume ?? 0),
      successfulCount: successCount,
      failedCount,
      pendingCount,
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

// ── Business Management ───────────────────────────────────────────────────────

export interface GetBusinessesFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export async function getBusinessesAdmin(filters: GetBusinessesFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.registration_status = filters.status
  if (filters.search) {
    where[Op.or] = [
      { business_name: { [Op.iLike]: `%${filters.search}%` } },
      { tin_number: { [Op.iLike]: `%${filters.search}%` } },
      { license_number: { [Op.iLike]: `%${filters.search}%` } },
    ]
  }

  const { count, rows } = await BusinessProfile.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url', 'created_at'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  // Attach listing count for each business seller
  const userIds = rows.map((b) => b.user_id)
  const listingCounts = await Listing.findAll({
    where: { seller_id: { [Op.in]: userIds } },
    attributes: ['seller_id', [fn('COUNT', col('id')), 'count']],
    group: ['seller_id'],
    raw: true,
  })
  const listingCountMap = new Map((listingCounts as any[]).map((l) => [l.seller_id, Number(l.count)]))

  const businessesWithCounts = rows.map((b) => {
    const listingCount = listingCountMap.get(b.user_id) || 0
    return {
      ...b.toJSON(),
      listingsCount: listingCount,
      maxListingQuota: 50,
    }
  })

  return {
    businesses: businessesWithCounts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

export async function updateBusinessStatusAdmin(
  businessId: string,
  status: 'PENDING' | 'VERIFIED' | 'REJECTED',
  adminId: string,
  reason?: string,
) {
  const business = await BusinessProfile.findByPk(businessId)
  if (!business) throw new AppError('Business profile not found.', 404)

  business.registration_status = status
  await business.save()

  // If verified, also grant entitlement
  if (status === 'VERIFIED') {
    await Entitlement.create({
      user_id: business.user_id,
      type: 'BUSINESS_ACCOUNT',
      status: 'ACTIVE',
      start_at: new Date(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    })
  }

  // Audit log
  await createAuditLog({
    adminId,
    action: `BUSINESS_${status}`,
    targetType: 'BUSINESS',
    targetId: business.id,
    reason,
    metadata: { newStatus: status },
  })

  return business
}

// ── Audit Logging ─────────────────────────────────────────────────────────────

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
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}
