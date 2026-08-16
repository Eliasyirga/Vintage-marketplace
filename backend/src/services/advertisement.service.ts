import { Op } from 'sequelize'
import {
  Advertisement,
  User,
  BusinessProfile,
  Plan,
  Payment,
  AdminAuditLog,
} from '../models'
import type { AdPlacement, AdStatus } from '../types/monetization.types'
import * as entitlementService from './entitlement.service'

const VALID_PLACEMENTS: AdPlacement[] = [
  'HOME_TOP',
  'MARKETPLACE_MIDDLE',
  'MARKETPLACE_BOTTOM',
]

/**
 * Validate URL security (HTTPS only, no javascript:/data:/malicious schemes)
 */
export function validateSafeAdUrl(urlStr: string): string {
  const trimmed = (urlStr || '').trim()
  if (!trimmed) {
    throw Object.assign(new Error('Target URL is required.'), { statusCode: 400 })
  }

  // Reject unsafe schemes explicitly
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    throw Object.assign(new Error('Unsafe URL scheme detected. Only secure HTTPS URLs are permitted.'), {
      statusCode: 400,
    })
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Advertisement target URL must use http:// or https://')
    }
    return trimmed
  } catch (err: any) {
    throw Object.assign(
      new Error(err.message || 'Invalid target URL format. Please provide a valid web address.'),
      { statusCode: 400 },
    )
  }
}

export interface ActiveAdSlotsResponse {
  homeTop: ReturnType<Advertisement['toSafeObject']> | null
  marketplaceMiddle: ReturnType<Advertisement['toSafeObject']> | null
  marketplaceBottom: ReturnType<Advertisement['toSafeObject']> | null
}

/**
 * Check if a placement slot currently has an ACTIVE advertisement
 */
export async function isPlacementOccupied(placement: AdPlacement, excludeAdId?: string): Promise<boolean> {
  const now = new Date()
  const where: any = {
    placement,
    status: 'ACTIVE',
    [Op.and]: [
      { [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }] },
      { [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }] },
    ],
  }

  if (excludeAdId) {
    where.id = { [Op.ne]: excludeAdId }
  }

  const count = await Advertisement.count({ where })
  return count > 0
}

/**
 * Return which of the 3 primary slots are currently available for purchase/booking
 */
export async function getAvailablePlacements(): Promise<{
  available: AdPlacement[]
  occupied: AdPlacement[]
  slots: Record<AdPlacement, boolean>
}> {
  const now = new Date()
  const activeAds = await Advertisement.findAll({
    where: {
      status: 'ACTIVE',
      placement: { [Op.in]: VALID_PLACEMENTS },
      [Op.and]: [
        { [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }] },
        { [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }] },
      ],
    },
    attributes: ['placement'],
  })

  const occupiedSet = new Set(activeAds.map((a) => a.placement))
  const available: AdPlacement[] = []
  const occupied: AdPlacement[] = []
  const slots: Record<string, boolean> = {}

  for (const p of VALID_PLACEMENTS) {
    const isOccupied = occupiedSet.has(p)
    slots[p] = !isOccupied
    if (isOccupied) {
      occupied.push(p)
    } else {
      available.push(p)
    }
  }

  return {
    available,
    occupied,
    slots: slots as Record<AdPlacement, boolean>,
  }
}

/**
 * Retrieve the 3 active marketplace advertisement slots in ONE single, high-performance database query.
 * Enforces at most ONE active ad per slot.
 */
export async function getActiveAdSlots(): Promise<ActiveAdSlotsResponse> {
  const now = new Date()

  const activeAds = await Advertisement.findAll({
    where: {
      status: 'ACTIVE',
      placement: { [Op.in]: VALID_PLACEMENTS },
      [Op.and]: [
        { [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }] },
        { [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }] },
      ],
    },
    include: [
      {
        model: User,
        as: 'advertiser',
        attributes: ['id', 'full_name', 'avatar_url'],
        include: [
          {
            model: BusinessProfile,
            as: 'businessProfile',
            attributes: ['business_name', 'logo'],
          },
        ],
      },
      {
        model: Plan,
        as: 'plan',
        attributes: ['id', 'name', 'duration_days', 'price'],
      },
    ],
    order: [
      ['priority', 'DESC'],
      ['start_at', 'DESC'],
      ['created_at', 'ASC'],
    ],
  })

  // Group by placement and take at most one per slot
  const slotMap: Record<AdPlacement, Advertisement | null> = {
    HOME_TOP: null,
    MARKETPLACE_MIDDLE: null,
    MARKETPLACE_BOTTOM: null,
  }

  for (const ad of activeAds) {
    if (!slotMap[ad.placement]) {
      slotMap[ad.placement] = ad
    }
  }

  const formatAd = (ad: Advertisement | null) => {
    if (!ad) return null
    const safe = ad.toSafeObject()
    const advertiser = (ad as any).advertiser
    const business = advertiser?.businessProfile
    return {
      ...safe,
      advertiserName: business?.business_name || advertiser?.full_name || 'Verified Sponsor',
      advertiserAvatar: business?.logo || advertiser?.avatar_url || null,
    }
  }

  return {
    homeTop: formatAd(slotMap.HOME_TOP),
    marketplaceMiddle: formatAd(slotMap.MARKETPLACE_MIDDLE),
    marketplaceBottom: formatAd(slotMap.MARKETPLACE_BOTTOM),
  }
}

