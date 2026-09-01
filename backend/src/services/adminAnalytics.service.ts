import { fn, col, literal, Op } from 'sequelize'
import {
  User,
  Listing,
  Order,
  Payment,
  Advertisement,
  Report,
  UserVerification,
  BusinessProfile,
  Entitlement,
} from '../models'

export interface OverviewStats {
  marketplace: {
    totalUsers: number
    totalActiveListings: number
    totalOrders: number
    totalPaymentVolume: number
    activeSellers: number
    businessAccounts: number
  }
  today: {
    newUsersToday: number
    newListingsToday: number
    newOrdersToday: number
    todayPaymentVolume: number
  }
  attentionRequired: {
    pendingListings: number
    pendingAdvertisements: number
    pendingVerifications: number
    openReports: number
    failedPayments: number
  }
  ordersSummary: {
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
  }
  paymentsSummary: {
    successfulPayments: number
    failedPayments: number
    pendingPayments: number
  }
  advertisementsSummary: {
    activeAds: number
    pendingAds: number
    expiredAds: number
  }
}

/**
 * Compute marketplace dashboard overview metrics in a single aggregated DB pass.
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    newUsersToday,
    totalActiveListings,
    newListingsToday,
    pendingListings,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    newOrdersToday,
    totalPaymentVolumeResult,
    todayPaymentVolumeResult,
    successfulPayments,
    failedPayments,
    pendingPayments,
    activeAds,
    pendingAds,
    expiredAds,
    openReports,
    pendingVerifications,
    businessAccounts,
    activeSellersResult,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { created_at: { [Op.gte]: todayStart } } }),
    Listing.count({ where: { status: 'ACTIVE' } }),
    Listing.count({ where: { created_at: { [Op.gte]: todayStart } } }),
    Listing.count({ where: { status: 'PENDING_REVIEW' } }),
    Order.count(),
    Order.count({ where: { status: 'COMPLETED' } }),
    Order.count({ where: { status: 'PENDING' } }),
    Order.count({ where: { status: 'CANCELLED' } }),
    Order.count({ where: { created_at: { [Op.gte]: todayStart } } }),
    Payment.findOne({
      attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'totalVolume']],
      where: { status: 'SUCCESS' },
      raw: true,
    }),
    Payment.findOne({
      attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'todayVolume']],
      where: {
        status: 'SUCCESS',
        created_at: { [Op.gte]: todayStart },
      },
      raw: true,
    }),
    Payment.count({ where: { status: 'SUCCESS' } }),
    Payment.count({ where: { status: 'FAILED' } }),
    Payment.count({ where: { status: 'PENDING' } }),
    Advertisement.count({ where: { status: 'ACTIVE' } }),
    Advertisement.count({ where: { status: { [Op.in]: ['PENDING_REVIEW', 'PENDING_PAYMENT'] } } }),
    Advertisement.count({ where: { status: 'EXPIRED' } }),
    Report.count({ where: { status: { [Op.in]: ['PENDING', 'UNDER_REVIEW'] } } }),
    UserVerification.count({ where: { status: 'PENDING' } }),
    BusinessProfile.count(),
    Listing.count({
      distinct: true,
      col: 'seller_id',
      where: { status: 'ACTIVE' },
    }),
  ])

  const totalPaymentVolume = Number((totalPaymentVolumeResult as any)?.totalVolume ?? 0)
  const todayPaymentVolume = Number((todayPaymentVolumeResult as any)?.todayVolume ?? 0)

  return {
    marketplace: {
      totalUsers,
      totalActiveListings,
      totalOrders,
      totalPaymentVolume,
      activeSellers: Number(activeSellersResult || 0),
      businessAccounts,
    },
    today: {
      newUsersToday,
      newListingsToday,
      newOrdersToday,
      todayPaymentVolume,
    },
    attentionRequired: {
      pendingListings,
      pendingAdvertisements: pendingAds,
      pendingVerifications,
      openReports,
      failedPayments,
    },
    ordersSummary: {
      completedOrders,
      pendingOrders,
      cancelledOrders,
    },
    paymentsSummary: {
      successfulPayments,
      failedPayments,
      pendingPayments,
    },
    advertisementsSummary: {
      activeAds,
      pendingAds,
      expiredAds,
    },
  }
}

export interface TimeseriesDataPoint {
  date: string
  users: number
  listings: number
  orders: number
  paymentVolume: number
}

/**
 * Fetch daily time-series metrics for charts over a specified timeframe (e.g. 7, 30, 90 days).
 * Groups by date at DB level.
 */
export async function getTimeseriesGrowth(days = 30): Promise<TimeseriesDataPoint[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)

  const [userRows, listingRows, orderRows, paymentRows] = await Promise.all([
    User.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { created_at: { [Op.gte]: cutoff } },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    }),
    Listing.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { created_at: { [Op.gte]: cutoff } },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    }),
    Order.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { created_at: { [Op.gte]: cutoff } },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    }),
    Payment.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COALESCE', fn('SUM', col('amount')), 0), 'volume'],
      ],
      where: {
        status: 'SUCCESS',
        created_at: { [Op.gte]: cutoff },
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    }),
  ])

  // Build a map of dates for easy alignment
  const dateMap = new Map<string, TimeseriesDataPoint>()
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    dateMap.set(dateKey, {
      date: dateKey,
      users: 0,
      listings: 0,
      orders: 0,
      paymentVolume: 0,
    })
  }

  for (const row of userRows as any[]) {
    const key = String(row.date)
    if (dateMap.has(key)) dateMap.get(key)!.users = Number(row.count)
  }
  for (const row of listingRows as any[]) {
    const key = String(row.date)
    if (dateMap.has(key)) dateMap.get(key)!.listings = Number(row.count)
  }
  for (const row of orderRows as any[]) {
    const key = String(row.date)
    if (dateMap.has(key)) dateMap.get(key)!.orders = Number(row.count)
  }
  for (const row of paymentRows as any[]) {
    const key = String(row.date)
    if (dateMap.has(key)) dateMap.get(key)!.paymentVolume = Number(row.volume)
  }

  return Array.from(dateMap.values())
}

