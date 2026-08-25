import { BusinessProfile, User } from '../models'
import * as entitlementService from './entitlement.service'

export interface UpsertBusinessProfileInput {
  businessName: string
  description?: string | null
  logo?: string | null
  businessPhone?: string | null
  businessEmail?: string | null
  address?: string | null
  city?: string | null
  businessCategory?: string | null
  tinNumber?: string | null
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  return BusinessProfile.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'is_email_verified', 'is_phone_verified'],
      },
    ],
  })
}

export async function upsertBusinessProfile(
  userId: string,
  input: UpsertBusinessProfileInput,
): Promise<BusinessProfile> {
  const [profile] = await BusinessProfile.upsert({
    user_id: userId,
    business_name: input.businessName.trim(),
    description: input.description?.trim() || null,
    logo: input.logo?.trim() || null,
    business_phone: input.businessPhone?.trim() || null,
    business_email: input.businessEmail?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    business_category: input.businessCategory?.trim() || null,
    tin_number: input.tinNumber?.trim() || null,
  })

  return profile
}

import { resolveUserTier } from './listingLimit.service'

export async function getSellerListingLimit(userId: string): Promise<{
  maxActiveListings: number
  tier: 'FREE' | 'PREMIUM' | 'BUSINESS' | 'ADMIN'
}> {
  return resolveUserTier(userId)
}
