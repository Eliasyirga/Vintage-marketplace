import { DeliveryOrder, Order, OrderEvent } from '../models'
import type { DeliveryStatus, DeliveryInput } from '../types/order.types'
import { sendOrderNotification } from './orderNotification.service'

export interface DeliveryPricingEstimate {
  deliveryFee: number
  platformCommission: number
  estimatedDays: number
  zoneName: string
}

// Configurable Delivery Pricing Matrix for Ethiopia / Addis Ababa
// Can be customized or extended by Admin settings
export const DEFAULT_DELIVERY_RATES = {
  SAME_SUBCITY: 100,      // e.g. Bole -> Bole: 100 ETB
  DIFFERENT_SUBCITY: 200, // e.g. Bole -> Yeka / Kazanchis / Arada: 200 ETB
  OUTER_ADDIS: 280,       // e.g. Akaki Kaliti, Kolfe Keranio: 280 ETB
  REGIONAL_CITY: 450,     // e.g. Hawassa, Adama, Bahir Dar: 450 ETB
  COMMISSION_RATE: 0.10,  // 10% platform commission on delivery fee
}

/**
 * Calculates authoritative delivery fee based on seller origin and buyer destination.
 * Never trust client-calculated delivery fees.
 */
export function calculateDeliveryFee(
  originSubCity?: string | null,
  destinationSubCity?: string | null,
  originCity = 'Addis Ababa',
  destinationCity = 'Addis Ababa',
): DeliveryPricingEstimate {
  const normOriginCity = (originCity || 'Addis Ababa').trim().toLowerCase()
  const normDestCity = (destinationCity || 'Addis Ababa').trim().toLowerCase()
  const normOriginSub = (originSubCity || '').trim().toLowerCase()
  const normDestSub = (destinationSubCity || '').trim().toLowerCase()

  let fee = DEFAULT_DELIVERY_RATES.DIFFERENT_SUBCITY
  let zoneName = 'Addis Ababa Standard'
  let estimatedDays = 1

  if (normOriginCity !== normDestCity) {
    fee = DEFAULT_DELIVERY_RATES.REGIONAL_CITY
    zoneName = `Inter-City (${originCity} → ${destinationCity})`
    estimatedDays = 3
  } else if (normOriginSub && normDestSub && normOriginSub === normDestSub) {
    fee = DEFAULT_DELIVERY_RATES.SAME_SUBCITY
    zoneName = `Intra-Zone (${normDestSub.toUpperCase()})`
    estimatedDays = 1
  } else if (
    normDestSub.includes('akaki') ||
    normDestSub.includes('kolfe') ||
    normDestSub.includes('gullele')
  ) {
    fee = DEFAULT_DELIVERY_RATES.OUTER_ADDIS
    zoneName = 'Greater Addis Metro'
    estimatedDays = 2
  }

  const commission = Math.round(fee * DEFAULT_DELIVERY_RATES.COMMISSION_RATE * 100) / 100

  return {
    deliveryFee: fee,
    platformCommission: commission,
    estimatedDays,
    zoneName,
  }
}

/**
 * Create delivery order record for an order
 */
export async function createDeliveryOrder(
  orderId: string,
  deliveryInfo: DeliveryInput,
  sellerSubCity?: string | null,
  sellerCity = 'Addis Ababa',
  transaction?: any,
): Promise<DeliveryOrder> {
  const estimate = calculateDeliveryFee(
    sellerSubCity,
    deliveryInfo.subCity,
    sellerCity,
    deliveryInfo.city,
  )

  const trackingReference = `TRK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const now = new Date()
  const estimatedDeliveryAt = new Date(now.getTime() + estimate.estimatedDays * 24 * 60 * 60 * 1000)

  return DeliveryOrder.create(
    {
      order_id: orderId,
      recipient_name: deliveryInfo.fullName,
      recipient_phone: deliveryInfo.phone,
      city: deliveryInfo.city,
      sub_city: deliveryInfo.subCity,
      neighborhood: deliveryInfo.neighborhood || null,
      delivery_location: deliveryInfo.deliveryLocation,
      delivery_notes: deliveryInfo.deliveryNotes || null,
      delivery_fee: estimate.deliveryFee.toFixed(2),
      platform_commission: estimate.platformCommission.toFixed(2),
      status: 'REQUESTED',
      tracking_reference: trackingReference,
      estimated_delivery_at: estimatedDeliveryAt,
      metadata: { zoneName: estimate.zoneName },
    },
    { transaction },
  )
}

/**
 * Update delivery status with timeline tracking
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  newStatus: DeliveryStatus,
  actorId: string,
  notes?: string,
): Promise<DeliveryOrder> {
  const delivery = await DeliveryOrder.findByPk(deliveryId, {
    include: [{ model: Order, as: 'order' }],
  })

  if (!delivery) {
    throw Object.assign(new Error('Delivery order not found.'), { statusCode: 404 })
  }

  const order = (delivery as any).order as Order
  const now = new Date()
  const updates: Partial<DeliveryOrder> = { status: newStatus }

  if (newStatus === 'PICKED_UP') {
    updates.picked_up_at = now
  } else if (newStatus === 'DELIVERED') {
    updates.delivered_at = now
  }

  await delivery.update(updates)

  // Map Delivery Status to Order Status
  if (order) {
    if (newStatus === 'READY_FOR_PICKUP') {
      await order.update({ status: 'READY_FOR_DELIVERY' })
    } else if (newStatus === 'PICKED_UP' || newStatus === 'IN_TRANSIT') {
      await order.update({ status: 'OUT_FOR_DELIVERY' })
    } else if (newStatus === 'DELIVERED') {
      await order.update({ status: 'DELIVERED' })
    }

    await OrderEvent.create({
      order_id: order.id,
      actor_id: actorId,
      event_type:
        newStatus === 'PICKED_UP'
          ? 'PICKED_UP'
          : newStatus === 'DELIVERED'
          ? 'DELIVERED'
          : 'DELIVERY_REQUESTED',
      description: notes || `Delivery status updated to ${newStatus.replace(/_/g, ' ')}`,
      metadata: { deliveryId: delivery.id, status: newStatus, tracking: delivery.tracking_reference },
    })

    await sendOrderNotification({
      userId: order.buyer_id,
      title: `Delivery Update: ${newStatus.replace(/_/g, ' ')}`,
      message: `Your order #${order.order_number} delivery status is now ${newStatus.replace(/_/g, ' ')}.`,
      type: 'DELIVERY',
      link: `/orders/${order.id}`,
    })
  }

  return delivery
}
