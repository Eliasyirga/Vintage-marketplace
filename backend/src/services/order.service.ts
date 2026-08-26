import { Op } from 'sequelize'
import { sequelize } from '../config/database'
import {
  Order,
  OrderEvent,
  Listing,
  ListingImage,
  User,
  SellerProfile,
  DeliveryOrder,
  MeetingOrder,
  Payment,
} from '../models'
import type {
  CreateOrderInput,
  OrderStatus,
  OrderPaymentStatus,
} from '../types/order.types'
import { calculateDeliveryFee, createDeliveryOrder } from './delivery.service'
import { createMeetingOrder } from './meeting.service'
import { sendOrderNotification } from './orderNotification.service'
import { createPayment, refundPayment as processPaymentRefund } from './payment/payment.service'
import type { PaymentInitResult } from './payment/PaymentProvider'

// Configurable Platform Transaction Fee (5%)
export const PLATFORM_FEE_PERCENTAGE = 0.05
export const RESERVATION_EXPIRY_MINUTES = 15

/**
 * Server-side pre-flight check before a buyer initiates checkout.
 * Enforces all 7 business rules strictly on backend.
 */
export async function validateBuyNowEligible(
  listingId: string,
  buyerId: string,
): Promise<{ eligible: boolean; listing: Listing; seller: User }> {
  // First clean up any expired reservations globally
  await cleanupExpiredReservations().catch(() => 0)

  const listing = await Listing.findByPk(listingId, {
    include: [{ model: User, as: 'seller' }],
  })

  if (!listing) {
    throw Object.assign(new Error('Listing does not exist.'), { statusCode: 404 })
  }

  const seller = (listing as any).seller as User
  if (!seller) {
    throw Object.assign(new Error('Listing seller account not found.'), { statusCode: 404 })
  }

  if (seller.status !== 'ACTIVE') {
    throw Object.assign(new Error('Seller account is suspended or inactive.'), { statusCode: 400 })
  }

  if (listing.seller_id === buyerId) {
    throw Object.assign(new Error('You cannot purchase your own listing.'), { statusCode: 400 })
  }

  if (listing.status === 'SOLD') {
    throw Object.assign(new Error('This one-of-one vintage item has already been sold.'), {
      statusCode: 409,
    })
  }

  if (listing.status === 'RESERVED') {
    // Check if there is an active pending reservation order for this listing
    const activeOrder = await Order.findOne({
      where: {
        listing_id: listingId,
        status: { [Op.in]: ['PENDING_PAYMENT', 'MEETING_REQUESTED'] },
        payment_status: 'PENDING',
      },
      order: [['created_at', 'DESC']],
    })

    const now = new Date()
    if (!activeOrder) {
      // Stale reservation status without an active pending order — release to ACTIVE
      await listing.update({ status: 'ACTIVE' })
      listing.status = 'ACTIVE'
    } else if (activeOrder.reservation_expires_at && new Date(activeOrder.reservation_expires_at) < now) {
      // Expired reservation — cancel stale order and release listing back to ACTIVE
      await activeOrder.update({ status: 'CANCELLED', reservation_expires_at: null })
      await listing.update({ status: 'ACTIVE' })
      listing.status = 'ACTIVE'
    } else if (activeOrder.buyer_id === buyerId) {
      // The SAME buyer is returning to complete/modify checkout — allow access!
      return { eligible: true, listing, seller }
    } else {
      throw Object.assign(
        new Error('This item is currently reserved in an active checkout session by another buyer.'),
        { statusCode: 409 },
      )
    }
  }

  if (listing.status !== 'ACTIVE') {
    throw Object.assign(new Error('This listing is not currently available for purchase.'), {
      statusCode: 400,
    })
  }

  return { eligible: true, listing, seller }
}

/**
 * Generates a human-friendly order identifier (e.g. BONDA-2026-000123).
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `BONDA-${year}-${random}`
}

/**
 * Creates an order inside a strict PostgreSQL transaction with row-level locking (SELECT ... FOR UPDATE)
 * to eliminate race conditions on 1-of-1 items.
 */
