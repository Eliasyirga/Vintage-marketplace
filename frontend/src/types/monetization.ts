export type PlanType =
  | 'FEATURED'
  | 'BOOST'
  | 'PREMIUM'
  | 'BUSINESS'
  | 'VERIFICATION'
  | 'ADVERTISEMENT'

export type BillingCycle = 'ONE_TIME' | 'MONTHLY' | 'YEARLY'

export type PaymentPurpose =
  | 'FEATURED_LISTING'
  | 'LISTING_BOOST'
  | 'BUSINESS_SUBSCRIPTION'
  | 'PREMIUM_SUBSCRIPTION'
  | 'VERIFICATION'
  | 'ADVERTISEMENT'
  | 'TRANSACTION_FEE'
  | 'DELIVERY'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentProviderName = 'MOCK' | 'CHAPA' | 'TELEBIRR'

export type EntitlementType =
  | 'FEATURED'
  | 'BOOST'
  | 'PREMIUM_SELLER'
  | 'BUSINESS_ACCOUNT'
  | 'VERIFIED_SELLER'
  | 'ANALYTICS'
  | 'ADVERTISEMENT'

export type EntitlementStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'REVOKED'

export interface Plan {
  id: string
  name: string
  type: PlanType
  price: number
  currency: string
  durationDays: number
  billingCycle: BillingCycle
  features: string[]
  isActive: boolean
  sortOrder: number
}

export interface Payment {
  id: string
  userId: string
  reference: string
  provider: PaymentProviderName
  providerReference: string | null
  amount: number
  currency: string
  purpose: PaymentPurpose
  status: PaymentStatus
  metadata: Record<string, any> | null
  paidAt: string | null
  createdAt: string
}

export interface Entitlement {
  id: string
  userId: string
  listingId: string | null
  type: EntitlementType
  status: EntitlementStatus
  startAt: string
  expiresAt: string | null
  paymentId: string | null
  isActive: boolean
}

export interface BusinessProfile {
  id: string
  userId: string
  businessName: string
  description: string | null
  logo: string | null
  businessPhone: string | null
  businessEmail: string | null
  address: string | null
  city: string | null
  businessCategory: string | null
  registrationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export type AdPlacement =
  | 'HOME_TOP'
  | 'MARKETPLACE_MIDDLE'
  | 'MARKETPLACE_BOTTOM'

export type AdStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'PAUSED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface Advertisement {
  id: string
  advertiserId: string
  planId?: string | null
  title: string
  description: string | null
  image: string
  targetUrl: string
  placement: AdPlacement
  budget: number
  status: AdStatus
  paymentId: string | null
  rejectionReason: string | null
  startAt: string | null
  endAt: string | null
  priority?: number
  clickCount: number
  impressionCount: number
  ctr?: number
  isActive: boolean
  createdAt: string
  advertiserName?: string
  advertiserAvatar?: string | null
  advertiser?: {
    id: string
    fullName: string
    email: string | null
    phone: string | null
    avatarUrl?: string | null
    businessProfile?: {
      businessName: string
      logo: string | null
    } | null
  }
  plan?: {
    id: string
    name: string
    durationDays: number
    price: number
  } | null
  payment?: {
    id: string
    reference: string
    status: string
    paidAt: string | null
  } | null
}

export interface ActiveAdSlots {
  homeTop: Advertisement | null
  marketplaceMiddle: Advertisement | null
  marketplaceBottom: Advertisement | null
}

export interface AvailablePlacementsResponse {
  available: AdPlacement[]
  occupied: AdPlacement[]
  slots: Record<AdPlacement, boolean>
}

export interface SellerAnalytics {
  isPremium: boolean
  totalViews: number
  totalFavorites: number
  totalContacts: number
  totalListings: number
  conversionRate: number
  dailyPerformance?: {
    date: string
    views: number
    favorites: number
    contacts: number
  }[]
  topListings?: {
    id: string
    title: string
    price: number
    views: number
    favorites: number
    contacts: number
  }[]
}

export interface AdminMonetizationStats {
  totalRevenue: number
  todayRevenue: number
  monthlyRevenue: number
  successfulPaymentsCount: number
  failedPaymentsCount: number
  activeSubscriptionsCount: number
  activeFeaturedCount: number
  activeBoostsCount: number
  pendingVerificationsCount: number
  pendingAdsCount: number
  revenueByPurpose: Record<string, number>
}
