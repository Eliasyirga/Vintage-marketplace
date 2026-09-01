import crypto from 'crypto'
import { sequelize } from '../../config/database'
import { env } from '../../config/env'
import {
  Payment,
  Plan,
  Listing,
  User,
  Subscription,
  UserVerification,
  Advertisement,
  Transaction,
  Order,
  OrderEvent,
  AdminAuditLog,
} from '../../models'
import type {
  PaymentPurpose,
  PaymentProviderName,
} from '../../types/monetization.types'
import { getPaymentProvider } from './payment.factory'
import type { PaymentInitResult } from './PaymentProvider'
import * as entitlementService from '../entitlement.service'
import { sendOrderNotification } from '../orderNotification.service'

export interface CreatePaymentInput {
  planId?: string
  purpose: PaymentPurpose
  provider?: PaymentProviderName
  listingId?: string
  advertisementId?: string
  transactionId?: string
  orderId?: string
  verificationType?: 'NATIONAL_ID' | 'BUSINESS'
  returnUrl?: string
  callbackUrl?: string
}

export async function createPayment(
  userId: string,
  input: CreatePaymentInput,
): Promise<{ payment: Payment; initResult: PaymentInitResult }> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  let amount = 0
  let durationDays = 7
  let plan: Plan | null = null

  // 1. Resolve Server-side Price from Plan if planId provided
  if (input.planId) {
    plan = await Plan.findByPk(input.planId)
    if (!plan || !plan.is_active) {
      throw Object.assign(new Error('Selected monetization plan is invalid or inactive.'), {
        statusCode: 400,
      })
    }
    amount = Number(plan.price)
    durationDays = plan.duration_days
  }

  // 2. Validate Ownership and Prerequisites
  if (input.listingId) {
    const listing = await Listing.findByPk(input.listingId)
    if (!listing) {
      throw Object.assign(new Error('Listing not found.'), { statusCode: 404 })
    }
    if (listing.seller_id !== userId && user.role !== 'ADMIN') {
      throw Object.assign(new Error('You can only promote your own listings.'), {
        statusCode: 403,
      })
    }
    if (listing.status !== 'ACTIVE') {
      throw Object.assign(
        new Error('Only active listings can be promoted or featured.'),
        { statusCode: 400 },
      )
    }
  }

  if (input.advertisementId) {
    const ad = await Advertisement.findByPk(input.advertisementId)
    if (!ad) {
      throw Object.assign(new Error('Advertisement not found.'), { statusCode: 404 })
    }
    if (ad.advertiser_id !== userId && user.role !== 'ADMIN') {
      throw Object.assign(new Error('Unauthorized advertisement access.'), { statusCode: 403 })
    }
    if (ad.status !== 'PENDING_PAYMENT') {
      throw Object.assign(
        new Error(`Advertisement is in status "${ad.status}" and cannot accept payment.`),
        { statusCode: 400 },
      )
    }
    amount = Number(ad.budget)
  }

  if (input.transactionId) {
    const tx = await Transaction.findByPk(input.transactionId)
    if (!tx) {
      // Check if it's an Order ID
      const order = await Order.findByPk(input.transactionId)
      if (order) {
        amount = Number(order.total_amount)
      } else {
        throw Object.assign(new Error('Transaction/Order not found.'), { statusCode: 404 })
      }
    } else {
      amount = Number(tx.amount)
    }
  } else if (input.orderId) {
    const order = await Order.findByPk(input.orderId)
    if (!order) {
      throw Object.assign(new Error('Order not found.'), { statusCode: 404 })
    }
    amount = Number(order.total_amount)
  }

  // Fallback default pricing if no plan was found for specific non-plan purposes
  if (amount <= 0 && plan) {
    amount = Number(plan.price)
  }

  if (amount <= 0) {
    throw Object.assign(new Error('Invalid payment amount calculated.'), { statusCode: 400 })
  }

  // 3. Generate unique reference
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase()
  const reference = `VM-${Date.now()}-${randomHex}`

  const metadata: Record<string, unknown> = {
    planId: plan?.id ?? null,
    planName: plan?.name ?? null,
    planType: plan?.type ?? null,
    durationDays,
    listingId: input.listingId ?? null,
    advertisementId: input.advertisementId ?? null,
    transactionId: input.transactionId ?? null,
    orderId: input.orderId ?? (input.transactionId || null),
    verificationType: input.verificationType ?? null,
  }

  // 4. Resolve provider and Create Payment Record (Server-Authoritative)
  const resolvedProvider: PaymentProviderName =
    input.provider === 'MOCK' && env.isDevelopment ? 'MOCK' : 'CHAPA'

  const payment = await Payment.create({
    user_id: userId,
    reference,
    provider: resolvedProvider,
    amount: amount.toFixed(2),
    currency: 'ETB',
    purpose: input.purpose,
    status: 'PENDING',
    metadata,
  })

  // Link payment to advertisement record immediately
  if (input.advertisementId) {
    await Advertisement.update(
      { payment_id: payment.id },
      { where: { id: input.advertisementId } },
    )
  }

  // 5. Initialize with Payment Provider
  const clientBase = (env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '')
  const apiBase = (env.API_PUBLIC_URL || 'http://localhost:5000').replace(/\/+$/, '')

  let returnUrl = input.returnUrl || `${clientBase}/payment/processing?ref=${encodeURIComponent(payment.reference)}`
  if (input.returnUrl && !input.returnUrl.includes('ref=')) {
    const separator = returnUrl.includes('?') ? '&' : '?'
    returnUrl = `${returnUrl}${separator}ref=${encodeURIComponent(payment.reference)}`
  }
  const callbackUrl = input.callbackUrl || `${apiBase}/api/payments/chapa/callback`

  const provider = getPaymentProvider(resolvedProvider)
  const initResult = await provider.initializePayment({
    paymentId: payment.id,
    reference: payment.reference,
    amount,
    currency: 'ETB',
    customer: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
    },
    purpose: plan ? `${plan.name} - Vintage Marketplace` : `${input.purpose} - Vintage Marketplace`,
    returnUrl,
    callbackUrl,
    metadata,
  })

  return { payment, initResult }
}

