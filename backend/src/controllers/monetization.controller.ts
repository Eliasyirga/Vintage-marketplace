import type { Request, Response, NextFunction } from 'express'
import * as monetizationService from '../services/monetization.service'
import * as promotionService from '../services/promotion.service'
import * as entitlementService from '../services/entitlement.service'

export async function getPublicPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.query
    const plans = await monetizationService.getActivePlans(type as any)
    res.json({
      success: true,
      data: plans.map((p) => p.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8
    const listings = await promotionService.getFeaturedListings(limit)
    res.json({
      success: true,
      data: listings,
    })
  } catch (err) {
    next(err)
  }
}

export async function getMyEntitlements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const entitlements = await entitlementService.getUserActiveEntitlements(userId)
    res.json({
      success: true,
      data: entitlements.map((e) => e.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

export async function getAdminPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await monetizationService.getAllPlansAdmin()
    res.json({
      success: true,
      data: plans.map((p) => p.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

export async function createPlanAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plan = await monetizationService.createPlan(req.body)
    res.status(201).json({
      success: true,
      data: plan.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

export async function updatePlanAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const plan = await monetizationService.updatePlan(id, req.body)
    res.json({
      success: true,
      data: plan.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}

export async function getAdminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await monetizationService.getAdminMonetizationStats()
    res.json({
      success: true,
      data: stats,
    })
  } catch (err) {
    next(err)
  }
}
