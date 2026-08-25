import api from './api'
import type { ApiResponse, User } from '../types/auth'

export interface AccountOverviewStats {
  activeListings: number
  totalListings: number
  buyerOrdersTotal: number
  buyerOrdersPending: number
  buyerOrdersActive: number
  buyerOrdersCompleted: number
  sellerOrdersTotal: number
  sellerOrdersPending: number
  sellerOrdersActive: number
  sellerOrdersCompleted: number
  favoritesCount: number
  conversationsCount: number
  totalSpentETB: number
  totalEarnedETB: number
}

export interface AccountOverviewData {
  user: User
  sellerProfile: {
    exists: boolean
    displayName?: string | null
    profileImage?: string | null
    city?: string | null
    subCity?: string | null
    rating?: number | null
    totalSales?: number
    isActive?: boolean
  }
  businessProfile: {
    exists: boolean
    businessName?: string
    registrationStatus?: string
    logo?: string | null
  }
  stats: AccountOverviewStats
  verifications: Array<{
    type: string
    status: string
    verifiedAt: string | null
  }>
}

export async function getAccountOverview(): Promise<ApiResponse<AccountOverviewData>> {
  const response = await api.get<ApiResponse<AccountOverviewData>>('/account/overview')
  return response.data
}

export async function updateAccountProfile(data: {
  fullName?: string
  avatarUrl?: string | null
}): Promise<ApiResponse<{ user: User }>> {
  const response = await api.patch<ApiResponse<{ user: User }>>('/account/profile', data)
  return response.data
}

export async function uploadAvatar(
  file: File,
): Promise<ApiResponse<{ avatarUrl: string; publicId: string; user: User }>> {
  const formData = new FormData()
  formData.append('avatar', file)
  const response = await api.post<ApiResponse<{ avatarUrl: string; publicId: string; user: User }>>(
    '/account/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data
}

export async function removeAvatar(): Promise<ApiResponse<{ user: User }>> {
  const response = await api.delete<ApiResponse<{ user: User }>>('/account/avatar')
  return response.data
}

export async function deactivateAccount(): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/account/deactivate')
  return response.data
}
