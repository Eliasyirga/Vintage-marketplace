import { Transaction, DeliveryOrder, Listing, User } from '../models'
import type { TransactionStatus, DeliveryOrderStatus } from '../types/monetization.types'

// Configurable platform fee percentage (5.0%)
const DEFAULT_PLATFORM_FEE_PERCENTAGE = 0.05

export function calculatePlatformFee(amount: number, feePercentage = DEFAULT_PLATFORM_FEE_PERCENTAGE): {
  platformFee: number
  sellerAmount: number
} {
  // Use integer cents to eliminate floating-point imprecision
  const totalCents = Math.round(amount * 100)
  const feeCents = Math.round(totalCents * feePercentage)
  const sellerCents = totalCents - feeCents

  return {
    platformFee: feeCents / 100,
    sellerAmount: sellerCents / 100,
  }
}

export async function createTransaction(
  buyerId: string,
  data: {
    listingId: string
    deliveryOption?: {
      pickupLocation: string
      deliveryLocation: string
      deliveryFee?: number
    }
  },
): Promise<{ transaction: Transaction; deliveryOrder?: DeliveryOrder }> {
  const listing = await Listing.findByPk(data.listingId)
  if (!listing) {
    throw Object.assign(new Error('Listing not found.'), { statusCode: 404 })
  }

  if (listing.seller_id === buyerId) {
    throw Object.assign(new Error('You cannot purchase your own listing.'), { statusCode: 400 })
  }

  if (listing.status !== 'ACTIVE') {
    throw Object.assign(new Error('Listing is no longer active for purchase.'), { statusCode: 400 })
  }

  const amount = Number(listing.price)
  const { platformFee, sellerAmount } = calculatePlatformFee(amount)

  const tx = await Transaction.create({
    buyer_id: buyerId,
    seller_id: listing.seller_id,
    listing_id: listing.id,
    amount: amount.toFixed(2),
    platform_fee: platformFee.toFixed(2),
    seller_amount: sellerAmount.toFixed(2),
    currency: 'ETB',
    status: 'PENDING',
  })

  let deliveryOrder: DeliveryOrder | undefined
  if (data.deliveryOption) {
    const deliveryFee = data.deliveryOption.deliveryFee || 150
    const platformCommission = Math.round(deliveryFee * 0.1 * 100) / 100

    deliveryOrder = await DeliveryOrder.create({
      order_id: tx.id,
      recipient_name: 'Customer',
      recipient_phone: '0900000000',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      delivery_location: data.deliveryOption.deliveryLocation,
      delivery_fee: deliveryFee.toFixed(2),
      platform_commission: platformCommission.toFixed(2),
      status: 'REQUESTED',
    })
  }

  return { transaction: tx, deliveryOrder }
}

export async function getBuyerTransactions(buyerId: string): Promise<Transaction[]> {
  return Transaction.findAll({
    where: { buyer_id: buyerId },
    include: [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'price'],
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'full_name', 'phone'],
      },
      {
        model: DeliveryOrder,
        as: 'deliveryOrder',
      },
    ],
    order: [['created_at', 'DESC']],
  })
}

export async function getSellerTransactions(sellerId: string): Promise<Transaction[]> {
  return Transaction.findAll({
    where: { seller_id: sellerId },
    include: [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'price'],
      },
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'full_name', 'phone'],
      },
      {
        model: DeliveryOrder,
        as: 'deliveryOrder',
      },
    ],
    order: [['created_at', 'DESC']],
  })
}
