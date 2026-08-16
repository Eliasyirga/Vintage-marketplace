import type { Request, Response } from 'express'
import * as deliveryService from '../services/delivery.service'

/**
 * Preview delivery fee and estimated days based on zones
 * GET /api/delivery/estimate
 */
export async function estimateDeliveryFee(req: Request, res: Response): Promise<void> {
  const sellerSubCity = req.query.sellerSubCity as string | undefined
  const buyerSubCity = req.query.buyerSubCity as string | undefined
  const sellerCity = (req.query.sellerCity as string) || 'Addis Ababa'
  const buyerCity = (req.query.buyerCity as string) || 'Addis Ababa'

  const estimate = deliveryService.calculateDeliveryFee(
    sellerSubCity,
    buyerSubCity,
    sellerCity,
    buyerCity,
  )

  res.status(200).json({
    success: true,
    data: estimate,
  })
}

/**
 * Update delivery status (by seller or delivery partner/admin)
 * PATCH /api/delivery/:id/status
 */
export async function updateDeliveryStatus(req: Request, res: Response): Promise<void> {
  const actorId = req.user!.id
  const id = req.params.id as string
  const { status, notes } = req.body

  const delivery = await deliveryService.updateDeliveryStatus(id, status, actorId, notes)

  res.status(200).json({
    success: true,
    message: `Delivery status updated to ${status}`,
    data: delivery,
  })
}
