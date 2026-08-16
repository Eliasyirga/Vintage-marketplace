import type { Request, Response, NextFunction } from 'express'
import * as sellerService from '../services/seller.service'
import { upsertSellerProfileSchema, sellerListingsQuerySchema } from '../schemas/seller.schema'

// ── GET /api/sellers/:sellerId ────────────────────────────────────────────────

export async function getPublicSellerProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sellerId = req.params.sellerId as string
    const seller = await sellerService.getPublicSellerProfile(sellerId)
    res.status(200).json({ success: true, seller })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/sellers/:sellerId/listings ───────────────────────────────────────

export async function getSellerPublicListings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sellerId = req.params.sellerId as string
    const parsed = sellerListingsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid query parameters.' })
      return
    }
    const result = await sellerService.getSellerPublicListings(
      sellerId,
      parsed.data,
    )
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/seller/profile (authenticated) ───────────────────────────────────

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await sellerService.getMySellerProfile(req.user!.id)
    res.status(200).json({ success: true, profile })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/seller/profile (authenticated) ─────────────────────────────────

export async function updateMyProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = upsertSellerProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      res.status(400).json({ success: false, message: 'Validation failed.', errors })
      return
    }

    // Always use req.user.id — never accept userId from client
    const profile = await sellerService.upsertMySellerProfile(req.user!.id, parsed.data)
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
    })
  } catch (err) {
    next(err)
  }
}
