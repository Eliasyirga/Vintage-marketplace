export interface DashboardStats {
  marketplace: {
    totalUsers: number
    totalActiveListings: number
    totalOrders: number
    totalPaymentVolume: number
    activeSellers: number
    businessAccounts: number
  }
  today: {
    newUsersToday: number
    newListingsToday: number
    newOrdersToday: number
    todayPaymentVolume: number
  }
  attentionRequired: {
    pendingListings: number
    pendingAdvertisements: number
    pendingVerifications: number
    openReports: number
    failedPayments: number
  }
  ordersSummary: {
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
  }
  paymentsSummary: {
    successfulPayments: number
    failedPayments: number
    pendingPayments: number
  }
  advertisementsSummary: {
    activeAds: number
    pendingAds: number
    expiredAds: number
  }
}

export interface TimeseriesDataPoint {
  date: string
  users: number
  listings: number
  orders: number
  paymentVolume: number
}

export interface AccountTierBreakdown {
  basic: number
  premium: number
  business: number
}

export interface RiskSignalItem {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  accountStatus: string
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  reasons: string[]
  reportCount: number
  failedPaymentsCount: number
  rejectedListingsCount: number
  createdAt: string
}

export interface AdminUserItem {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
  avatarUrl: string | null
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isFaydaVerified: boolean
  tier: 'BASIC' | 'PREMIUM' | 'BUSINESS'
  listingsCount: number
  createdAt: string
  businessProfile?: {
    id: string
    businessName: string
    status: string
  } | null
}

export interface UserDetailsDossier {
  user: {
    id: string
    fullName: string
    email: string | null
    phone: string | null
    role: string
    status: string
    avatarUrl: string | null
    isEmailVerified: boolean
    isPhoneVerified: boolean
    isFaydaVerified: boolean
    createdAt: string
    updatedAt: string
  }
  businessProfile: any
  sellerProfile: any
  listings: Array<{
    id: string
    title: string
    price: number
    status: string
    views_count: number
    created_at: string
  }>
  salesOrders: Array<{
    id: string
    order_number: string
    total_amount: number
    status: string
    payment_status: string
    created_at: string
  }>
  purchaseOrders: Array<{
    id: string
    order_number: string
    total_amount: number
    status: string
    payment_status: string
    created_at: string
  }>
  payments: Array<{
    id: string
    reference: string
    amount: number
    currency: string
    purpose: string
    status: string
    paid_at: string | null
    created_at: string
  }>
  reportsAgainst: Array<{
    id: string
    reason: string
    status: string
    priority: string
    description: string
    created_at: string
  }>
  verifications: Array<{
    id: string
    verification_type: string
    status: string
    document_reference: string | null
    verified_at: string | null
    rejection_reason: string | null
    created_at: string
  }>
  entitlements: Array<{
    id: string
    type: string
    status: string
    start_at: string
    end_at: string | null
  }>
  stats: {
    totalListings: number
    activeListings: number
    totalSales: number
    totalPurchases: number
    totalPaidETB: number
  }
}

export interface AdminListingItem {
  id: string
  title: string
  price: number
  status: string
  views_count: number
  created_at: string
  seller?: {
    id: string
    full_name: string
    email: string
    phone: string
    avatar_url: string | null
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  images?: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
}

export interface AdminOrderItem {
  id: string
  order_number: string
  total_amount: string
  item_price: string
  delivery_fee: string
  platform_fee: string
  currency: string
  fulfillment_method: string
  payment_method: string
  payment_status: string
  status: string
  created_at: string
  buyer?: {
    id: string
    full_name: string
    email: string
    phone: string
  }
  seller?: {
    id: string
    full_name: string
    email: string
    phone: string
  }
  listing?: {
    id: string
    title: string
    price: string
    images?: Array<{ image_url: string; is_primary: boolean }>
  }
}

export interface AdminPaymentItem {
  id: string
  user_id: string
  order_id: string | null
  reference: string
  provider: string
  provider_reference: string | null
  amount: string
  currency: string
  purpose: string
  status: string
  paid_at: string | null
  created_at: string
  user?: {
    id: string
    full_name: string
    email: string
    phone: string
  }
}

export interface AdminBusinessItem {
  id: string
  user_id: string
  business_name: string
  description: string | null
  logo: string | null
  business_phone: string | null
  business_email: string | null
  address: string | null
  city: string | null
  business_category: string | null
  tin_number: string | null
  registration_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  created_at: string
  listingsCount: number
  maxListingQuota: number
  user?: {
    id: string
    full_name: string
    email: string
    phone: string
    avatar_url: string | null
    created_at: string
  }
}

export interface AdminAuditLogItem {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  metadata: any
  created_at: string
  admin?: {
    id: string
    full_name: string
  }
}

export interface GlobalSearchResults {
  users: AdminUserItem[]
  listings: AdminListingItem[]
  orders: AdminOrderItem[]
  payments: AdminPaymentItem[]
  advertisements: Array<{
    id: string
    title: string
    placement: string
    status: string
    created_at: string
  }>
}

export interface TrackedSellerItem {
  userId: string
  fullName: string
  email: string
  phone: string
  isFaydaVerified: boolean
  accountType: 'BASIC' | 'BUSINESS'
  status: string
  totalListings: number
  activeListings: number
  soldListings: number
  quota: number
  quotaPercent: number
  isNearLimit: boolean
  createdAt: string
}

export interface SellerAnalyticsResult {
  topSellers: TrackedSellerItem[]
  usersNearLimit: TrackedSellerItem[]
  totalTrackedSellers: number
}

export interface AdminNotificationItem {
  id: string
  title: string
  message: string
  category: 'REPORT' | 'VERIFICATION' | 'ADVERTISEMENT' | 'PAYMENT'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'
  link: string
  createdAt: string
}

export interface SystemSettings {
  gateway: {
    provider: string
    currency: string
    mode: string
    enabled: boolean
    totalPaymentsProcessed: number
  }
  faydaOidc: {
    provider: string
    endpoint: string
    sandboxMode: boolean
    status: string
  }
  marketplaceLimits: {
    basicUserListingCap: number
    businessStoreListingCap: number
    imageUploadLimitMB: number
    platformCommissionRate: string
  }
  platformStats: {
    totalUsers: number
    totalListings: number
    totalOrders: number
  }
}

