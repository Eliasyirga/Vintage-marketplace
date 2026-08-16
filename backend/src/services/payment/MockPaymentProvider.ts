import { env } from '../../config/env'
import type {
  PaymentProvider,
  PaymentInitParams,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentRefundResult,
} from './PaymentProvider'

// In-memory or state storage for mock payment confirmations in dev mode
const mockStore = new Map<
  string,
  {
    amount: number
    currency: string
    status: 'SUCCESS' | 'FAILED' | 'PENDING'
    providerReference: string
  }
>()

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'MOCK' as const

  async initializePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    const providerReference = `MOCK-TX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    mockStore.set(params.reference, {
      amount: params.amount,
      currency: params.currency,
      status: 'PENDING',
      providerReference,
    })

    const clientUrl = env.CLIENT_URL || 'http://localhost:5173'
    const checkoutUrl = `${clientUrl}/checkout/mock?ref=${params.reference}&amount=${params.amount}&providerRef=${providerReference}`

    return {
      checkoutUrl,
      providerReference,
      mode: 'MOCK_DEV',
      instructions: 'Development Mode: Complete or fail test payment in the sandbox checkout page.',
    }
  }

  async verifyPayment(reference: string, providerReference?: string): Promise<PaymentVerifyResult> {
    const record = mockStore.get(reference)

    if (!record) {
      // Default to SUCCESS if simulating instant server verification in test mode
      return {
        isVerified: true,
        providerReference: providerReference || `MOCK-${reference}`,
        status: 'SUCCESS',
        amount: 0,
        currency: 'ETB',
        rawResponse: { mode: 'mock_auto_verified' },
      }
    }

    return {
      isVerified: record.status === 'SUCCESS',
      providerReference: record.providerReference,
      status: record.status,
      amount: record.amount,
      currency: record.currency,
      rawResponse: { mockStoreData: record },
    }
  }

  async getPaymentStatus(reference: string): Promise<PaymentVerifyResult> {
    return this.verifyPayment(reference)
  }

  async refundPayment(reference: string, amount: number, reason: string): Promise<PaymentRefundResult> {
    const record = mockStore.get(reference)
    if (record) {
      record.status = 'FAILED'
    }

    return {
      success: true,
      refundReference: `MOCK-REFUND-${Date.now()}`,
      amount,
      reason,
    }
  }

  /**
   * Developer simulation method to transition mock payment state
   */
  static simulateStatus(reference: string, status: 'SUCCESS' | 'FAILED') {
    const record = mockStore.get(reference)
    if (record) {
      record.status = status
    } else {
      mockStore.set(reference, {
        amount: 0,
        currency: 'ETB',
        status,
        providerReference: `MOCK-${Date.now()}`,
      })
    }
  }
}
