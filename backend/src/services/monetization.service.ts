import { Op } from 'sequelize'
import {
  Plan,
  Payment,
  Subscription,
  Entitlement,
  UserVerification,
  Advertisement,
  Transaction,
  User,
} from '../models'
import type { PlanType } from '../types/monetization.types'

export async function getActivePlans(type?: PlanType): Promise<Plan[]> {
  const where: any = { is_active: true }
  if (type) where.type = type
  return Plan.findAll({
    where,
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'ASC'],
    ],
  })
}

export async function getAllPlansAdmin(): Promise<Plan[]> {
  return Plan.findAll({
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'ASC'],
    ],
  })
}

export async function createPlan(data: {
  name: string
  type: PlanType
  price: number
  durationDays: number
  billingCycle: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
  features: string[]
  isActive?: boolean
  sortOrder?: number
}): Promise<Plan> {
  return Plan.create({
    name: data.name,
    type: data.type,
    price: data.price.toFixed(2),
    duration_days: data.durationDays,
    billing_cycle: data.billingCycle,
    features: data.features,
    is_active: data.isActive ?? true,
    sort_order: data.sortOrder ?? 0,
  })
}

export async function updatePlan(
  planId: string,
  data: Partial<{
    name: string
    price: number
    durationDays: number
    billingCycle: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
    features: string[]
    isActive: boolean
    sortOrder: number
  }>,
): Promise<Plan> {
  const plan = await Plan.findByPk(planId)
  if (!plan) {
    throw Object.assign(new Error('Plan not found.'), { statusCode: 404 })
  }

  const updates: any = {}
  if (data.name !== undefined) updates.name = data.name
  if (data.price !== undefined) updates.price = data.price.toFixed(2)
  if (data.durationDays !== undefined) updates.duration_days = data.durationDays
  if (data.billingCycle !== undefined) updates.billing_cycle = data.billingCycle
  if (data.features !== undefined) updates.features = data.features
  if (data.isActive !== undefined) updates.is_active = data.isActive
  if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder

  await plan.update(updates)
  return plan
}

export async function getAdminMonetizationStats() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Successful Payments
  const [
    allSuccessfulPayments,
    todaySuccessfulPayments,
    monthlySuccessfulPayments,
    totalFailedPayments,
    activeSubscriptionsCount,
    activeFeaturedCount,
    activeBoostsCount,
    pendingVerificationsCount,
    pendingAdsCount,
  ] = await Promise.all([
    Payment.findAll({
      where: { status: 'SUCCESS' },
      attributes: ['amount', 'purpose', 'created_at'],
    }),
    Payment.findAll({
      where: {
        status: 'SUCCESS',
        paid_at: { [Op.gte]: startOfDay },
      },
      attributes: ['amount'],
    }),
    Payment.findAll({
      where: {
        status: 'SUCCESS',
        paid_at: { [Op.gte]: startOfMonth },
      },
      attributes: ['amount'],
    }),
    Payment.count({ where: { status: 'FAILED' } }),
    Subscription.count({
      where: {
        status: 'ACTIVE',
        expires_at: { [Op.gt]: now },
      },
    }),
    Entitlement.count({
      where: {
        type: 'FEATURED',
        status: 'ACTIVE',
        [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
      },
    }),
    Entitlement.count({
      where: {
        type: 'BOOST',
        status: 'ACTIVE',
        [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
      },
    }),
    UserVerification.count({ where: { status: 'PAID_PENDING' } }),
    Advertisement.count({ where: { status: 'PENDING_REVIEW' } }),
  ])

  let totalRevenue = 0
  const revenueByPurpose: Record<string, number> = {
    FEATURED_LISTING: 0,
    LISTING_BOOST: 0,
    BUSINESS_SUBSCRIPTION: 0,
    PREMIUM_SUBSCRIPTION: 0,
    VERIFICATION: 0,
    ADVERTISEMENT: 0,
    TRANSACTION_FEE: 0,
    DELIVERY: 0,
  }

  for (const p of allSuccessfulPayments) {
    const amt = Number(p.amount)
    totalRevenue += amt
    if (revenueByPurpose[p.purpose] !== undefined) {
      revenueByPurpose[p.purpose] += amt
    }
  }

  const todayRevenue = todaySuccessfulPayments.reduce((acc, p) => acc + Number(p.amount), 0)
  const monthlyRevenue = monthlySuccessfulPayments.reduce((acc, p) => acc + Number(p.amount), 0)

  return {
    totalRevenue,
    todayRevenue,
    monthlyRevenue,
    successfulPaymentsCount: allSuccessfulPayments.length,
    failedPaymentsCount: totalFailedPayments,
    activeSubscriptionsCount,
    activeFeaturedCount,
    activeBoostsCount,
    pendingVerificationsCount,
    pendingAdsCount,
    revenueByPurpose,
  }
}
