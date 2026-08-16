import api from './api'
import type {
  Listing,
  ListingsResponse,
  ListingStatus,
  ListingCondition,
  SortOption,
} from '../types/listing'

export interface GetListingsParams {
  page?: number
  limit?: number
  categoryId?: string
  condition?: ListingCondition
  city?: string
  subCity?: string
  neighborhood?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: SortOption
  status?: ListingStatus
  sellerId?: string
}

export async function getListings(params?: GetListingsParams): Promise<ListingsResponse> {
  const response = await api.get<{ success: boolean; data: ListingsResponse }>('/listings', {
    params,
  })
  return response.data.data
}

export async function getListingById(id: string): Promise<Listing> {
  const response = await api.get<{ success: boolean; data: { listing: Listing } }>(`/listings/${id}`)
  return response.data.data.listing
}

export async function getMyListings(params?: {
  page?: number
  limit?: number
  status?: ListingStatus
}): Promise<ListingsResponse> {
  const response = await api.get<{ success: boolean; data: ListingsResponse }>('/my-listings', {
    params,
  })
  return response.data.data
}

export async function createListing(
  formData: FormData,
): Promise<{ listing: Listing; message: string }> {
  const response = await api.post<{
    success: boolean
    message: string
    data: { listing: Listing }
  }>('/listings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return {
    listing: response.data.data.listing,
    message: response.data.message,
  }
}

export async function updateListing(
  id: string,
  formData: FormData,
): Promise<{ listing: Listing; message: string }> {
  const response = await api.patch<{
    success: boolean
    message: string
    data: { listing: Listing }
  }>(`/listings/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return {
    listing: response.data.data.listing,
    message: response.data.message,
  }
}

export async function updateListingStatus(
  id: string,
  status: 'ACTIVE' | 'SOLD' | 'ARCHIVED',
): Promise<{ listing: Listing; message: string }> {
  const response = await api.patch<{
    success: boolean
    message: string
    data: { listing: Listing }
  }>(`/listings/${id}/status`, { status })
  return {
    listing: response.data.data.listing,
    message: response.data.message,
  }
}

export async function deleteListing(id: string): Promise<void> {
  await api.delete(`/listings/${id}`)
}
