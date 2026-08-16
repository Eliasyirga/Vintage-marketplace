import type { Request, Response } from 'express'
import * as orderService from '../services/order.service'

/**
 * Pre-flight validation for Buy Now button
 * POST /api/orders/check-eligibility
 */
export async function checkBuyNowEligibility(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const { listingId } = req.body

  const result = await orderService.validateBuyNowEligible(listingId, userId)

  res.status(200).json({
    success: true,
    data: {
      eligible: result.eligible,
      listing: {
        id: result.listing.id,
        title: result.listing.title,
        price: Number(result.listing.price),
        condition: result.listing.condition,
        city: result.listing.city,
        subCity: result.listing.sub_city,
        status: result.listing.status,
      },
      seller: {
        id: result.seller.id,
        fullName: result.seller.full_name,
        isVerified: result.seller.is_phone_verified || result.seller.is_fayda_verified,
      },
    },
  })
}

/**
 * Create a new order with atomic listing reservation
 * POST /api/orders
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const buyerId = req.user!.id
  const input = req.body

  const { order, payment, initResult } = await orderService.createOrder(buyerId, input)

  res.status(201).json({
    success: true,
    message: 'Order created successfully.',
    data: {
      order: order.toSafeObject(),
      payment: payment ? payment.toSafeObject() : null,
      paymentInit: initResult || null,
    },
  })
}

/**
 * Get single order by ID with strict ownership authorization
 * GET /api/orders/:id
 */
export async function getOrderById(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const userRole = req.user!.role
  const id = req.params.id as string

  const order = await orderService.getOrderById(id, userId, userRole)

  res.status(200).json({
    success: true,
    data: order,
  })
}

/**
 * Get Buyer's orders
 * GET /api/orders/buyer/my-orders
 */
export async function getBuyerOrders(req: Request, res: Response): Promise<void> {
  const buyerId = req.user!.id
  const statusFilter = req.query.status as 'active' | 'completed' | 'cancelled' | undefined

  const orders = await orderService.getBuyerOrders(buyerId, statusFilter)

  res.status(200).json({
    success: true,
    data: orders,
  })
}

/**
 * Get Seller's orders
 * GET /api/orders/seller/my-orders
 */
export async function getSellerOrders(req: Request, res: Response): Promise<void> {
  const sellerId = req.user!.id
  const statusFilter = req.query.status as
    | 'new'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | undefined

  const orders = await orderService.getSellerOrders(sellerId, statusFilter)

  res.status(200).json({
    success: true,
    data: orders,
  })
}

/**
 * Seller confirms an order
 * POST /api/orders/:id/confirm
 */
export async function confirmOrder(req: Request, res: Response): Promise<void> {
  const sellerId = req.user!.id
  const id = req.params.id as string

  const order = await orderService.sellerConfirmOrder(id, sellerId)

  res.status(200).json({
    success: true,
    message: 'Order confirmed by seller.',
    data: order,
  })
}

/**
 * Seller marks item ready for delivery/pickup
 * POST /api/orders/:id/ready
 */
export async function markOrderReady(req: Request, res: Response): Promise<void> {
  const sellerId = req.user!.id
  const id = req.params.id as string

  const order = await orderService.sellerMarkReady(id, sellerId)

  res.status(200).json({
    success: true,
    message: 'Order marked as packed and ready for dispatch.',
    data: order,
  })
}

/**
 * Buyer completes order (receipt confirmed / purchase completed)
 * POST /api/orders/:id/complete
 */
export async function completeOrder(req: Request, res: Response): Promise<void> {
  const buyerId = req.user!.id
  const id = req.params.id as string

  const order = await orderService.completeOrder(id, buyerId)

  res.status(200).json({
    success: true,
    message: 'Order marked as completed! Listing is now marked SOLD.',
    data: order,
  })
}

/**
 * Cancel an order with refund handling
 * POST /api/orders/:id/cancel
 */
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const userRole = req.user!.role
  const id = req.params.id as string
  const { reason } = req.body

  const order = await orderService.cancelOrder(id, userId, reason, userRole === 'ADMIN')

  res.status(200).json({
    success: true,
    message: 'Order cancelled.',
    data: order,
  })
}
