import type { Request, Response, NextFunction } from 'express'
import * as paymentService from '../services/payment/payment.service'
import { MockPaymentProvider } from '../services/payment/MockPaymentProvider'

export async function initializePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const {
      planId,
      purpose,
      provider,
      listingId,
      advertisementId,
      transactionId,
      verificationType,
      returnUrl,
      callbackUrl,
    } = req.body

    if (!purpose || !provider) {
      res.status(400).json({ success: false, message: 'Purpose and provider are required.' })
      return
    }

    const { payment, initResult } = await paymentService.createPayment(userId, {
      planId,
      purpose,
      provider,
      listingId,
      advertisementId,
      transactionId,
      verificationType,
      returnUrl,
      callbackUrl,
    })

    res.status(201).json({
      success: true,
      data: {
        payment: payment.toSafeObject(),
        checkoutUrl: initResult.checkoutUrl,
        providerReference: initResult.providerReference,
        mode: initResult.mode,
        instructions: initResult.instructions,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reference = String(req.params.reference)
    if (!reference) {
      res.status(400).json({ success: false, message: 'Payment reference is required.' })
      return
    }

    const { payment, activated } = await paymentService.verifyAndProcessPayment(reference)

    res.json({
      success: true,
      data: {
        payment: payment.toSafeObject(),
        activated,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const provider = String(req.params.provider)
    const result = await paymentService.handleWebhook(provider as any, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const payments = await paymentService.getUserPaymentHistory(userId)
    res.json({
      success: true,
      data: payments.map((p) => p.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Development test helper to simulate mock payment resolution
 */
export async function simulateMockPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reference, status } = req.body
    if (!reference || !['SUCCESS', 'FAILED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Valid reference and status (SUCCESS|FAILED) required.' })
      return
    }

    MockPaymentProvider.simulateStatus(reference, status)
    const { payment, activated } = await paymentService.verifyAndProcessPayment(reference, 'MOCK')

    res.json({
      success: true,
      message: `Mock payment simulated with status: ${status}`,
      data: {
        payment: payment.toSafeObject(),
        activated,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function refundPaymentAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user!.id
    const id = String(req.params.id)
    const { reason } = req.body

    if (!reason) {
      res.status(400).json({ success: false, message: 'Refund reason is required.' })
      return
    }

    const { payment, refundResult } = await paymentService.refundPayment(id, reason, adminId)

    res.json({
      success: true,
      message: 'Payment refunded successfully.',
      data: {
        payment: payment.toSafeObject(),
        refundResult,
      },
    })
  } catch (err) {
    next(err)
  }
}