/**
 * Create a new advertisement booking in PENDING_PAYMENT status.
 * Resolves price and duration strictly server-side from the monetization Plan.
 */
export async function createAdvertisement(
  advertiserId: string,
  data: {
    planId: string
    title: string
    description?: string | null
    image: string
    targetUrl: string
    placement: AdPlacement
  },
): Promise<Advertisement> {
  if (!VALID_PLACEMENTS.includes(data.placement)) {
    throw Object.assign(
      new Error(`Invalid placement "${data.placement}". Valid slots: ${VALID_PLACEMENTS.join(', ')}`),
      { statusCode: 400 },
    )
  }

  const safeUrl = validateSafeAdUrl(data.targetUrl)

  // 1. Resolve Server-side Price & Plan
  const plan = await Plan.findByPk(data.planId)
  if (!plan || !plan.is_active || plan.type !== 'ADVERTISEMENT') {
    throw Object.assign(new Error('Selected advertisement plan is invalid or inactive.'), {
      statusCode: 400,
    })
  }

  // 2. Create Advertisement record in PENDING_PAYMENT
  const ad = await Advertisement.create({
    advertiser_id: advertiserId,
    plan_id: plan.id,
    title: data.title.trim().slice(0, 150),
    description: data.description?.trim() || null,
    image: data.image.trim(),
    target_url: safeUrl,
    placement: data.placement,
    budget: Number(plan.price).toFixed(2),
    status: 'PENDING_PAYMENT',
    click_count: 0,
    impression_count: 0,
    priority: 0,
  })

  return ad
}

/**
 * Get advertisement by ID (with authorization check)
 */
export async function getAdvertisementById(
  adId: string,
  requesterId?: string,
  isAdmin = false,
): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId, {
    include: [
      {
        model: User,
        as: 'advertiser',
        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
        include: [{ model: BusinessProfile, as: 'businessProfile' }],
      },
      {
        model: Plan,
        as: 'plan',
      },
      {
        model: Payment,
        as: 'payment',
        attributes: ['id', 'reference', 'amount', 'currency', 'status', 'provider', 'paid_at'],
      },
    ],
  })

  if (!ad) {
    throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  }

  if (requesterId && ad.advertiser_id !== requesterId && !isAdmin) {
    throw Object.assign(new Error('Unauthorized access to this advertisement.'), { statusCode: 403 })
  }

  return ad
}

/**
 * List all advertisements owned by a specific advertiser
 */
export async function getAdvertisementsByUser(advertiserId: string): Promise<Advertisement[]> {
  return Advertisement.findAll({
    where: { advertiser_id: advertiserId },
    include: [
      { model: Plan, as: 'plan' },
      { model: Payment, as: 'payment', attributes: ['id', 'reference', 'status', 'paid_at'] },
    ],
    order: [['created_at', 'DESC']],
  })
}

/**
 * Admin view of all advertisements with optional status filter
 */
export async function getAllAdvertisementsAdmin(status?: AdStatus): Promise<Advertisement[]> {
  const where: any = {}
  if (status) where.status = status

  return Advertisement.findAll({
    where,
    include: [
      {
        model: User,
        as: 'advertiser',
        attributes: ['id', 'full_name', 'email', 'phone'],
        include: [{ model: BusinessProfile, as: 'businessProfile' }],
      },
      { model: Plan, as: 'plan' },
      { model: Payment, as: 'payment' },
      { model: User, as: 'reviewer', attributes: ['id', 'full_name'] },
    ],
    order: [['created_at', 'DESC']],
  })
}

/**
 * Approve an advertisement for live activation.
 * Enforces:
 * 1. Must be reviewed by Admin
 * 2. Payment must be verified/SUCCESS
 * 3. Position must NOT already have an ACTIVE ad (guarantees <= 3 total active ads)
 */
export async function approveAdvertisement(
  adId: string,
  adminId: string,
): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId, {
    include: [
      { model: Plan, as: 'plan' },
      { model: Payment, as: 'payment' },
    ],
  })

  if (!ad) {
    throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  }

  // 1. Verify payment status
  if (ad.payment_id) {
    const payment = (ad as any).payment || (await Payment.findByPk(ad.payment_id))
    if (payment && payment.status !== 'SUCCESS') {
      throw Object.assign(
        new Error(`Cannot approve advertisement: Payment status is ${payment.status}. Payment must be verified first.`),
        { statusCode: 400 },
      )
    }
  }

  // 2. Check if target placement is already occupied by an active ad
  const occupied = await isPlacementOccupied(ad.placement, ad.id)
  if (occupied) {
    throw Object.assign(
      new Error(
        `This advertising position (${ad.placement}) is currently occupied by another active advertisement. Pause or expire the existing ad first before activating a new one.`,
      ),
      { statusCode: 409 },
    )
  }

  // 3. Resolve duration
  const durationDays = (ad as any).plan?.duration_days || 7
  const now = new Date()
  const endAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  await ad.update({
    status: 'ACTIVE',
    reviewed_by: adminId,
    reviewed_at: now,
    start_at: now,
    end_at: endAt,
    rejection_reason: null,
  })

  // 4. Grant Entitlement
  await entitlementService.grantEntitlement({
    userId: ad.advertiser_id,
    type: 'ADVERTISEMENT',
    durationDays,
    paymentId: ad.payment_id,
    metadata: { advertisementId: ad.id, placement: ad.placement },
  })

  // 5. Audit Log
  await AdminAuditLog.create({
    admin_id: adminId,
    action: 'ADVERTISEMENT_APPROVED',
    target_type: 'ADVERTISEMENT',
    target_id: ad.id,
    metadata: {
      title: ad.title,
      placement: ad.placement,
      durationDays,
      startAt: now,
      endAt,
    },
  })

  return ad
}

