import api from './api'
import type { SafeOrder, CreateOrderInput } from '../types/order'

export interface BuyNowEligibilityResult {
  eligible: boolean
  listing: {
    id: string
    title: string
    price: number
    condition: string
    city: string
    subCity?: string
    status: string
  }
  seller: {
    id: string
    fullName: string
    isVerified: boolean
  }
}

export interface CreateOrderResponse {
  order: SafeOrder
  payment: {
    id: string
    reference: string
    provider: string
    amount: number
    currency: string
    status: string
  } | null
  paymentInit: {
    checkoutUrl: string
    providerReference: string
    mode: 'MOCK_DEV' | 'GATEWAY'
    instructions?: string
  } | null
}

export async function checkBuyNowEligibility(listingId: string): Promise<BuyNowEligibilityResult> {
  const response = await api.post('/orders/check-eligibility', { listingId })
  return response.data.data
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  const response = await api.post('/orders', input)
  return response.data.data
}

export async function getOrderById(orderId: string): Promise<SafeOrder> {
  const response = await api.get(`/orders/${orderId}`)
  return response.data.data
}

export async function getBuyerOrders(status?: string): Promise<SafeOrder[]> {
  const response = await api.get('/orders/buyer/my-orders', {
    params: { status },
  })
  return response.data.data
}

export async function getSellerOrders(status?: string): Promise<SafeOrder[]> {
  const response = await api.get('/orders/seller/my-orders', {
    params: { status },
  })
  return response.data.data
}

export async function confirmOrder(orderId: string): Promise<SafeOrder> {
  const response = await api.post(`/orders/${orderId}/confirm`)
  return response.data.data
}

export async function markOrderReady(orderId: string): Promise<SafeOrder> {
  const response = await api.post(`/orders/${orderId}/ready`)
  return response.data.data
}

export async function completeOrder(orderId: string): Promise<SafeOrder> {
  const response = await api.post(`/orders/${orderId}/complete`)
  return response.data.data
}

export async function cancelOrder(orderId: string, reason: string): Promise<SafeOrder> {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason })
  return response.data.data
}
