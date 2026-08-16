import api from './api'
import type { PublicSellerProfile, SellerProfileEditForm } from '../types/seller'
import type { ListingsResponse } from '../types/listing'

export async function getSellerProfile(sellerId: string): Promise<PublicSellerProfile> {
  const response = await api.get<{ success: boolean; seller: PublicSellerProfile }>(
    `/sellers/${sellerId}`,
  )
  return response.data.seller
}

export async function getSellerListings(
  sellerId: string,
  params?: { page?: number; limit?: number },
): Promise<ListingsResponse> {
  const response = await api.get<{ success: boolean; data: ListingsResponse }>(
    `/sellers/${sellerId}/listings`,
    { params },
  )
  return response.data.data
}

export async function getMySellerProfile(): Promise<PublicSellerProfile> {
  const response = await api.get<{ success: boolean; profile: PublicSellerProfile }>(
    '/seller/profile',
  )
  return response.data.profile
}

export async function updateMySellerProfile(
  data: Partial<SellerProfileEditForm>,
): Promise<PublicSellerProfile> {
  const response = await api.patch<{
    success: boolean
    message: string
    profile: PublicSellerProfile
  }>('/seller/profile', data)
  return response.data.profile
}
