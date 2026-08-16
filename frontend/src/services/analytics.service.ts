import api from './api'
import type { SellerAnalytics } from '../types/monetization'

export async function getSellerAnalytics(days = 30): Promise<SellerAnalytics> {
  const response = await api.get<{ success: boolean; data: SellerAnalytics }>(
    '/seller/analytics',
    { params: { days } },
  )
  return response.data.data
}
