import api from './api'
import type { SafeDeliveryOrder } from '../types/order'

export interface DeliveryEstimate {
  deliveryFee: number
  platformCommission: number
  estimatedDays: number
  zoneName: string
}

export async function estimateDelivery(params: {
  sellerSubCity?: string
  buyerSubCity?: string
  sellerCity?: string
  buyerCity?: string
}): Promise<DeliveryEstimate> {
  const response = await api.get('/delivery/estimate', { params })
  return response.data.data
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: string,
  notes?: string,
): Promise<SafeDeliveryOrder> {
  const response = await api.patch(`/delivery/${deliveryId}/status`, { status, notes })
  return response.data.data
}
