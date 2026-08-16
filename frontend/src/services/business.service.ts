import api from './api'
import type { BusinessProfile } from '../types/monetization'

export interface BusinessProfileResponse {
  profile: BusinessProfile | null
  limits: {
    maxActiveListings: number
    tier: 'FREE' | 'PREMIUM' | 'BUSINESS'
  }
}

export async function getMyBusinessProfile(): Promise<BusinessProfileResponse> {
  const response = await api.get<{ success: boolean; data: BusinessProfileResponse }>(
    '/business/profile',
  )
  return response.data.data
}

export async function updateMyBusinessProfile(
  data: Partial<BusinessProfile>,
): Promise<BusinessProfile> {
  const response = await api.post<{ success: boolean; data: BusinessProfile }>(
    '/business/profile',
    data,
  )
  return response.data.data
}