export async function createOrder(
  buyerId: string,
  input: CreateOrderInput,
): Promise<{ order: Order; payment?: Payment; initResult?: PaymentInitResult }> {
  // Pre-flight check
  await validateBuyNowEligible(input.listingId, buyerId)

  let createdOrder!: Order
  let paymentRecord: Payment | undefined
  let paymentInitResult: PaymentInitResult | undefined

  await sequelize.transaction(async (t) => {
    // 1. Acquire pessimistic row-level lock on listing to prevent race conditions
    const listing = await Listing.findByPk(input.listingId, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    })

    if (!listing) {
      throw Object.assign(new Error('Listing does not exist.'), { statusCode: 404 })
    }

    if (listing.status === 'RESERVED') {
      // Check if this is the same buyer re-initiating/retrying checkout
      const existingPendingOrder = await Order.findOne({
        where: {
          listing_id: listing.id,
          buyer_id: buyerId,
          status: { [Op.in]: ['PENDING_PAYMENT', 'MEETING_REQUESTED'] },
          payment_status: 'PENDING',
        },
        transaction: t,
      })

      if (existingPendingOrder) {
        // Cancel the prior pending session and recreate with updated fulfillment/payment details
        await existingPendingOrder.update(
          { status: 'CANCELLED', reservation_expires_at: null },
          { transaction: t },
        )
      } else {
        throw Object.assign(
          new Error('This item was just reserved or purchased by another buyer.'),
          { statusCode: 409 },
        )
      }
    } else if (listing.status !== 'ACTIVE') {
      throw Object.assign(
        new Error('This item was just reserved or purchased by another buyer.'),
        { statusCode: 409 },
      )
    }

    const seller = await User.findByPk(listing.seller_id, { transaction: t })
    if (!seller || seller.status !== 'ACTIVE') {
      throw Object.assign(new Error('Seller is not currently eligible for sales.'), { statusCode: 400 })
    }

    // 2. Authoritative financial calculations on backend (using exact cents)
    const itemPrice = Number(listing.price)
    const itemPriceCents = Math.round(itemPrice * 100)

    const platformFeeCents = Math.round(itemPriceCents * PLATFORM_FEE_PERCENTAGE)
    const platformFee = platformFeeCents / 100

    const sellerAmountCents = itemPriceCents - platformFeeCents
    const sellerAmount = sellerAmountCents / 100

    let deliveryFee = 0
    if (input.fulfillmentMethod === 'DELIVERY' && input.deliveryInfo) {
      const estimate = calculateDeliveryFee(
        listing.sub_city,
        input.deliveryInfo.subCity,
        listing.city,
        input.deliveryInfo.city,
      )
      deliveryFee = estimate.deliveryFee
    }

    const totalAmountCents = itemPriceCents + Math.round(deliveryFee * 100)
    const totalAmount = totalAmountCents / 100

    // 3. Temporarily reserve listing
    const now = new Date()
    const reservationExpiresAt = new Date(now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000)

    await listing.update(
      {
        status: 'RESERVED',
      },
      { transaction: t },
    )

    // 4. Create Order Record
    const orderNumber = generateOrderNumber()
    createdOrder = await Order.create(
      {
        order_number: orderNumber,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        listing_id: listing.id,
        item_price: itemPrice.toFixed(2),
        delivery_fee: deliveryFee.toFixed(2),
        platform_fee: platformFee.toFixed(2),
        seller_amount: sellerAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        currency: 'ETB',
        fulfillment_method: input.fulfillmentMethod,
        payment_method: input.paymentMethod,
        payment_status: input.paymentMethod === 'DIRECT_TO_SELLER' ? 'PENDING' : 'PENDING',
        status:
          input.fulfillmentMethod === 'MEET_IN_PERSON'
            ? 'MEETING_REQUESTED'
            : 'PENDING_PAYMENT',
        reservation_expires_at: reservationExpiresAt,
        metadata: {
          clientFulfillment: input.fulfillmentMethod,
          clientPayment: input.paymentMethod,
        },
      },
      { transaction: t },
    )

    // 5. Create Fulfillment Sub-order
    if (input.fulfillmentMethod === 'DELIVERY') {
      if (!input.deliveryInfo) {
        throw Object.assign(new Error('Delivery information is required for delivery fulfillment.'), {
          statusCode: 400,
        })
      }
      await createDeliveryOrder(
        createdOrder.id,
        input.deliveryInfo,
        listing.sub_city,
        listing.city,
        t,
      )
    } else {
      if (!input.meetingInfo) {
        throw Object.assign(new Error('Meeting details are required for meet-in-person fulfillment.'), {
          statusCode: 400,
        })
      }
      await createMeetingOrder(createdOrder.id, input.meetingInfo, t)
    }

    // 6. Record Audit Timeline Event
    await OrderEvent.create(
      {
        order_id: createdOrder.id,
        actor_id: buyerId,
        event_type: 'ORDER_CREATED',
        description: `Order #${orderNumber} created (${input.fulfillmentMethod} - ${input.paymentMethod})`,
        metadata: { totalAmount, itemPrice, deliveryFee, platformFee },
      },
      { transaction: t },
    )
  })

  // 7. If Platform Payment, initialize payment gateway transaction
  if (input.paymentMethod === 'PLATFORM_PAYMENT') {
    const providerName = input.provider === 'MOCK' ? 'MOCK' : 'CHAPA'
    const { payment, initResult } = await createPayment(buyerId, {
      purpose: 'ORDER_PURCHASE',
      provider: providerName,
      transactionId: createdOrder.id,
      orderId: createdOrder.id,
      returnUrl: input.returnUrl,
      callbackUrl: input.callbackUrl,
    })

    paymentRecord = payment
    paymentInitResult = initResult

    await createdOrder.update({
      metadata: {
        ...(createdOrder.metadata || {}),
        paymentId: payment.id,
        paymentReference: payment.reference,
      },
    })
  }

  // 8. Notify Seller of New Order
  await sendOrderNotification({
    userId: createdOrder.seller_id,
    title: '🔔 New Order Received!',
    message: `Someone purchased your "${createdOrder.order_number}" (${input.fulfillmentMethod}).`,
    type: 'ORDER',
    link: `/orders/${createdOrder.id}`,
  })

  return {
    order: createdOrder,
    payment: paymentRecord,
    initResult: paymentInitResult,
  }
}

