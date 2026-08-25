import api from './api'
import type {
  Advertisement,
  AdPlacement,
  AdStatus,
  ActiveAdSlots,
  AvailablePlacementsResponse,
  Plan,
} from '../types/monetization'

export interface CreateAdInput {
  planId: string
  title: string
  description?: string
  imageFile: File              // Image file to upload
  targetUrl: string
  placement: AdPlacement
}

/**
 * Fetch all 3 active marketplace advertisement slots in ONE single API call.
 */
export async function getActiveSlots(): Promise<ActiveAdSlots> {
  const response = await api.get<{ success: boolean; data: ActiveAdSlots }>(
    '/advertisements/active',
  )
  return response.data.data
}

/**
 * Fetch active ads for a specific placement slot (returns array for carousel).
 */
export async function getActiveAdByPlacement(
  placement: AdPlacement,
): Promise<Advertisement[]> {
  const response = await api.get<{ success: boolean; data: Advertisement[] }>(
    '/advertisements/active',
    { params: { placement } },
  )
  return response.data.data ?? []
}

/**
 * Check which placements are available vs occupied.
 */
export async function getAvailablePlacements(): Promise<AvailablePlacementsResponse> {
  const response = await api.get<{ success: boolean; data: AvailablePlacementsResponse }>(
    '/advertisements/available-placements',
  )
  return response.data.data
}

/**
 * Get advertisement pricing plans.
 */
export async function getAdPlans(): Promise<Plan[]> {
  const response = await api.get<{ success: boolean; data: Plan[] }>(
    '/advertisements/plans',
  )
  return response.data.data
}

/**
 * Create a new advertisement (enters PENDING_PAYMENT).
 * Sends multipart/form-data — the image file is uploaded directly to the backend
 * which streams it to Cloudinary without exposing API credentials to the frontend.
 */
export async function createAdvertisement(input: CreateAdInput): Promise<Advertisement> {
  const formData = new FormData()
  formData.append('image', input.imageFile)
  formData.append('planId', input.planId)
  formData.append('title', input.title)
  if (input.description) formData.append('description', input.description)
  formData.append('targetUrl', input.targetUrl)
  formData.append('placement', input.placement)

  const response = await api.post<{ success: boolean; data: Advertisement }>(
    '/advertisements',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data.data
}

/**
 * Get all advertisements owned by the current advertiser.
 */
export async function getMyAdvertisements(): Promise<Advertisement[]> {
  const response = await api.get<{ success: boolean; data: Advertisement[] }>(
    '/advertisements/my-ads',
  )
  return response.data.data
}

/**
 * Get single ad by ID.
 */
export async function getAdvertisementById(id: string): Promise<Advertisement> {
  const response = await api.get<{ success: boolean; data: Advertisement }>(
    `/advertisements/${id}`,
  )
  return response.data.data
}

/**
 * Pause active ad.
 */
export async function pauseAdvertisement(id: string): Promise<Advertisement> {
  const response = await api.post<{ success: boolean; data: Advertisement }>(
    `/advertisements/${id}/pause`,
  )
  return response.data.data
}

/**
 * Resume paused ad.
 */
export async function resumeAdvertisement(id: string): Promise<Advertisement> {
  const response = await api.post<{ success: boolean; data: Advertisement }>(
    `/advertisements/${id}/resume`,
  )
  return response.data.data
}

/**
 * Cancel ad.
 */
export async function cancelAdvertisement(id: string): Promise<Advertisement> {
  const response = await api.post<{ success: boolean; data: Advertisement }>(
    `/advertisements/${id}/cancel`,
  )
  return response.data.data
}

/**
 * Record ad impression (fire-and-forget).
 */
export async function recordAdImpression(id: string): Promise<void> {
  await api.post(`/advertisements/${id}/impression`).catch(() => {})
}

/**
 * Record ad click and return target URL.
 */
export async function recordAdClick(id: string): Promise<{ success: boolean; targetUrl?: string }> {
  try {
    const response = await api.post<{ success: boolean; targetUrl?: string }>(
      `/advertisements/${id}/click`,
    )
    return response.data
  } catch {
    return { success: false }
  }
}

// ── Admin Service Methods ───────────────────────────────────────────────────

export async function getAllAdsAdmin(status?: AdStatus | string): Promise<Advertisement[]> {
  const response = await api.get<{ success: boolean; data: Advertisement[] }>(
    '/advertisements/admin',
    { params: { status: status || undefined } },
  )
  return response.data.data
}

export async function approveAdAdmin(id: string): Promise<Advertisement> {
  const response = await api.post<{ success: boolean; data: Advertisement }>(
    `/advertisements/admin/${id}/approve`,
  )
  return response.data.data
}

export async function rejectAdAdmin(id: string, reason: string): Promise<Advertisement> {
  const response = await api.post<{ success: boolean; data: Advertisement }>(
    `/advertisements/admin/${id}/reject`,
    { reason },
  )
  return response.data.data
}
