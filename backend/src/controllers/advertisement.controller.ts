import type { Request, Response, NextFunction } from 'express'
import * as adService from '../services/advertisement.service'
import * as uploadService from '../services/upload.service'
import type { AdPlacement } from '../types/monetization.types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]
    return first.trim()
  }
  return req.socket?.remoteAddress
}

// ── Public / marketplace routes ───────────────────────────────────────────────

/**
 * GET /api/advertisements/active
 * Optional query parameter: ?placement=MARKETPLACE_BANNER | MARKETPLACE_FEATURED | MARKETPLACE_SIDEBAR
 * If placement provided: returns the active ad for that specific slot.
 * If omitted: returns all 3 slot payloads in one response for the marketplace layout.
 */
export async function getActiveSlots(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const placementParam = req.query.placement as string | undefined
    if (placementParam) {
      const placement = placementParam.trim() as AdPlacement
      if (!adService.VALID_PLACEMENTS.includes(placement)) {
        res.status(400).json({
          success: false,
          message: `Invalid placement "${placementParam}". Valid placements: ${adService.VALID_PLACEMENTS.join(', ')}`,
        })
        return
      }
      // Returns an array — frontend renders carousel when multiple ads exist
      const ads = await adService.getActiveAdForPlacement(placement)
      res.json({ success: true, data: ads })
      return
    }

    const slots = await adService.getActiveAdSlots()
    res.json({ success: true, data: slots })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/available-placements
 * Returns which slots are available vs occupied for plan selection UI.
 */
export async function getAvailablePlacements(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await adService.getAvailablePlacements()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/plans
 * Returns all active advertisement pricing plans.
 */
export async function getAdPlans(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plans = await adService.getAdvertisementPlans()
    res.json({ success: true, data: plans.map((p) => p.toSafeObject()) })
  } catch (err) {
    next(err)
  }
}

// ── Advertiser authenticated routes ──────────────────────────────────────────

/**
 * POST /api/advertisements
 * Accepts multipart/form-data: image (file) + planId, title, description, targetUrl, placement.
 * Uploads creative to Cloudinary, creates ad in PENDING_PAYMENT.
 */
export async function createAd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const { planId, title, description, targetUrl, placement } = req.body

    if (!planId || !title || !targetUrl || !placement) {
      res.status(400).json({
        success: false,
        message: 'planId, title, targetUrl, and placement are required.',
      })
      return
    }

    // Upload creative image (Cloudinary or local disk)
    const file = req.file as Express.Multer.File | undefined
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'An advertisement creative image is required.',
      })
      return
    }

    const adId = crypto.randomUUID()
    const uploaded = await uploadService.saveAdImage(file, adId)

    const ad = await adService.createAdvertisement(userId, {
      id: adId,
      planId,
      title,
      description: description ?? null,
      imageUrl: uploaded.url,
      imagePublicId: uploaded.publicId ?? null,
      imageWidth: uploaded.width ?? null,
      imageHeight: uploaded.height ?? null,
      imageFormat: uploaded.format ?? null,
      imageBytes: uploaded.bytes ?? null,
      targetUrl,
      placement: placement as AdPlacement,
    })

    res.status(201).json({
      success: true,
      message: 'Advertisement created. Proceed to payment to submit for review.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/my  (or /api/advertisements/my-ads)
 */
export async function getMyAds(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ads = await adService.getAdvertisementsByUser(req.user!.id)
    res.json({ success: true, data: ads.map((a) => a.toSafeObject()) })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/:id
 */
export async function getAdById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ad = await adService.getAdvertisementById(
      String(req.params.id),
      req.user?.id,
      req.user?.role === 'ADMIN',
    )
    res.json({ success: true, data: ad.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/advertisements/:id/pause
 */
export async function pauseAd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ad = await adService.pauseAdvertisement(
      String(req.params.id),
      req.user!.id,
      req.user?.role === 'ADMIN',
    )
    res.json({ success: true, message: 'Advertisement paused.', data: ad.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/advertisements/:id/resume
 */
export async function resumeAd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ad = await adService.resumeAdvertisement(
      String(req.params.id),
      req.user!.id,
      req.user?.role === 'ADMIN',
    )
    res.json({ success: true, message: 'Advertisement resumed.', data: ad.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/cancel
 */
export async function cancelAd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ad = await adService.cancelAdvertisement(
      String(req.params.id),
      req.user!.id,
      req.user?.role === 'ADMIN',
    )
    res.json({ success: true, message: 'Advertisement cancelled.', data: ad.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

// ── Analytics tracking ────────────────────────────────────────────────────────

/**
 * POST /api/advertisements/:id/impression
 * Deduplicated impression tracking — fire-and-forget, always returns 200.
 */
export async function recordImpression(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await adService.recordAdImpression(String(req.params.id), {
      ip: getClientIp(req),
      sessionId: req.body?.sessionId ?? undefined,
      userId: req.user?.id,
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/click
 * Records click and returns the safe destination targetUrl.
 */
export async function recordClick(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetUrl = await adService.recordAdClick(String(req.params.id), {
      ip: getClientIp(req),
      sessionId: req.body?.sessionId ?? undefined,
      userId: req.user?.id,
    })
    res.json({ success: true, targetUrl })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/:id/click
 * Browser redirect with tracking (used when image/link points directly to this URL).
 */
export async function handleClickRedirect(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetUrl = await adService.recordAdClick(String(req.params.id), {
      ip: getClientIp(req),
      userId: req.user?.id,
    })
    res.redirect(targetUrl ?? '/')
  } catch (err) {
    next(err)
  }
}

// ── Admin moderation ──────────────────────────────────────────────────────────

/**
 * GET /api/advertisements/admin  or  GET /api/admin/advertisements
 */
export async function getAllAdsAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = req.query.status ? (String(req.query.status) as any) : undefined
    const ads = await adService.getAllAdvertisementsAdmin(status)
    res.json({ success: true, data: ads.map((a) => a.toSafeObject()) })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/advertisements/admin/:id/approve
 */
export async function approveAdAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ad = await adService.approveAdvertisement(
      String(req.params.id),
      req.user!.id,
    )
    res.json({
      success: true,
      message: `Advertisement approved and now active in the ${ad.placement} slot.`,
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/advertisements/admin/:id/reject
 */
export async function rejectAdAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { reason } = req.body
    if (!reason?.trim()) {
      res.status(400).json({ success: false, message: 'A rejection reason is required.' })
      return
    }
    const ad = await adService.rejectAdvertisement(
      String(req.params.id),
      req.user!.id,
      reason,
    )
    res.json({
      success: true,
      message: 'Advertisement rejected.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}