/**
 * Handle successful payment for an Order (called from verifyAndProcessPayment / Webhook)
 */
export async function handleOrderPaymentSuccess(
  orderId: string,
  payment: Payment,
): Promise<void> {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Listing, as: 'listing' }],
  })

  if (!order) return

  // Idempotency: If already marked PAID, return
  if (order.payment_status === 'SUCCESS') return

  await sequelize.transaction(async (t) => {
    const newStatus: OrderStatus =
      order.fulfillment_method === 'DELIVERY'
        ? 'PREPARING'
        : 'MEETING_REQUESTED'

    await order.update(
      {
        payment_status: 'SUCCESS',
        status: newStatus,
        reservation_expires_at: null, // Lock in permanent reservation
      },
      { transaction: t },
    )

    await OrderEvent.create(
      {
        order_id: order.id,
        actor_id: order.buyer_id,
        event_type: 'PAYMENT_SUCCESS',
        description: `Payment of ${order.total_amount} ETB confirmed via ${payment.provider} (Ref: ${payment.reference})`,
        metadata: { paymentId: payment.id, reference: payment.reference, amount: payment.amount },
      },
      { transaction: t },
    )
  })

  // Notify seller to prepare or confirm meeting
  await sendOrderNotification({
    userId: order.seller_id,
    title: '💰 Payment Confirmed for Order',
    message: `Payment for order #${order.order_number} has been verified. Please prepare the product.`,
    type: 'PAYMENT',
    link: `/orders/${order.id}`,
  })

  // Notify buyer of successful purchase
  await sendOrderNotification({
    userId: order.buyer_id,
    title: '🎉 Order Confirmed!',
    message: `Your payment for order #${order.order_number} was successful.`,
    type: 'PAYMENT',
    link: `/orders/${order.id}`,
  })
}

