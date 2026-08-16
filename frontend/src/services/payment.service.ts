import api from './api'
import type { Payment, PaymentProviderName, PaymentPurpose } from '../types/monetization'

export interface InitializePaymentParams {
  planId?: string
  purpose: PaymentPurpose
  provider: PaymentProviderName
  listingId?: string
  advertisementId?: string
  transactionId?: string
  verificationType?: 'NATIONAL_ID' | 'FACE' | 'BUSINESS'
  returnUrl?: string
  callbackUrl?: string
}

export interface InitializePaymentResponse {
  payment: Payment
  checkoutUrl: string
  providerReference: string
  mode: 'MOCK_DEV' | 'GATEWAY'
  instructions?: string
}

export async function initializePayment(
  params: InitializePaymentParams,
): Promise<InitializePaymentResponse> {
  const response = await api.post<{ success: boolean; data: InitializePaymentResponse }>(
    '/payments/initialize',
    params,
  )
  return response.data.data
}

export async function verifyPayment(
  reference: string,
): Promise<{ payment: Payment; activated: boolean }> {
  const response = await api.get<{
    success: boolean
    data: { payment: Payment; activated: boolean }
  }>(`/payments/verify/${reference}`)
  return response.data.data
}

export async function getMyPaymentHistory(): Promise<Payment[]> {
  const response = await api.get<{ success: boolean; data: Payment[] }>('/payments/my-history')
  return response.data.data
}

export async function simulateMockPayment(
  reference: string,
  status: 'SUCCESS' | 'FAILED',
): Promise<{ payment: Payment; activated: boolean }> {
  const response = await api.post<{
    success: boolean
    message: string
    data: { payment: Payment; activated: boolean }
  }>('/payments/mock/simulate', { reference, status })
  return response.data.data
}

export async function refundPaymentAdmin(
  paymentId: string,
  reason: string,
): Promise<{ payment: Payment; refundResult: any }> {
  const response = await api.post<{
    success: boolean
    data: { payment: Payment; refundResult: any }
  }>(`/payments/refund/${paymentId}`, { reason })
  return response.data.data
}
