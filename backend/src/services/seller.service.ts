import { User, SellerProfile, Listing } from '../models'
import type { PublicSellerProfile, UpsertSellerProfileInput, SellerListingsQuery } from '../types/seller.types'
import { formatListing } from './listing.service'
import Category from '../models/Category'
import ListingImage from '../models/ListingImage'

// ── Helpers ──────────────────────────────────────────────────────────────────

const listingIncludes = [
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description', 'image'] },
  {
    model: User,
    as: 'seller',
    attributes: [
      'id',
      'full_name',
      'avatar_url',
      'is_email_verified',
      'is_phone_verified',
      'is_fayda_verified',
      'is_face_verified',
    ],
    include: [
      {
        model: SellerProfile,
        as: 'sellerProfile',
        attributes: ['id', 'display_name', 'profile_image', 'city', 'sub_city'],
        required: false,
      },
    ],
  },
  { model: ListingImage, as: 'images' },
]

function formatPublicProfile(user: User, profile: SellerProfile | null): PublicSellerProfile {
  const isVerified = user.is_email_verified || user.is_phone_verified
  const displayName =
    profile?.display_name || user.full_name

  return {
    id: user.id,
    userId: user.id,
    displayName,
    bio: profile?.bio ?? null,
    profileImage: profile?.profile_image ?? user.avatar_url,
    city: profile?.city ?? null,
    subCity: profile?.sub_city ?? null,
    neighborhood: profile?.neighborhood ?? null,
    memberSince: user.created_at,
    isVerified,
    isEmailVerified: user.is_email_verified,
    isPhoneVerified: user.is_phone_verified,
    isFaydaVerified: user.is_fayda_verified,
    isFaceVerified: user.is_face_verified,
    activeListings: 0,  // populated by getPublicSellerProfile
    soldListings: 0,    // populated by getPublicSellerProfile
  }
}

// ── Public: Get seller profile by userId ─────────────────────────────────────

export async function getPublicSellerProfile(sellerId: string): Promise<PublicSellerProfile> {
  const user = await User.findByPk(sellerId, {
    attributes: [
      'id',
      'full_name',
      'avatar_url',
      'is_email_verified',
      'is_phone_verified',
      'is_fayda_verified',
      'is_face_verified',
      'created_at',
    ],
    include: [
      {
        model: SellerProfile,
        as: 'sellerProfile',
        required: false,
      },
    ],
  })

  if (!user) {
    throw Object.assign(new Error('Seller not found.'), { statusCode: 404 })
  }

  const profile = (user as User & { sellerProfile?: SellerProfile }).sellerProfile ?? null

  // Count active and sold listings
  const [activeCount, soldCount] = await Promise.all([
    Listing.count({ where: { seller_id: sellerId, status: 'ACTIVE' } }),
    Listing.count({ where: { seller_id: sellerId, status: 'SOLD' } }),
  ])

  const formatted = formatPublicProfile(user, profile)
  formatted.activeListings = activeCount
  formatted.soldListings = soldCount

  return formatted
}

// ── Public: Get seller's active listings ─────────────────────────────────────

export async function getSellerPublicListings(
  sellerId: string,
  query: SellerListingsQuery,
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 12
  const offset = (page - 1) * limit

  // Verify the seller exists
  const userExists = await User.count({ where: { id: sellerId } })
  if (!userExists) {
    throw Object.assign(new Error('Seller not found.'), { statusCode: 404 })
  }

  const { rows, count } = await Listing.findAndCountAll({
    where: { seller_id: sellerId, status: 'ACTIVE' },
    include: listingIncludes,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  })

  return {
    listings: rows.map(formatListing),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNextPage: page * limit < count,
      hasPreviousPage: page > 1,
    },
  }
}

// ── Auth: Get own profile (creates if missing) ────────────────────────────────

export async function getMySellerProfile(userId: string): Promise<PublicSellerProfile> {
  const user = await User.findByPk(userId, {
    attributes: [
      'id',
      'full_name',
      'avatar_url',
      'is_email_verified',
      'is_phone_verified',
      'is_fayda_verified',
      'is_face_verified',
      'created_at',
    ],
    include: [
      {
        model: SellerProfile,
        as: 'sellerProfile',
        required: false,
      },
    ],
  })

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  const profile = (user as User & { sellerProfile?: SellerProfile }).sellerProfile ?? null

  const [activeCount, soldCount] = await Promise.all([
    Listing.count({ where: { seller_id: userId, status: 'ACTIVE' } }),
    Listing.count({ where: { seller_id: userId, status: 'SOLD' } }),
  ])

  const formatted = formatPublicProfile(user, profile)
  formatted.activeListings = activeCount
  formatted.soldListings = soldCount

  return formatted
}

// ── Auth: Upsert own seller profile ──────────────────────────────────────────

export async function upsertMySellerProfile(
  userId: string,
  input: UpsertSellerProfileInput,
): Promise<PublicSellerProfile> {
  const [profile] = await SellerProfile.upsert({
    user_id: userId,
    display_name: input.displayName ?? null,
    bio: input.bio || null,
    profile_image: input.profileImage || null,
    city: input.city || null,
    sub_city: input.subCity || null,
    neighborhood: input.neighborhood || null,
  })

  return getMySellerProfile(userId)
}