/**
 * Format Order instance into clean plain JSON response with camelCase and numeric fields
 */
export function formatOrder(order: any): any {
  if (!order) return null
  const plain = typeof order.get === 'function' ? order.get({ plain: true }) : order
  return {
    ...plain,
    id: plain.id,
    orderNumber: plain.order_number ?? plain.orderNumber,
    buyerId: plain.buyer_id ?? plain.buyerId,
    sellerId: plain.seller_id ?? plain.sellerId,
    listingId: plain.listing_id ?? plain.listingId,
    itemPrice: Number(plain.item_price ?? plain.itemPrice ?? 0),
    deliveryFee: Number(plain.delivery_fee ?? plain.deliveryFee ?? 0),
    platformFee: Number(plain.platform_fee ?? plain.platformFee ?? 0),
    sellerAmount: Number(plain.seller_amount ?? plain.sellerAmount ?? 0),
    totalAmount: Number(plain.total_amount ?? plain.totalAmount ?? 0),
    currency: plain.currency ?? 'ETB',
    fulfillmentMethod: plain.fulfillment_method ?? plain.fulfillmentMethod,
    paymentMethod: plain.payment_method ?? plain.paymentMethod,
    paymentStatus: plain.payment_status ?? plain.paymentStatus,
    status: plain.status,
    reservationExpiresAt: plain.reservation_expires_at ?? plain.reservationExpiresAt,
    metadata: plain.metadata,
    createdAt: plain.created_at ?? plain.createdAt,
    updatedAt: plain.updated_at ?? plain.updatedAt,
    listing: plain.listing
      ? {
          ...plain.listing,
          price: Number(plain.listing.price ?? 0),
          images: plain.listing.images || [],
        }
      : undefined,
    delivery: plain.delivery
      ? {
          ...plain.delivery,
          deliveryFee: Number(plain.delivery.delivery_fee ?? plain.delivery.deliveryFee ?? 0),
          platformCommission: Number(
            plain.delivery.platform_commission ?? plain.delivery.platformCommission ?? 0,
          ),
          recipientName: plain.delivery.recipient_name ?? plain.delivery.recipientName,
          recipientPhone: plain.delivery.recipient_phone ?? plain.delivery.recipientPhone,
          deliveryLocation: plain.delivery.delivery_location ?? plain.delivery.deliveryLocation,
          deliveryNotes: plain.delivery.delivery_notes ?? plain.delivery.deliveryNotes,
          trackingReference: plain.delivery.tracking_reference ?? plain.delivery.trackingReference,
          estimatedDeliveryAt:
            plain.delivery.estimated_delivery_at ?? plain.delivery.estimatedDeliveryAt,
          pickedUpAt: plain.delivery.picked_up_at ?? plain.delivery.pickedUpAt,
          deliveredAt: plain.delivery.delivered_at ?? plain.delivery.deliveredAt,
        }
      : undefined,
    meeting: plain.meeting
      ? {
          ...plain.meeting,
          meetingLocation: plain.meeting.meeting_location ?? plain.meeting.meetingLocation,
          meetingDate: plain.meeting.meeting_date ?? plain.meeting.meetingDate,
          meetingTime: plain.meeting.meeting_time ?? plain.meeting.meetingTime,
          buyerNote: plain.meeting.buyer_note ?? plain.meeting.buyerNote,
          sellerNote: plain.meeting.seller_note ?? plain.meeting.sellerNote,
          buyerConfirmed: plain.meeting.buyer_confirmed ?? plain.meeting.buyerConfirmed,
          sellerConfirmed: plain.meeting.seller_confirmed ?? plain.meeting.sellerConfirmed,
          inspectionCompleted:
            plain.meeting.inspection_completed ?? plain.meeting.inspectionCompleted,
          inspectionData: plain.meeting.inspection_data ?? plain.meeting.inspectionData,
          completedAt: plain.meeting.completed_at ?? plain.meeting.completedAt,
        }
      : undefined,
    events: (plain.events || []).map((ev: any) => ({
      ...ev,
      orderId: ev.order_id ?? ev.orderId,
      actorId: ev.actor_id ?? ev.actorId,
      eventType: ev.event_type ?? ev.eventType,
      createdAt: ev.created_at ?? ev.createdAt,
    })),
    buyer: plain.buyer
      ? {
          id: plain.buyer.id,
          fullName: plain.buyer.full_name ?? plain.buyer.fullName,
          email: plain.buyer.email,
          phone: plain.buyer.phone,
          avatarUrl: plain.buyer.avatar_url ?? plain.buyer.avatarUrl,
        }
      : undefined,
    seller: plain.seller
      ? {
          id: plain.seller.id,
          fullName: plain.seller.full_name ?? plain.seller.fullName,
          email: plain.seller.email,
          phone: plain.seller.phone,
          avatarUrl: plain.seller.avatar_url ?? plain.seller.avatarUrl,
        }
      : undefined,
  }
}

