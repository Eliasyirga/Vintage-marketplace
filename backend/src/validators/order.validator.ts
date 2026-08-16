import { z } from 'zod'

export const buyNowPreflightSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID format.'),
})

export const createOrderSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID format.'),
  fulfillmentMethod: z.enum(['DELIVERY', 'MEET_IN_PERSON']),
  paymentMethod: z.enum(['PLATFORM_PAYMENT', 'DIRECT_TO_SELLER']),
  provider: z.enum(['MOCK', 'CHAPA', 'TELEBIRR']).optional(),
  deliveryInfo: z
    .object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters.').max(120),
      phone: z.string().min(9, 'Valid phone number is required.').max(20),
      city: z.string().min(2).max(100),
      subCity: z.string().min(2).max(100),
      neighborhood: z.string().max(100).optional(),
      deliveryLocation: z.string().min(3, 'Specific delivery address or landmark is required.'),
      deliveryNotes: z.string().max(500).optional(),
    })
    .optional(),
  meetingInfo: z
    .object({
      meetingLocation: z.string().min(3, 'Public meeting location is required.').max(255),
      meetingDate: z.string().min(4, 'Meeting date is required.').max(50),
      meetingTime: z.string().min(2, 'Meeting time is required.').max(50),
      buyerNote: z.string().max(500).optional(),
    })
    .optional(),
  returnUrl: z.string().url().optional(),
  callbackUrl: z.string().url().optional(),
})

export const proposeMeetingSchema = z.object({
  meetingLocation: z.string().min(3).max(255).optional(),
  meetingDate: z.string().min(4).max(50).optional(),
  meetingTime: z.string().min(2).max(50).optional(),
  sellerNote: z.string().max(500).optional(),
})

export const inspectionChecklistSchema = z.object({
  productReceived: z.boolean(),
  conditionMatchesListing: z.boolean(),
  accessoriesIncluded: z.boolean(),
  productWorksAsExpected: z.boolean(),
  notes: z.string().max(500).optional(),
})

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required (min 3 characters).').max(500),
})
