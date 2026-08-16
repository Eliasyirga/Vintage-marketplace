import { Op, Transaction as DbTransaction } from 'sequelize'
import Entitlement from '../models/Entitlement'
import type { EntitlementType } from '../types/monetization.types'

/**
 * Check if a user has a currently active entitlement.
 */
export async function hasEntitlement(
  userId: string,
  type: EntitlementType,
  listingId?: string,
): Promise<boolean> {
  const where: any = {
    user_id: userId,
    type,
    status: 'ACTIVE',
    [Op.or]: [
      { expires_at: null },
      { expires_at: { [Op.gt]: new Date() } },
    ],
  }

  if (listingId) {
    where.listing_id = listingId
  }

  const count = await Entitlement.count({ where })
  return count > 0
}

/**
 * Grant a verified entitlement to a user/listing.
 */
export async function grantEntitlement(
  params: {
    userId: string
    listingId?: string | null
    type: EntitlementType
    durationDays?: number | null
    paymentId?: string | null
    metadata?: Record<string, unknown> | null
  },
  transaction?: DbTransaction,
): Promise<Entitlement> {
  const now = new Date()
  let expiresAt: Date | null = null

  if (params.durationDays && params.durationDays > 0) {
    expiresAt = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000)
  }

  const entitlement = await Entitlement.create(
    {
      user_id: params.userId,
      listing_id: params.listingId ?? null,
      type: params.type,
      status: 'ACTIVE',
      start_at: now,
      expires_at: expiresAt,
      payment_id: params.paymentId ?? null,
      metadata: params.metadata ?? null,
    },
    { transaction },
  )

  return entitlement
}

/**
 * Retrieve all active entitlements for a user.
 */
export async function getUserActiveEntitlements(userId: string): Promise<Entitlement[]> {
  return Entitlement.findAll({
    where: {
      user_id: userId,
      status: 'ACTIVE',
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } },
      ],
    },
    order: [['created_at', 'DESC']],
  })
}

/**
 * Check if a listing is currently featured.
 */
export async function isListingFeatured(listingId: string): Promise<boolean> {
  const count = await Entitlement.count({
    where: {
      listing_id: listingId,
      type: 'FEATURED',
      status: 'ACTIVE',
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } },
      ],
    },
  })
  return count > 0
}

/**
 * Check if a listing is currently boosted and calculate its decaying score boost.
 * Returns a number between 0 and 0.5 (or configured weight).
 */
export async function getListingBoostInfo(listingId: string): Promise<{
  isBoosted: boolean
  boostScore: number
  expiresAt: Date | null
}> {
  const entitlement = await Entitlement.findOne({
    where: {
      listing_id: listingId,
      type: 'BOOST',
      status: 'ACTIVE',
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } },
      ],
    },
    order: [['expires_at', 'DESC']],
  })

  if (!entitlement) {
    return { isBoosted: false, boostScore: 0, expiresAt: null }
  }

  if (!entitlement.expires_at) {
    return { isBoosted: true, boostScore: 0.3, expiresAt: null }
  }

  // Smooth decay: score is higher when fresh, decaying towards 0 as expiration approaches
  const now = Date.now()
  const start = new Date(entitlement.start_at).getTime()
  const end = new Date(entitlement.expires_at).getTime()
  const totalDuration = Math.max(end - start, 1)
  const remaining = Math.max(end - now, 0)
  const ratio = remaining / totalDuration

  // Max boost score is 0.35
  const boostScore = Math.max(0.05, ratio * 0.35)

  return {
    isBoosted: true,
    boostScore,
    expiresAt: entitlement.expires_at,
  }
}

/**
 * Expire all stale entitlements past their expiration date.
 */
export async function expireStaleEntitlements(): Promise<number> {
  const [updatedCount] = await Entitlement.update(
    { status: 'EXPIRED' },
    {
      where: {
        status: 'ACTIVE',
        expires_at: {
          [Op.ne]: null,
          [Op.lte]: new Date(),
        },
      },
    },
  )
  return updatedCount
}
