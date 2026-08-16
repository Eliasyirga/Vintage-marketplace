import type { Request, Response, NextFunction } from 'express'
import * as recentlyViewedService from '../services/recentlyViewed.service'

export async function recordRecentlyViewed(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listingId = req.params.listingId as string
    if (!listingId) {
      res.status(400).json({ success: false, message: 'Listing ID is required.' })
      return
    }

    await recentlyViewedService.recordRecentlyViewed(req.user!.id, listingId)
    res.status(200).json({ success: true, message: 'Recorded' })
  } catch (err) {
    next(err)
  }
}

export async function getRecentlyViewed(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20
    const listings = await recentlyViewedService.getRecentlyViewed(req.user!.id, limit)
    res.status(200).json({
      success: true,
      data: listings,
    })
  } catch (err) {
    next(err)
  }
}

export async function clearRecentlyViewed(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await recentlyViewedService.clearRecentlyViewed(req.user!.id)
    res.status(200).json({
      success: true,
      message: 'Recently viewed history cleared.',
    })
  } catch (err) {
    next(err)
  }
}