/**
 * Retrieve order by ID with strict ownership authorization
 */
export async function getOrderById(
  orderId: string,
  userId: string,
  userRole = 'USER',
): Promise<any> {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Listing,
        as: 'listing',
        include: [{ model: ListingImage, as: 'images' }],
      },
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
      },
      { model: DeliveryOrder, as: 'delivery' },
      { model: MeetingOrder, as: 'meeting' },
      {
        model: OrderEvent,
        as: 'events',
        order: [['created_at', 'ASC']],
      },
    ],
  })

  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 })
  }

  // Authorization Check
  if (order.buyer_id !== userId && order.seller_id !== userId && userRole !== 'ADMIN') {
    throw Object.assign(new Error('You do not have permission to view this order.'), {
      statusCode: 403,
    })
  }

  return formatOrder(order)
}

/**
 * Retrieve Buyer's orders
 */
export async function getBuyerOrders(
  buyerId: string,
  statusFilter?: 'active' | 'completed' | 'cancelled',
): Promise<any[]> {
  const where: any = { buyer_id: buyerId }

  if (statusFilter === 'active') {
    where.status = {
      [Op.notIn]: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
    }
  } else if (statusFilter === 'completed') {
    where.status = 'COMPLETED'
  } else if (statusFilter === 'cancelled') {
    where.status = { [Op.in]: ['CANCELLED', 'REFUNDED'] }
  }

  const orders = await Order.findAll({
    where,
    include: [
      {
        model: Listing,
        as: 'listing',
        include: [{ model: ListingImage, as: 'images' }],
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
      },
      { model: DeliveryOrder, as: 'delivery' },
      { model: MeetingOrder, as: 'meeting' },
    ],
    order: [['created_at', 'DESC']],
  })

  return orders.map(formatOrder)
}

/**
 * Retrieve Seller's orders
 */
export async function getSellerOrders(
  sellerId: string,
  statusFilter?: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled',
): Promise<any[]> {
  const where: any = { seller_id: sellerId }

  if (statusFilter === 'new') {
    where.status = {
      [Op.in]: ['PENDING_PAYMENT', 'PAID', 'SELLER_CONFIRMATION_REQUIRED', 'MEETING_REQUESTED'],
    }
  } else if (statusFilter === 'preparing') {
    where.status = { [Op.in]: ['CONFIRMED', 'PREPARING', 'MEETING_CONFIRMED'] }
  } else if (statusFilter === 'ready') {
    where.status = { [Op.in]: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'INSPECTION_PENDING'] }
  } else if (statusFilter === 'completed') {
    where.status = 'COMPLETED'
  } else if (statusFilter === 'cancelled') {
    where.status = { [Op.in]: ['CANCELLED', 'REFUNDED'] }
  }

  const orders = await Order.findAll({
    where,
    include: [
      {
        model: Listing,
        as: 'listing',
        include: [{ model: ListingImage, as: 'images' }],
      },
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'],
      },
      { model: DeliveryOrder, as: 'delivery' },
      { model: MeetingOrder, as: 'meeting' },
    ],
    order: [['created_at', 'DESC']],
  })

  return orders.map(formatOrder)
}

