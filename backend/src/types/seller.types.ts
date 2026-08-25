import type SellerProfile from '../models/SellerProfile'
import type User from '../models/User'

/**
 * Public seller profile returned in API responses.
 * Never includes: password, OTP, email, phone, or auth tokens.
 */
export interface PublicSellerProfile {
  id: string
  userId: string
  displayName: string
  bio: string | null
  profileImage: string | null
  city: string | null
  subCity: string | null
  neighborhood: string | null
  rating: number | null
  totalSales: number
  isActive: boolean
  /** Derived from User.created_at */
  memberSince: Date
  /** True if email OR phone verified */
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isFaydaVerified: boolean
  activeListings: number
  soldListings: number
}

export interface UpsertSellerProfileInput {
  displayName?: string
  bio?: string
  profileImage?: string
  city?: string
  subCity?: string
  neighborhood?: string
  isActive?: boolean
}

export interface SellerListingsQuery {
  page?: number
  limit?: number
}

// Re-export for convenience so other modules don't need to import the model directly
export type { SellerProfile, User }
