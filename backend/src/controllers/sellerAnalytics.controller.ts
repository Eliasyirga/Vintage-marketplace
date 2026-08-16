import type { Request, Response, NextFunction } from 'express'
import * as analyticsService from '../services/sellerAnalytics.service'

export async function getMyAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sellerId = req.user!.id
    const days = req.query.days ? Number(req.query.days) : 30
    const analytics = await analyticsService.getSellerAnalytics(sellerId, days)
    res.json({
      success: true,
      data: analytics,
    })
  } catch (err) {
    next(err)
  }
}