/**
 * Seller confirms/accepts the order
 */
export async function sellerConfirmOrder(orderId: string, sellerId: string): Promise<Order> {
  const order = await Order.findByPk(orderId)
  if (!order) throw Object.assign(new Error('Order not found.'), { statusCode: 404 })

  if (order.seller_id !== sellerId) {
    throw Object.assign(new Error('Only the seller can confirm this order.'), { statusCode: 403 })
  }

  const nextStatus = order.fulfillment_method === 'DELIVERY' ? 'PREPARING' : 'MEETING_CONFIRMED'
  await order.update({ status: nextStatus })

  await OrderEvent.create({
    order_id: order.id,
    actor_id: sellerId,
    event_type: 'SELLER_CONFIRMED',
    description: `Seller confirmed order #${order.order_number}`,
  })

  await sendOrderNotification({
    userId: order.buyer_id,
    title: 'Seller Confirmed Your Order 👍',
    message: `The seller has confirmed order #${order.order_number} and is preparing it.`,
    type: 'ORDER',
    link: `/orders/${order.id}`,
  })

  return order
}

/**
 * Seller marks the item ready for delivery/pickup
 */
export async function sellerMarkReady(orderId: string, sellerId: string): Promise<Order> {
  const order = await Order.findByPk(orderId, {
    include: [{ model: DeliveryOrder, as: 'delivery' }],
  })
  if (!order) throw Object.assign(new Error('Order not found.'), { statusCode: 404 })

  if (order.seller_id !== sellerId) {
    throw Object.assign(new Error('Only the seller can mark order as ready.'), { statusCode: 403 })
  }

  await order.update({ status: 'READY_FOR_DELIVERY' })

  if ((order as any).delivery) {
    await ((order as any).delivery as DeliveryOrder).update({ status: 'READY_FOR_PICKUP' })
  }

  await OrderEvent.create({
    order_id: order.id,
    actor_id: sellerId,
    event_type: 'ITEM_READY',
    description: `Product packed and ready for delivery/pickup.`,
  })

  await sendOrderNotification({
    userId: order.buyer_id,
    title: 'Item Ready for Delivery 📦',
    message: `Your item #${order.order_number} is packed and ready for dispatch.`,
    type: 'DELIVERY',
    link: `/orders/${order.id}`,
  })

  return order
}

/**
 * Buyer confirms receipt or in-person completion -> Marks Order COMPLETED and Listing SOLD
 */
export async function completeOrder(orderId: string, buyerId: string): Promise<Order> {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Listing, as: 'listing' }],
  })

  if (!order) throw Object.assign(new Error('Order not found.'), { statusCode: 404 })

  if (order.buyer_id !== buyerId) {
    throw Object.assign(new Error('Only the buyer can complete receipt of this order.'), {
      statusCode: 403,
    })
  }

  if (order.status === 'COMPLETED') {
    return order
  }

  await sequelize.transaction(async (t) => {
    // 1. Mark Order COMPLETED
    await order.update(
      {
        status: 'COMPLETED',
        payment_status: 'SUCCESS',
      },
      { transaction: t },
    )

    // 2. Mark Listing permanently SOLD
    if (order.listing_id) {
      const listing = await Listing.findByPk(order.listing_id, { transaction: t })
      if (listing) {
        await listing.update({ status: 'SOLD' }, { transaction: t })
      }
    }

    // 3. Record Audit Event
    await OrderEvent.create(
      {
        order_id: order.id,
        actor_id: buyerId,
        event_type: 'ORDER_COMPLETED',
        description: 'Buyer confirmed receipt and completed transaction.',
      },
      { transaction: t },
    )
  })

  // Notify Seller of payout/completion
  await sendOrderNotification({
    userId: order.seller_id,
    title: '🎉 Order Completed & Payout Ready!',
    message: `Buyer confirmed receipt for order #${order.order_number}. Payout of ${order.seller_amount} ETB recorded.`,
    type: 'ORDER',
    link: `/orders/${order.id}`,
  })

  return order
}

