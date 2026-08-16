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
  | 'ORDER_PURCHASE'

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

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'

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

export type TransactionStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'COMPLETED'

export type DeliveryOrderStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
