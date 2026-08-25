import { Op, Transaction } from 'sequelize'
import { User, Listing, BusinessProfile, SellerProfile } from '../models'
import * as entitlementService from './entitlement.service'

export type AccountTier = 'FREE' | 'PREMIUM' | 'BUSINESS' | 'ADMIN'

export interface UserListingLimitInfo {
  tier: AccountTier
  limit: number
  currentCount: number
  remaining: number
  canCreate: boolean
}

export const LISTING_LIMITS: Record<AccountTier, number> = {
  FREE: 10,
  PREMIUM: 50,
  BUSINESS: 9999,
  ADMIN: 99999,
}

/**
 * Resolves the authenticated user's tier and maximum allowed active listings.
 */
export async function resolveUserTier(userId: string): Promise<{
  tier: AccountTier
  maxActiveListings: number
}> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  // 1. Admin Override
  if (user.role === 'ADMIN') {
    return { tier: 'ADMIN', maxActiveListings: LISTING_LIMITS.ADMIN }
  }

  // 2. Business Account Check (Entitlement or Verified Business Profile)
  const hasBusinessEntitlement = await entitlementService.hasEntitlement(
    userId,
    'BUSINESS_ACCOUNT',
  )
  if (hasBusinessEntitlement) {
    return { tier: 'BUSINESS', maxActiveListings: LISTING_LIMITS.BUSINESS }
  }

  const businessProfile = await BusinessProfile.findOne({
    where: { user_id: userId, registration_status: 'VERIFIED' },
  })
  if (businessProfile) {
    return { tier: 'BUSINESS', maxActiveListings: LISTING_LIMITS.BUSINESS }
  }

  // 3. Premium Seller Check
  const hasPremiumEntitlement = await entitlementService.hasEntitlement(
    userId,
    'PREMIUM_SELLER',
  )
  if (hasPremiumEntitlement) {
    return { tier: 'PREMIUM', maxActiveListings: LISTING_LIMITS.PREMIUM }
  }

  // 4. Default Free/Basic Account
  return { tier: 'FREE', maxActiveListings: LISTING_LIMITS.FREE }
}

/**
 * Counts all listings that currently consume quota for the given seller.
 * Only 'ACTIVE' and 'RESERVED' listings count.
 */
export async function countActiveListings(
  sellerId: string,
  transaction?: Transaction,
): Promise<number> {
  return Listing.count({
    where: {
      seller_id: sellerId,
      status: {
        [Op.in]: ['ACTIVE', 'RESERVED'],
      },
    },
    transaction,
  })
}

/**
 * Retrieves comprehensive listing limit and active inventory stats for a user.
 */
export async function getUserListingLimitDetails(
  userId: string,
): Promise<UserListingLimitInfo> {
  const { tier, maxActiveListings } = await resolveUserTier(userId)
  const currentCount = await countActiveListings(userId)

  return {
    tier,
    limit: maxActiveListings,
    currentCount,
    remaining: Math.max(0, maxActiveListings - currentCount),
    canCreate: currentCount < maxActiveListings,
  }
}

/**
 * Asserts that a user has not reached their active listing limit.
 * Must be called inside or with a transaction during listing creation / publishing.
 */
export async function assertCanCreateActiveListing(
  sellerId: string,
  transaction?: Transaction,
  excludeListingId?: string,
): Promise<{ tier: AccountTier; limit: number; currentCount: number }> {
  // Acquire a pessimistic row-level lock on seller profile to serialize concurrent creation requests
  if (transaction) {
    await SellerProfile.findOne({
      where: { user_id: sellerId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    })
  }

  const { tier, maxActiveListings } = await resolveUserTier(sellerId)

  // Count active + reserved listings (excluding current listing if updating existing)
  const whereClause: any = {
    seller_id: sellerId,
    status: {
      [Op.in]: ['ACTIVE', 'RESERVED'],
    },
  }

  if (excludeListingId) {
    whereClause.id = { [Op.ne]: excludeListingId }
  }

  const currentCount = await Listing.count({
    where: whereClause,
    transaction,
  })

  if (currentCount >= maxActiveListings) {
    const error = Object.assign(
      new Error(
        `You have reached the maximum number of active listings (${maxActiveListings}) allowed for your ${tier} account.`,
      ),
      {
        statusCode: 403,
        code: 'LISTING_LIMIT_REACHED',
        limit: maxActiveListings,
        currentCount,
        tier,
      },
    )
    throw error
  }

  return { tier, limit: maxActiveListings, currentCount }
}