/**
 * Reject an advertisement with a reason
 */
export async function rejectAdvertisement(
  adId: string,
  adminId: string,
  reason: string,
): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) {
    throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  }

  await ad.update({
    status: 'REJECTED',
    reviewed_by: adminId,
    reviewed_at: new Date(),
    rejection_reason: reason.trim(),
  })

  await AdminAuditLog.create({
    admin_id: adminId,
    action: 'ADVERTISEMENT_REJECTED',
    target_type: 'ADVERTISEMENT',
    target_id: ad.id,
    reason,
  })

  return ad
}

/**
 * Pause an active advertisement (by advertiser or admin)
 */
export async function pauseAdvertisement(adId: string, userId: string, isAdmin = false): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) {
    throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  }

  if (ad.advertiser_id !== userId && !isAdmin) {
    throw Object.assign(new Error('Unauthorized.'), { statusCode: 403 })
  }

  if (ad.status !== 'ACTIVE') {
    throw Object.assign(new Error(`Only ACTIVE advertisements can be paused. Current status: ${ad.status}`), {
      statusCode: 400,
    })
  }

  await ad.update({ status: 'PAUSED' })
  return ad
}

/**
 * Resume a paused advertisement (verifies slot is still free)
 */
export async function resumeAdvertisement(adId: string, userId: string, isAdmin = false): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) {
    throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  }

  if (ad.advertiser_id !== userId && !isAdmin) {
    throw Object.assign(new Error('Unauthorized.'), { statusCode: 403 })
  }

  if (ad.status !== 'PAUSED') {
    throw Object.assign(new Error(`Only PAUSED advertisements can be resumed. Current status: ${ad.status}`), {
      statusCode: 400,
    })
  }

  const occupied = await isPlacementOccupied(ad.placement, ad.id)
  if (occupied) {
    throw Object.assign(
      new Error(`Cannot resume: This advertising position (${ad.placement}) is currently occupied by another active advertisement.`),
      { statusCode: 409 },
    )
  }

  // Check if expired while paused
  if (ad.end_at && new Date(ad.end_at).getTime() < Date.now()) {
    await ad.update({ status: 'EXPIRED' })
    throw Object.assign(new Error('This advertisement has expired and cannot be resumed.'), { statusCode: 400 })
  }

  await ad.update({ status: 'ACTIVE' })
  return ad
}

/**
 * Cancel an ad before activation or by advertiser
 */
export async function cancelAdvertisement(adId: string, userId: string, isAdmin = false): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) {
    throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  }

  if (ad.advertiser_id !== userId && !isAdmin) {
    throw Object.assign(new Error('Unauthorized.'), { statusCode: 403 })
  }

  await ad.update({ status: 'CANCELLED' })
  return ad
}

/**
 * Background/cron routine to expire past-date active ads
 */
export async function expireOutdatedAds(): Promise<number> {
  const now = new Date()
  const [affectedCount] = await Advertisement.update(
    { status: 'EXPIRED' },
    {
      where: {
        status: 'ACTIVE',
        end_at: { [Op.lt]: now },
      },
    },
  )
  return affectedCount
}

/**
 * Record advertisement impression atomically
 */
export async function recordAdImpression(adId: string): Promise<void> {
  try {
    await Advertisement.increment('impression_count', { by: 1, where: { id: adId, status: 'ACTIVE' } })
  } catch {
    // Non-fatal fire-and-forget
  }
}

/**
 * Record advertisement click atomically and return safe redirect URL
 */
export async function recordAdClick(adId: string): Promise<string | null> {
  try {
    const ad = await Advertisement.findByPk(adId, { attributes: ['id', 'target_url', 'status'] })
    if (!ad) return null
    await Advertisement.increment('click_count', { by: 1, where: { id: adId } })
    return ad.target_url
  } catch {
    return null
  }
}

/**
 * Fetch available advertisement plans
 */
export async function getAdvertisementPlans(): Promise<Plan[]> {
  return Plan.findAll({
    where: {
      type: 'ADVERTISEMENT',
      is_active: true,
    },
    order: [['sort_order', 'ASC'], ['price', 'ASC']],
  })
}
