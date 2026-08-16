export type FulfillmentMethod = 'DELIVERY' | 'MEET_IN_PERSON'

export type PaymentMethod = 'PLATFORM_PAYMENT' | 'DIRECT_TO_SELLER'

export type OrderPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SELLER_CONFIRMATION_REQUIRED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'MEETING_REQUESTED'
  | 'MEETING_CONFIRMED'
  | 'INSPECTION_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'

export type DeliveryStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'

export type OrderEventType =
  | 'ORDER_CREATED'
  | 'PAYMENT_INITIALIZED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SELLER_CONFIRMED'
  | 'SELLER_REJECTED'
  | 'MEETING_REQUESTED'
  | 'MEETING_CONFIRMED'
  | 'MEETING_RESCHEDULED'
  | 'ITEM_READY'
  | 'DELIVERY_REQUESTED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'INSPECTION_COMPLETED'
  | 'BUYER_CONFIRMED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUND_COMPLETED'

export interface DeliveryInput {
  fullName: string
  phone: string
  city: string
  subCity: string
  neighborhood?: string
  deliveryLocation: string
  deliveryNotes?: string
}

export interface MeetingInput {
  meetingLocation: string
  meetingDate: string
  meetingTime: string
  buyerNote?: string
}

export interface CreateOrderInput {
  listingId: string
  fulfillmentMethod: FulfillmentMethod
  paymentMethod: PaymentMethod
  provider?: 'MOCK' | 'CHAPA' | 'TELEBIRR'
  deliveryInfo?: DeliveryInput
  meetingInfo?: MeetingInput
  returnUrl?: string
  callbackUrl?: string
}

export interface InspectionChecklistInput {
  productReceived: boolean
  conditionMatchesListing: boolean
  accessoriesIncluded: boolean
  productWorksAsExpected: boolean
  notes?: string
}

export interface ProposeMeetingInput {
  meetingLocation?: string
  meetingDate?: string
  meetingTime?: string
  sellerNote?: string
}

export interface SafeOrderEvent {
  id: string
  orderId: string
  actorId: string | null
  eventType: OrderEventType
  description: string
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface SafeDeliveryOrder {
  id: string
  orderId: string
  providerId: string | null
  recipientName: string
  recipientPhone: string
  city: string
  subCity: string
  neighborhood: string | null
  deliveryLocation: string
  deliveryNotes: string | null
  deliveryFee: number
  platformCommission: number
  status: DeliveryStatus
  trackingReference: string | null
  estimatedDeliveryAt: string | null
  pickedUpAt: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SafeMeetingOrder {
  id: string
  orderId: string
  meetingLocation: string
  meetingDate: string
  meetingTime: string
  buyerNote: string | null
  sellerNote: string | null
  buyerConfirmed: boolean
  sellerConfirmed: boolean
  inspectionCompleted: boolean
  inspectionData: Record<string, unknown> | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SafeOrder {
  id: string
  orderNumber: string
  buyerId: string
  sellerId: string
  listingId: string
  itemPrice: number
  deliveryFee: number
  platformFee: number
  sellerAmount: number
  totalAmount: number
  currency: string
  fulfillmentMethod: FulfillmentMethod
  paymentMethod: PaymentMethod
  paymentStatus: OrderPaymentStatus
  status: OrderStatus
  reservationExpiresAt: string | null
  createdAt: string
  updatedAt: string
  buyer?: {
    id: string
    fullName: string
    phone: string | null
    email: string | null
    avatarUrl: string | null
  }
  seller?: {
    id: string
    fullName: string
    phone: string | null
    email: string | null
    avatarUrl: string | null
  }
  listing?: {
    id: string
    title: string
    price: number
    condition: string
    city: string
    subCity?: string
    status: string
    images?: Array<{ id: string; url: string; sortOrder: number }>
  }
  payment?: {
    id: string
    reference: string
    provider: string
    amount: number
    currency: string
    status: string
    paidAt: string | null
  }
  delivery?: SafeDeliveryOrder | null
  meeting?: SafeMeetingOrder | null
  events?: SafeOrderEvent[]
}
