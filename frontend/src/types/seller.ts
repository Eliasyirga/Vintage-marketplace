export interface PublicSellerProfile {
  id: string
  userId: string
  displayName: string
  bio: string | null
  profileImage: string | null
  city: string | null
  subCity: string | null
  neighborhood: string | null
  memberSince: string
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isFaydaVerified: boolean
  phone?: string | null
  activeListings: number
  soldListings: number
}

export interface SellerProfileEditForm {
  displayName: string
  bio: string
  profileImage: string
  city: string
  subCity: string
  neighborhood: string
}
