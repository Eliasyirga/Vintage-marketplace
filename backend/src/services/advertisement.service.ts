/**
 * Advertisement Service — full lifecycle management.
 *
 * Lifecycle:
 *   DRAFT (optional) → PENDING_PAYMENT → PAYMENT_VERIFIED
 *   → PENDING_REVIEW → APPROVED → ACTIVE → EXPIRED | PAUSED | CANCELLED
 *
 * Security:
 *   - Price always resolved server-side from Plan
 *   - Target URL is sanitized (only http/https)
 *   - Placement slot conflict checked before APPROVED → ACTIVE transition
 *   - Click/impression deduplicated via AdvertisementEvent (24-hour window)
 */

import crypto from 'crypto'
import { Op } from 'sequelize'
import {
  Advertisement,
  AdvertisementEvent,
  User,
  BusinessProfile,
  Plan,
  Payment,
  AdminAuditLog,
} from '../models'
import type { AdPlacement, AdStatus } from '../types/monetization.types'
import * as entitlementService from './entitlement.service'
import * as uploadService from './upload.service'

// ── Constants ─────────────────────────────────────────────────────────────────

export const VALID_PLACEMENTS: AdPlacement[] = [
  'MARKETPLACE_BANNER',
  'MARKETPLACE_FEATURED',
  'MARKETPLACE_SIDEBAR',
]

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

// ── URL / Security helpers ────────────────────────────────────────────────────

export function validateSafeAdUrl(urlStr: string): string {
  const trimmed = (urlStr || '').trim()
  if (!trimmed) {
    throw Object.assign(new Error('Target URL is required.'), { statusCode: 400 })
  }
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    throw Object.assign(
      new Error('Unsafe URL scheme. Only http:// and https:// are permitted.'),
      { statusCode: 400 },
    )
  }
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Advertisement target URL must use http:// or https://')
    }
    return trimmed
  } catch (err: any) {
    throw Object.assign(
      new Error(err.message || 'Invalid target URL format.'),
      { statusCode: 400 },
    )
  }
}

function hashIp(ip: string | undefined): string | null {
  if (!ip) return null
  return crypto.createHash('sha256').update(ip).digest('hex')
}

// ── Slot queries ──────────────────────────────────────────────────────────────

export interface ActiveAdSlotsResponse {
  marketplaceBanner: ReturnType<Advertisement['toSafeObject']>[]
  marketplaceFeatured: ReturnType<Advertisement['toSafeObject']>[]
  marketplaceSidebar: ReturnType<Advertisement['toSafeObject']>[]
}

export async function isPlacementOccupied(
  placement: AdPlacement,
  excludeAdId?: string,
): Promise<boolean> {
  const now = new Date()
  const where: any = {
    placement,
    status: 'ACTIVE',
    [Op.and]: [
      { [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }] },
      { [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }] },
    ],
  }
  if (excludeAdId) where.id = { [Op.ne]: excludeAdId }
  const count = await Advertisement.count({ where })
  return count > 0
}

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

  return { available, occupied, slots: slots as Record<AdPlacement, boolean> }
}

/**
 * Fetch all active ads for a specific placement slot (ordered by priority DESC).
 * Returns empty array if the slot is unbooked.
 */
