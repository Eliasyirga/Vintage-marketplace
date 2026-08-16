import api from './api'
import type { Plan, PlanType, Entitlement, AdminMonetizationStats } from '../types/monetization'
import type { Listing } from '../types/listing'

export async function getPublicPlans(type?: PlanType): Promise<Plan[]> {
  const response = await api.get<{ success: boolean; data: Plan[] }>('/monetization/plans', {
    params: { type },
  })
  return response.data.data
}

export async function getFeaturedProducts(limit = 8): Promise<Listing[]> {
  const response = await api.get<{ success: boolean; data: Listing[] }>(
    '/monetization/featured',
    { params: { limit } },
  )
  return response.data.data
}

export async function getMyEntitlements(): Promise<Entitlement[]> {
  const response = await api.get<{ success: boolean; data: Entitlement[] }>(
    '/monetization/my-entitlements',
  )
  return response.data.data
}

export async function getAdminMonetizationStats(): Promise<AdminMonetizationStats> {
  const response = await api.get<{ success: boolean; data: AdminMonetizationStats }>(
    '/monetization/admin/stats',
  )
  return response.data.data
}

export async function getAdminPlans(): Promise<Plan[]> {
  const response = await api.get<{ success: boolean; data: Plan[] }>(
    '/monetization/admin/plans',
  )
  return response.data.data
}

export async function createAdminPlan(planData: Partial<Plan>): Promise<Plan> {
  const response = await api.post<{ success: boolean; data: Plan }>(
    '/monetization/admin/plans',
    planData,
  )
  return response.data.data
}

export async function updateAdminPlan(id: string, planData: Partial<Plan>): Promise<Plan> {
  const response = await api.patch<{ success: boolean; data: Plan }>(
    `/monetization/admin/plans/${id}`,
    planData,
  )
  return response.data.data
}
