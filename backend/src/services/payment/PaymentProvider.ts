import type { PaymentProviderName } from '../../types/monetization.types'

export interface PaymentCustomer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export interface PaymentInitParams {
  paymentId: string
  reference: string
  amount: number
  currency: string
  customer: PaymentCustomer
  purpose: string
  returnUrl?: string
  callbackUrl?: string
  metadata?: Record<string, unknown>
}

export interface PaymentInitResult {
  checkoutUrl: string
  providerReference: string
  mode: 'MOCK_DEV' | 'GATEWAY'
  instructions?: string
}

export interface PaymentVerifyResult {
  isVerified: boolean
  providerReference: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  amount: number
  currency: string
  rawResponse?: Record<string, unknown>
}

export interface PaymentRefundResult {
  success: boolean
  refundReference: string
  amount: number
  reason?: string
}

export interface PaymentProvider {
  readonly name: PaymentProviderName
  initializePayment(params: PaymentInitParams): Promise<PaymentInitResult>
  verifyPayment(reference: string, providerReference?: string): Promise<PaymentVerifyResult>
  getPaymentStatus(reference: string): Promise<PaymentVerifyResult>
  refundPayment(reference: string, amount: number, reason: string): Promise<PaymentRefundResult>
}