export interface AccountTierBreakdown {
  basic: number
  premium: number
  business: number
}

/**
 * Break down user base into BASIC, PREMIUM, and BUSINESS tiers.
 */
export async function getAccountTierBreakdown(): Promise<AccountTierBreakdown> {
  const [totalUsers, activeBusinessProfiles, activePremiumEntitlements] = await Promise.all([
    User.count(),
    BusinessProfile.count({ where: { registration_status: 'VERIFIED' } }),
    Entitlement.count({
      where: {
        type: 'PREMIUM_SELLER',
        status: 'ACTIVE',
        [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gte]: new Date() } }],
      },
    }),
  ])

  const business = Number(activeBusinessProfiles || 0)
  const premium = Number(activePremiumEntitlements || 0)
  const basic = Math.max(0, Number(totalUsers || 0) - business - premium)

  return { basic, premium, business }
}

export interface RiskSignalItem {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  accountStatus: string
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  reasons: string[]
  reportCount: number
  failedPaymentsCount: number
  rejectedListingsCount: number
  createdAt: Date
}

/**
 * Identifies suspicious activity and risk flags from real database signals.
 */
export async function getRiskSignals(): Promise<RiskSignalItem[]> {
  // Query users with reports against them
  const reportedUsers = await Report.findAll({
    where: { target_type: 'USER' },
    attributes: [
      'target_id',
      [fn('COUNT', col('id')), 'reportCount'],
    ],
    group: ['target_id'],
    having: literal('COUNT(id) >= 1'),
    order: [[literal('COUNT(id)'), 'DESC']],
    limit: 20,
    raw: true,
  })

  // Query users with failed payments
  const failedPaymentUsers = await Payment.findAll({
    where: { status: 'FAILED' },
    attributes: [
      'user_id',
      [fn('COUNT', col('id')), 'failedCount'],
    ],
    group: ['user_id'],
    having: literal('COUNT(id) >= 2'),
    order: [[literal('COUNT(id)'), 'DESC']],
    limit: 20,
    raw: true,
  })

  // Query users with rejected / removed listings
  const rejectedListingUsers = await Listing.findAll({
    where: { status: 'REMOVED' },
    attributes: [
      'seller_id',
      [fn('COUNT', col('id')), 'rejectedCount'],
    ],
    group: ['seller_id'],
    having: literal('COUNT(id) >= 1'),
    order: [[literal('COUNT(id)'), 'DESC']],
    limit: 20,
    raw: true,
  })

  const userIdsSet = new Set<string>()
  for (const r of reportedUsers as any[]) userIdsSet.add(r.target_id)
  for (const f of failedPaymentUsers as any[]) userIdsSet.add(f.user_id)
  for (const l of rejectedListingUsers as any[]) userIdsSet.add(l.seller_id)

  if (userIdsSet.size === 0) return []

  const users = await User.findAll({
    where: { id: { [Op.in]: Array.from(userIdsSet) } },
    attributes: ['id', 'full_name', 'email', 'phone', 'status', 'created_at'],
  })

  const reportMap = new Map((reportedUsers as any[]).map((r) => [r.target_id, Number(r.reportCount)]))
  const failedMap = new Map((failedPaymentUsers as any[]).map((f) => [f.user_id, Number(f.failedCount)]))
  const rejectedMap = new Map((rejectedListingUsers as any[]).map((l) => [l.seller_id, Number(l.rejectedCount)]))

  const results: RiskSignalItem[] = []

  for (const user of users) {
    const reportCount = reportMap.get(user.id) || 0
    const failedPaymentsCount = failedMap.get(user.id) || 0
    const rejectedListingsCount = rejectedMap.get(user.id) || 0

    const reasons: string[] = []
    if (reportCount >= 2) reasons.push(`${reportCount} safety reports filed against user`)
    else if (reportCount === 1) reasons.push('1 open safety report')

    if (failedPaymentsCount >= 2) reasons.push(`${failedPaymentsCount} failed Chapa payment attempts`)
    if (rejectedListingsCount >= 1) reasons.push(`${rejectedListingsCount} listings removed for policy violation`)

    let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM'
    if (reportCount >= 3 || failedPaymentsCount >= 5) riskLevel = 'CRITICAL'
    else if (reportCount >= 2 || failedPaymentsCount >= 3 || rejectedListingsCount >= 2) riskLevel = 'HIGH'

    results.push({
      id: user.id,
      userId: user.id,
      userName: user.full_name,
      userEmail: user.email || 'N/A',
      userPhone: user.phone || 'N/A',
      accountStatus: user.status,
      riskLevel,
      reasons,
      reportCount,
      failedPaymentsCount,
      rejectedListingsCount,
      createdAt: user.created_at,
    })
  }

  // Sort by highest risk level first
  const orderWeight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 }
  return results.sort((a, b) => orderWeight[b.riskLevel] - orderWeight[a.riskLevel])
}