/**
 * Server-side payment verification and idempotent activation
 */
export async function verifyAndProcessPayment(
  reference: string,
  providerName?: PaymentProviderName,
): Promise<{ payment: Payment; activated: boolean }> {
  const payment = await Payment.findOne({ where: { reference } })
  if (!payment) {
    throw Object.assign(new Error('Payment reference not found.'), { statusCode: 404 })
  }

  // Idempotency: If already marked SUCCESS, return immediately
  if (payment.status === 'SUCCESS') {
    return { payment, activated: false }
  }

  const provider = getPaymentProvider(providerName || payment.provider)
  const verifyResult = await provider.verifyPayment(
    payment.reference,
    payment.provider_reference ?? undefined,
  )

  if (!verifyResult.isVerified || verifyResult.status !== 'SUCCESS') {
    await payment.update({ status: 'FAILED' })
    return { payment, activated: false }
  }

  // Verify amount matches database amount (allow small rounding difference)
  if (
    verifyResult.amount > 0 &&
    Math.abs(verifyResult.amount - Number(payment.amount)) > 0.5
  ) {
    console.error(
      `❌ [Payment] Amount mismatch for ${reference}: expected ${payment.amount}, got ${verifyResult.amount}`,
    )
    await payment.update({ status: 'FAILED' })
    throw Object.assign(new Error('Payment verification failed due to amount mismatch.'), {
      statusCode: 400,
    })
  }

  // Verified! Execute all entitlement activations inside a database transaction
  let activated = false
  await sequelize.transaction(async (t) => {
    // 1. Mark Payment SUCCESS
    await payment.update(
      {
        status: 'SUCCESS',
        paid_at: new Date(),
        provider_reference: verifyResult.providerReference || payment.provider_reference,
      },
      { transaction: t },
    )

    const meta = (payment.metadata || {}) as Record<string, any>
    const durationDays = Number(meta.durationDays || 7)

    // 2. Activate Entitlements based on Payment Purpose
    switch (payment.purpose) {
      case 'FEATURED_LISTING':
        if (meta.listingId) {
          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              listingId: meta.listingId,
              type: 'FEATURED',
              durationDays,
              paymentId: payment.id,
              metadata: { planId: meta.planId },
            },
            t,
          )
          activated = true
        }
        break

      case 'LISTING_BOOST':
        if (meta.listingId) {
          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              listingId: meta.listingId,
              type: 'BOOST',
              durationDays,
              paymentId: payment.id,
              metadata: { planId: meta.planId },
            },
            t,
          )
          activated = true
        }
        break

      case 'PREMIUM_SUBSCRIPTION':
        if (meta.planId) {
          const now = new Date()
          const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

          await Subscription.create(
            {
              user_id: payment.user_id,
              plan_id: meta.planId,
              status: 'ACTIVE',
              start_at: now,
              expires_at: expiresAt,
              payment_id: payment.id,
              auto_renew: false,
            },
            { transaction: t },
          )

          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              type: 'PREMIUM_SELLER',
              durationDays,
              paymentId: payment.id,
            },
            t,
          )
          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              type: 'ANALYTICS',
              durationDays,
              paymentId: payment.id,
            },
            t,
          )
          activated = true
        }
        break

      case 'BUSINESS_SUBSCRIPTION':
        if (meta.planId) {
          const now = new Date()
          const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

          await Subscription.create(
            {
              user_id: payment.user_id,
              plan_id: meta.planId,
              status: 'ACTIVE',
              start_at: now,
              expires_at: expiresAt,
              payment_id: payment.id,
              auto_renew: false,
            },
            { transaction: t },
          )

          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              type: 'BUSINESS_ACCOUNT',
              durationDays,
              paymentId: payment.id,
            },
            t,
          )
          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              type: 'PREMIUM_SELLER',
              durationDays,
              paymentId: payment.id,
            },
            t,
          )
          await entitlementService.grantEntitlement(
            {
              userId: payment.user_id,
              type: 'ANALYTICS',
              durationDays,
              paymentId: payment.id,
            },
            t,
          )
          activated = true
        }
        break

      case 'VERIFICATION':
        // Update or create verification in PAID_PENDING state
        const verificationType = meta.verificationType || 'NATIONAL_ID'
        const existingVerif = await UserVerification.findOne({
          where: { user_id: payment.user_id, verification_type: verificationType },
          transaction: t,
        })

        if (existingVerif) {
          await existingVerif.update(
            { status: 'PAID_PENDING', payment_id: payment.id },
            { transaction: t },
          )
        } else {
          await UserVerification.create(
            {
              user_id: payment.user_id,
              verification_type: verificationType,
              status: 'PAID_PENDING',
              payment_id: payment.id,
            },
            { transaction: t },
          )
        }
        activated = true
        break

      case 'ADVERTISEMENT':
        if (meta.advertisementId) {
          const ad = await Advertisement.findByPk(meta.advertisementId, { transaction: t })
          if (ad) {
            await ad.update(
              {
                status: 'PENDING_REVIEW',
                payment_id: payment.id,
              },
              { transaction: t },
            )
            activated = true
          }
        }
        break

      case 'TRANSACTION_FEE':
        if (meta.transactionId) {
          const tx = await Transaction.findByPk(meta.transactionId, { transaction: t })
          if (tx) {
            await tx.update(
              { status: 'PAID', payment_id: payment.id },
              { transaction: t },
            )
            activated = true
          }
        }
        break

      case 'ORDER_PURCHASE':
      case 'DELIVERY':
        const targetOrderId = meta.orderId || meta.transactionId
        if (targetOrderId) {
          const order = await Order.findByPk(targetOrderId, { transaction: t })
          if (order) {
            const nextStatus =
              order.fulfillment_method === 'DELIVERY'
                ? 'PREPARING'
                : 'MEETING_REQUESTED'

            await order.update(
              {
                payment_status: 'SUCCESS',
                status: nextStatus,
                reservation_expires_at: null,
              },
              { transaction: t },
            )

            await OrderEvent.create(
              {
                order_id: order.id,
                actor_id: order.buyer_id,
                event_type: 'PAYMENT_SUCCESS',
                description: `Payment of ${payment.amount} ETB confirmed via ${payment.provider} (Ref: ${payment.reference})`,
                metadata: { paymentId: payment.id, reference: payment.reference },
              },
              { transaction: t },
            )

            activated = true

            // Send non-blocking notifications
            sendOrderNotification({
              userId: order.seller_id,
              title: '💰 Payment Received for Order',
              message: `Payment for order #${order.order_number} has been verified. Please prepare the product.`,
              type: 'PAYMENT',
              link: `/orders/${order.id}`,
            }).catch(() => {})

            sendOrderNotification({
              userId: order.buyer_id,
              title: '🎉 Payment Successful!',
              message: `Your payment for order #${order.order_number} was verified successfully.`,
              type: 'PAYMENT',
              link: `/orders/${order.id}`,
            }).catch(() => {})
          }
        }
        break

      default:
        break
    }
  })

  return { payment, activated }
}