/**
 * Cancel an order with refund handling
 */
export async function cancelOrder(
  orderId: string,
  userId: string,
  reason: string,
  isAdmin = false,
): Promise<Order> {
  const order = await Order.findByPk(orderId, {
    include: [{ model: Listing, as: 'listing' }],
  })

  if (!order) throw Object.assign(new Error('Order not found.'), { statusCode: 404 })

  const isBuyer = order.buyer_id === userId
  const isSeller = order.seller_id === userId

  if (!isBuyer && !isSeller && !isAdmin) {
    throw Object.assign(new Error('Unauthorized to cancel this order.'), { statusCode: 403 })
  }

  if (order.status === 'COMPLETED') {
    throw Object.assign(new Error('Completed orders cannot be cancelled.'), { statusCode: 400 })
  }

  await sequelize.transaction(async (t) => {
    // 1. Revert listing back to ACTIVE if not sold
    if (order.listing_id) {
      const listing = await Listing.findByPk(order.listing_id, { transaction: t })
      if (listing && listing.status === 'RESERVED') {
        await listing.update({ status: 'ACTIVE' }, { transaction: t })
      }
    }

    // 2. Update Order status
    await order.update(
      {
        status: 'CANCELLED',
        reservation_expires_at: null,
      },
      { transaction: t },
    )

    // 3. Create Audit Event
    await OrderEvent.create(
      {
        order_id: order.id,
        actor_id: userId,
        event_type: 'ORDER_CANCELLED',
        description: `Order cancelled by ${isAdmin ? 'Admin' : isBuyer ? 'Buyer' : 'Seller'}: ${reason}`,
        metadata: { reason },
      },
      { transaction: t },
    )
  })

  // If order was already paid, trigger refund workflow
  if (order.payment_status === 'SUCCESS' && (order.metadata as any)?.paymentId) {
    try {
      await processPaymentRefund((order.metadata as any).paymentId, reason, userId)
      await order.update({ status: 'REFUNDED', payment_status: 'REFUNDED' })
    } catch {
      await order.update({ status: 'REFUND_REQUESTED' })
    }
  }

  // Notify other party
  const otherUserId = isBuyer ? order.seller_id : order.buyer_id
  await sendOrderNotification({
    userId: otherUserId,
    title: 'Order Cancelled',
    message: `Order #${order.order_number} has been cancelled. Reason: ${reason}`,
    type: 'ORDER',
    link: `/orders/${order.id}`,
  })

  return order
}

/**
 * Background / on-demand cleanup of expired reservations
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const expiredOrders = await Order.findAll({
    where: {
      status: 'PENDING_PAYMENT',
      payment_status: 'PENDING',
      reservation_expires_at: {
        [Op.lt]: new Date(),
      },
    },
    include: [{ model: Listing, as: 'listing' }],
  })

  let releasedCount = 0

  for (const order of expiredOrders) {
    await sequelize.transaction(async (t) => {
      if (order.listing_id) {
        const listing = await Listing.findByPk(order.listing_id, { transaction: t })
        if (listing && listing.status === 'RESERVED') {
          await listing.update({ status: 'ACTIVE' }, { transaction: t })
          releasedCount++
        }
      }

      await order.update(
        {
          status: 'CANCELLED',
          reservation_expires_at: null,
        },
        { transaction: t },
      )

      await OrderEvent.create(
        {
          order_id: order.id,
          actor_id: null,
          event_type: 'ORDER_CANCELLED',
          description: 'Reservation expired before payment completion. Listing returned to active marketplace.',
        },
        { transaction: t },
      )
    })
  }

  return releasedCount
}