export async function getActiveAdForPlacement(
  placement: AdPlacement,
): Promise<(ReturnType<Advertisement['toSafeObject']> & {
  advertiserName: string
  advertiserAvatar: string | null
})[]> {
  if (!VALID_PLACEMENTS.includes(placement)) {
    throw Object.assign(
      new Error(
        `Invalid placement "${placement}". Valid slots: ${VALID_PLACEMENTS.join(', ')}`,
      ),
      { statusCode: 400 },
    )
  }

  const now = new Date()
  const ads = await Advertisement.findAll({
    where: {
      status: 'ACTIVE',
      placement,
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

  return ads.map((ad) => {
    const safe = ad.toSafeObject()
    const advertiser = (ad as any).advertiser
    const business = advertiser?.businessProfile
    return {
      ...safe,
      advertiserName:
        business?.business_name || advertiser?.full_name || 'Verified Sponsor',
      advertiserAvatar: business?.logo || advertiser?.avatar_url || null,
    }
  })
}

/**
 * Fetch ALL active ads for each of the 3 marketplace slots (supports carousel rotation).
 * Returns an empty array for any unbooked slot (frontend renders a fallback CTA).
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

  const slotMap: Record<AdPlacement, Advertisement[]> = {
    MARKETPLACE_BANNER: [],
    MARKETPLACE_FEATURED: [],
    MARKETPLACE_SIDEBAR: [],
  }

  for (const ad of activeAds) {
    slotMap[ad.placement].push(ad)
  }

  const formatAd = (ad: Advertisement) => {
    const safe = ad.toSafeObject()
    const advertiser = (ad as any).advertiser
    const business = advertiser?.businessProfile
    return {
      ...safe,
      advertiserName:
        business?.business_name || advertiser?.full_name || 'Verified Sponsor',
      advertiserAvatar: business?.logo || advertiser?.avatar_url || null,
    }
  }

  return {
    marketplaceBanner: slotMap.MARKETPLACE_BANNER.map(formatAd),
    marketplaceFeatured: slotMap.MARKETPLACE_FEATURED.map(formatAd),
    marketplaceSidebar: slotMap.MARKETPLACE_SIDEBAR.map(formatAd),
  }
}

// ── Creation ──────────────────────────────────────────────────────────────────

/**
 * Create a new advertisement booking in PENDING_PAYMENT status.
 * Price is always resolved server-side from the Plan record.
 * The ad creative image has already been uploaded — pass the URL and publicId.
 */
export async function createAdvertisement(
  advertiserId: string,
  data: {
    id?: string
    planId: string
    title: string
    description?: string | null
    imageUrl: string
    imagePublicId?: string | null
    imageWidth?: number | null
    imageHeight?: number | null
    imageFormat?: string | null
    imageBytes?: number | null
    targetUrl: string
    placement: AdPlacement
  },
): Promise<Advertisement> {
  if (!VALID_PLACEMENTS.includes(data.placement)) {
    throw Object.assign(
      new Error(
        `Invalid placement "${data.placement}". Valid slots: ${VALID_PLACEMENTS.join(', ')}`,
      ),
      { statusCode: 400 },
    )
  }

  const safeUrl = validateSafeAdUrl(data.targetUrl)

  const plan = await Plan.findByPk(data.planId)
  if (!plan || !plan.is_active || plan.type !== 'ADVERTISEMENT') {
    throw Object.assign(
      new Error('Selected advertisement plan is invalid or inactive.'),
      { statusCode: 400 },
    )
  }

  const ad = await Advertisement.create({
    id: data.id,
    advertiser_id: advertiserId,
    plan_id: plan.id,
    title: data.title.trim().slice(0, 150),
    description: data.description?.trim() || null,
    image: data.imageUrl,
    image_public_id: data.imagePublicId ?? null,
    image_width: data.imageWidth ?? null,
    image_height: data.imageHeight ?? null,
    image_format: data.imageFormat ?? null,
    image_bytes: data.imageBytes ?? null,
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

// ── Payment integration ───────────────────────────────────────────────────────

/**
 * Called by the payment webhook/verification handler when a payment for an
 * advertisement purpose is confirmed as SUCCESS.
 * Transitions: PENDING_PAYMENT → PAYMENT_VERIFIED → PENDING_REVIEW
 */
export async function handleAdPaymentSuccess(adId: string): Promise<void> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) return
  if (ad.status !== 'PENDING_PAYMENT') return
  await ad.update({ status: 'PAYMENT_VERIFIED' })
  // Auto-advance to PENDING_REVIEW so admins can immediately see it in the queue
  await ad.update({ status: 'PENDING_REVIEW' })
}

// ── Single ad lookup ──────────────────────────────────────────────────────────

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
      { model: Plan, as: 'plan' },
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
    throw Object.assign(new Error('Unauthorized access to this advertisement.'), {
      statusCode: 403,
    })
  }

  return ad
}

// ── Advertiser lists ──────────────────────────────────────────────────────────

export async function getAdvertisementsByUser(
  advertiserId: string,
): Promise<Advertisement[]> {
  return Advertisement.findAll({
    where: { advertiser_id: advertiserId },
    include: [
      { model: Plan, as: 'plan' },
      {
        model: Payment,
        as: 'payment',
        attributes: ['id', 'reference', 'status', 'paid_at'],
      },
    ],
    order: [['created_at', 'DESC']],
  })
}

// ── Admin views ───────────────────────────────────────────────────────────────

export async function getAllAdvertisementsAdmin(
  status?: AdStatus,
): Promise<Advertisement[]> {
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

// ── Admin moderation ──────────────────────────────────────────────────────────

/**
 * Admin: Approve an advertisement.
 * 1. Must be in PENDING_REVIEW (payment already verified)
 * 2. Placement slot must be free
 * 3. Transitions to APPROVED then ACTIVE with computed start_at / end_at
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

  if (!['PENDING_REVIEW', 'PAYMENT_VERIFIED', 'APPROVED'].includes(ad.status)) {
    throw Object.assign(
      new Error(
        `Cannot approve advertisement in status "${ad.status}". Must be in PENDING_REVIEW.`,
      ),
      { statusCode: 400 },
    )
  }

  // Verify payment is SUCCESS
  if (ad.payment_id) {
    const payment =
      (ad as any).payment || (await Payment.findByPk(ad.payment_id))
    if (payment && payment.status !== 'SUCCESS') {
      throw Object.assign(
        new Error(
          `Cannot approve: payment status is "${payment.status}". Payment must be SUCCESS first.`,
        ),
        { statusCode: 400 },
      )
    }
  }

  // Note: Multiple active ads per placement are allowed (carousel rotation).
  // No slot-conflict check — each approved ad rotates in the carousel.

  // Compute duration from plan
  const durationDays = (ad as any).plan?.duration_days ?? 7
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

  // Grant entitlement to advertiser
  await entitlementService.grantEntitlement({
    userId: ad.advertiser_id,
    type: 'ADVERTISEMENT',
    durationDays,
    paymentId: ad.payment_id,
    metadata: { advertisementId: ad.id, placement: ad.placement },
  })

  // Audit trail
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
 * Admin: Reject an advertisement with a mandatory reason.
 */
export async function rejectAdvertisement(
  adId: string,
  adminId: string,
  reason: string,
): Promise<Advertisement> {
  if (!reason?.trim()) {
    throw Object.assign(new Error('A rejection reason is required.'), { statusCode: 400 })
  }

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

// ── Advertiser controls ────────────────────────────────────────────────────────

export async function pauseAdvertisement(
  adId: string,
  userId: string,
  isAdmin = false,
): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  if (ad.advertiser_id !== userId && !isAdmin)
    throw Object.assign(new Error('Unauthorized.'), { statusCode: 403 })
  if (ad.status !== 'ACTIVE')
    throw Object.assign(
      new Error(`Only ACTIVE ads can be paused. Current status: ${ad.status}`),
      { statusCode: 400 },
    )
  await ad.update({ status: 'PAUSED' })
  return ad
}

export async function resumeAdvertisement(
  adId: string,
  userId: string,
  isAdmin = false,
): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  if (ad.advertiser_id !== userId && !isAdmin)
    throw Object.assign(new Error('Unauthorized.'), { statusCode: 403 })
  if (ad.status !== 'PAUSED')
    throw Object.assign(
      new Error(`Only PAUSED ads can be resumed. Current status: ${ad.status}`),
      { statusCode: 400 },
    )

  // Check if expired while paused
  if (ad.end_at && new Date(ad.end_at).getTime() < Date.now()) {
    await ad.update({ status: 'EXPIRED' })
    throw Object.assign(
      new Error('This advertisement has expired and cannot be resumed.'),
      { statusCode: 400 },
    )
  }

  const occupied = await isPlacementOccupied(ad.placement, ad.id)
  if (occupied) {
    throw Object.assign(
      new Error(
        `Cannot resume: slot "${ad.placement}" is occupied by another active ad.`,
      ),
      { statusCode: 409 },
    )
  }

  await ad.update({ status: 'ACTIVE' })
  return ad
}

export async function cancelAdvertisement(
  adId: string,
  userId: string,
  isAdmin = false,
): Promise<Advertisement> {
  const ad = await Advertisement.findByPk(adId)
  if (!ad) throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
  if (ad.advertiser_id !== userId && !isAdmin)
    throw Object.assign(new Error('Unauthorized.'), { statusCode: 403 })
  if (['ACTIVE', 'EXPIRED', 'CANCELLED'].includes(ad.status))
    throw Object.assign(
      new Error(`Cannot cancel an ad in status "${ad.status}".`),
      { statusCode: 400 },
    )

  // Clean up creative from Cloudinary if still in draft / pending payment
  if (['DRAFT', 'PENDING_PAYMENT'].includes(ad.status) && ad.image_public_id) {
    await uploadService.deleteAdImage(ad.image_public_id)
  }

  await ad.update({ status: 'CANCELLED' })
  return ad
}

// ── Analytics tracking ─────────────────────────────────────────────────────────

/**
 * Record an impression for an ad — deduplicated per (ad, ip, session) within 24h.
 * Returns true if the impression was recorded, false if it was deduplicated.
 */
export async function recordAdImpression(
  adId: string,
  options: { ip?: string; sessionId?: string; userId?: string } = {},
): Promise<boolean> {
  try {
    const ad = await Advertisement.findByPk(adId, {
      attributes: ['id', 'status'],
    })
    if (!ad || ad.status !== 'ACTIVE') return false

    const ipHash = hashIp(options.ip)
    const since = new Date(Date.now() - DEDUP_WINDOW_MS)

    // Dedup: only one impression per (ad, ip_hash) per 24h window
    if (ipHash) {
      const existing = await AdvertisementEvent.findOne({
        where: {
          advertisement_id: adId,
          event_type: 'IMPRESSION',
          ip_hash: ipHash,
          created_at: { [Op.gte]: since },
        },
        attributes: ['id'],
      })
      if (existing) return false
    }

    await AdvertisementEvent.create({
      advertisement_id: adId,
      event_type: 'IMPRESSION',
      session_id: options.sessionId ?? null,
      user_id: options.userId ?? null,
      ip_hash: ipHash,
    })

    await Advertisement.increment('impression_count', {
      by: 1,
      where: { id: adId, status: 'ACTIVE' },
    })

    return true
  } catch {
    return false
  }
}

/**
 * Record a click and return the safe destination URL.
 * Clicks are NOT deduplicated — intentional user action.
 */
export async function recordAdClick(
  adId: string,
  options: { ip?: string; sessionId?: string; userId?: string } = {},
): Promise<string | null> {
  try {
    const ad = await Advertisement.findByPk(adId, {
      attributes: ['id', 'target_url', 'status'],
    })
    if (!ad) return null

    await AdvertisementEvent.create({
      advertisement_id: adId,
      event_type: 'CLICK',
      session_id: options.sessionId ?? null,
      user_id: options.userId ?? null,
      ip_hash: hashIp(options.ip),
    })

    await Advertisement.increment('click_count', { by: 1, where: { id: adId } })

    return ad.target_url
  } catch {
    return null
  }
}

// ── Plan lookup ───────────────────────────────────────────────────────────────

export async function getAdvertisementPlans(): Promise<Plan[]> {
  return Plan.findAll({
    where: { type: 'ADVERTISEMENT', is_active: true },
    order: [['sort_order', 'ASC'], ['price', 'ASC']],
  })
}

// ── Expiry cron helper ────────────────────────────────────────────────────────

export async function expireOutdatedAds(): Promise<number> {
  const now = new Date()
  const [affectedCount] = await Advertisement.update(
    { status: 'EXPIRED' },
    { where: { status: 'ACTIVE', end_at: { [Op.lt]: now } } },
  )
  return affectedCount
}