/**
 * Handle incoming webhooks securely & idempotently
 */
export async function handleWebhook(
  providerName: PaymentProviderName,
  payload: any,
): Promise<{ success: boolean; message: string }> {
  // Extract reference depending on provider format
  let reference = payload.tx_ref || payload.reference || payload.outTradeNo || payload.ref

  if (!reference && payload.data) {
    reference = payload.data.tx_ref || payload.data.reference
  }

  if (!reference) {
    return { success: false, message: 'Reference missing in webhook payload.' }
  }

  const { payment, activated } = await verifyAndProcessPayment(reference, providerName)

  return {
    success: true,
    message: `Payment ${payment.reference} processed. Status: ${payment.status}, Activated: ${activated}`,
  }
}

/**
 * Retrieve user's payment history
 */
export async function getUserPaymentHistory(userId: string): Promise<Payment[]> {
  return Payment.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  })
}

/**
 * Process a refund with Admin audit logging
 */
export async function refundPayment(
  paymentId: string,
  reason: string,
  adminId: string,
): Promise<{ payment: Payment; refundResult: any }> {
  const payment = await Payment.findByPk(paymentId)
  if (!payment) {
    throw Object.assign(new Error('Payment not found.'), { statusCode: 404 })
  }

  if (payment.status !== 'SUCCESS') {
    throw Object.assign(new Error('Only successful payments can be refunded.'), {
      statusCode: 400,
    })
  }

  const provider = getPaymentProvider(payment.provider)
  const refundResult = await provider.refundPayment(
    payment.reference,
    Number(payment.amount),
    reason,
  )

  if (!refundResult.success) {
    throw Object.assign(new Error('Payment refund was rejected by provider.'), {
      statusCode: 400,
    })
  }

  await sequelize.transaction(async (t) => {
    await payment.update({ status: 'REFUNDED' }, { transaction: t })

    // Revoke active entitlements associated with this payment
    await entitlementService.grantEntitlement(
      {
        userId: payment.user_id,
        type: 'FEATURED',
        durationDays: 0,
      },
      t,
    )

    await AdminAuditLog.create(
      {
        admin_id: adminId,
        action: 'PAYMENT_REFUNDED',
        target_type: 'PAYMENT',
        target_id: payment.id,
        reason,
        metadata: {
          reference: payment.reference,
          amount: payment.amount,
          refundResult,
        },
      },
      { transaction: t },
    )
  })

  return { payment, refundResult }
}
