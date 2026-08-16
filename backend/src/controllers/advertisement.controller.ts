import type { Request, Response, NextFunction } from 'express'
import * as adService from '../services/advertisement.service'
import type { AdPlacement } from '../types/monetization.types'

/**
 * GET /api/advertisements/active
 * Returns all 3 primary ad slots in ONE single, high-performance API response.
 */
export async function getActiveSlots(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slots = await adService.getActiveAdSlots()
    res.json({
      success: true,
      data: slots,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/available-placements
 * Returns which slots are available vs occupied.
 */
export async function getAvailablePlacements(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adService.getAvailablePlacements()
    res.json({
      success: true,
      data,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/plans
 * Returns all active advertisement pricing plans.
 */
export async function getAdPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await adService.getAdvertisementPlans()
    res.json({
      success: true,
      data: plans.map((p) => p.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements
 * Submit a new advertisement for an advertiser in PENDING_PAYMENT status.
 */
export async function createAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const { planId, title, description, image, targetUrl, placement } = req.body

    if (!planId || !title || !image || !targetUrl || !placement) {
      res.status(400).json({
        success: false,
        message: 'Please provide planId, title, image, targetUrl, and placement.',
      })
      return
    }

    const ad = await adService.createAdvertisement(userId, {
      planId,
      title,
      description,
      image,
      targetUrl,
      placement: placement as AdPlacement,
    })

    res.status(201).json({
      success: true,
      message: 'Advertisement created. Please proceed to payment to submit for review.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/my-ads or /api/advertisements/my
 * Get all advertisements owned by the authenticated advertiser.
 */
export async function getMyAds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const ads = await adService.getAdvertisementsByUser(userId)
    res.json({
      success: true,
      data: ads.map((a) => a.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/:id
 * Get details for a single advertisement.
 */
export async function getAdById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const userId = req.user?.id
    const isAdmin = req.user?.role === 'ADMIN'

    const ad = await adService.getAdvertisementById(id, userId, isAdmin)
    res.json({
      success: true,
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/pause
 * Pause an active ad.
 */
export async function pauseAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const userId = req.user!.id
    const isAdmin = req.user?.role === 'ADMIN'

    const ad = await adService.pauseAdvertisement(id, userId, isAdmin)
    res.json({
      success: true,
      message: 'Advertisement paused.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/resume
 * Resume a paused ad.
 */
export async function resumeAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const userId = req.user!.id
    const isAdmin = req.user?.role === 'ADMIN'

    const ad = await adService.resumeAdvertisement(id, userId, isAdmin)
    res.json({
      success: true,
      message: 'Advertisement resumed.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/cancel
 * Cancel an advertisement.
 */
export async function cancelAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const userId = req.user!.id
    const isAdmin = req.user?.role === 'ADMIN'

    const ad = await adService.cancelAdvertisement(id, userId, isAdmin)
    res.json({
      success: true,
      message: 'Advertisement cancelled.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/impression
 * Track an impression event safely.
 */
export async function recordImpression(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    await adService.recordAdImpression(id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/advertisements/:id/click
 * Track a click event and return the targetUrl.
 */
export async function recordClick(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const targetUrl = await adService.recordAdClick(id)
    res.json({ success: true, targetUrl })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/advertisements/:id/click
 * Direct browser redirect with tracking.
 */
export async function handleClickRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const targetUrl = await adService.recordAdClick(id)
    if (targetUrl) {
      res.redirect(targetUrl)
    } else {
      res.redirect('/')
    }
  } catch (err) {
    next(err)
  }
}

// ── Admin Controllers ────────────────────────────────────────────────────────

/**
 * GET /api/advertisements/admin or /api/admin/advertisements
 */
export async function getAllAdsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status ? (String(req.query.status) as any) : undefined
    const ads = await adService.getAllAdvertisementsAdmin(status)
    res.json({
      success: true,
      data: ads.map((a) => a.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST or PATCH /api/advertisements/admin/:id/approve
 */
export async function approveAdAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user!.id
    const id = String(req.params.id)
    const ad = await adService.approveAdvertisement(id, adminId)
    res.json({
      success: true,
      message: `Advertisement approved and active in ${ad.placement}.`,
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST or PATCH /api/advertisements/admin/:id/reject
 */
export async function rejectAdAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user!.id
    const id = String(req.params.id)
    const { reason } = req.body
    const ad = await adService.rejectAdvertisement(id, adminId, reason || 'Did not meet content guidelines.')
    res.json({
      success: true,
      message: 'Advertisement rejected.',
      data: ad.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}
