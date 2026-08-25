import {
  User,
  SellerProfile,
  BusinessProfile,
  Listing,
  Order,
  Favorite,
  Conversation,
  UserVerification,
  Payment,
} from '../models'
import { Op } from 'sequelize'
import type { SafeUser } from '../types/auth.types'
import * as uploadService from './upload.service'

export interface AccountOverviewData {
  user: SafeUser
  sellerProfile: {
    exists: boolean
    displayName?: string | null
    profileImage?: string | null
    city?: string | null
    subCity?: string | null
    rating?: number | null
    totalSales?: number
    isActive?: boolean
  }
  businessProfile: {
    exists: boolean
    businessName?: string
    registrationStatus?: string
    logo?: string | null
  }
  stats: {
    activeListings: number
    totalListings: number
    buyerOrdersTotal: number
    buyerOrdersPending: number
    buyerOrdersActive: number
    buyerOrdersCompleted: number
    sellerOrdersTotal: number
    sellerOrdersPending: number
    sellerOrdersActive: number
    sellerOrdersCompleted: number
    favoritesCount: number
    conversationsCount: number
    totalSpentETB: number
    totalEarnedETB: number
  }
  verifications: Array<{
    type: string
    status: string
    verifiedAt: Date | null
  }>
}

export interface UpdateProfileInput {
  fullName?: string
  avatarUrl?: string | null
}

export async function getAccountOverview(userId: string): Promise<AccountOverviewData> {
  const user = await User.findByPk(userId, {
    include: [
      { model: SellerProfile, as: 'sellerProfile', required: false },
      { model: BusinessProfile, as: 'businessProfile', required: false },
      { model: UserVerification, as: 'verifications', required: false },
    ],
  })

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  const sellerProfile = (user as any).sellerProfile as SellerProfile | null
  const businessProfile = (user as any).businessProfile as BusinessProfile | null
  const verifications = ((user as any).verifications as UserVerification[]) || []

  // Concurrently fetch counts for performance
  const [
    activeListings,
    totalListings,
    buyerOrdersTotal,
    buyerOrdersPending,
    buyerOrdersActive,
    buyerOrdersCompleted,
    sellerOrdersTotal,
    sellerOrdersPending,
    sellerOrdersActive,
    sellerOrdersCompleted,
    favoritesCount,
    conversationsCount,
    buyerCompletedOrders,
    sellerCompletedOrders,
  ] = await Promise.all([
    Listing.count({ where: { seller_id: userId, status: 'ACTIVE' } }),
    Listing.count({ where: { seller_id: userId } }),
    Order.count({ where: { buyer_id: userId } }),
    Order.count({
      where: {
        buyer_id: userId,
        status: ['PENDING_PAYMENT', 'MEETING_REQUESTED'],
      },
    }),
    Order.count({
      where: {
        buyer_id: userId,
        status: [
          'PAID',
          'SELLER_CONFIRMATION_REQUIRED',
          'CONFIRMED',
          'PREPARING',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY',
          'MEETING_CONFIRMED',
          'INSPECTION_PENDING',
        ],
      },
    }),
    Order.count({ where: { buyer_id: userId, status: 'COMPLETED' } }),
    Order.count({ where: { seller_id: userId } }),
    Order.count({
      where: {
        seller_id: userId,
        status: ['PENDING_PAYMENT', 'MEETING_REQUESTED', 'SELLER_CONFIRMATION_REQUIRED'],
      },
    }),
    Order.count({
      where: {
        seller_id: userId,
        status: [
          'PAID',
          'CONFIRMED',
          'PREPARING',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY',
          'MEETING_CONFIRMED',
          'INSPECTION_PENDING',
        ],
      },
    }),
    Order.count({ where: { seller_id: userId, status: 'COMPLETED' } }),
    Favorite.count({ where: { user_id: userId } }),
    Conversation.count({
      where: {
        [Op.or]: [{ buyer_id: userId }, { seller_id: userId }],
      },
    }),
    Order.findAll({
      where: { buyer_id: userId, status: 'COMPLETED' },
      attributes: ['total_amount'],
    }),
    Order.findAll({
      where: { seller_id: userId, status: 'COMPLETED' },
      attributes: ['seller_amount'],
    }),
  ])

  const totalSpentETB = buyerCompletedOrders.reduce(
    (sum, o) => sum + Number((o as any).total_amount || 0),
    0,
  )
  const totalEarnedETB = sellerCompletedOrders.reduce(
    (sum, o) => sum + Number((o as any).seller_amount || 0),
    0,
  )

  return {
    user: user.toSafeObject() as SafeUser,
    sellerProfile: {
      exists: !!sellerProfile,
      displayName: sellerProfile?.display_name,
      profileImage: sellerProfile?.profile_image,
      city: sellerProfile?.city,
      subCity: sellerProfile?.sub_city,
      rating: sellerProfile?.rating ? Number(sellerProfile.rating) : null,
      totalSales: sellerProfile?.total_sales ?? sellerOrdersCompleted,
      isActive: sellerProfile?.is_active ?? true,
    },
    businessProfile: {
      exists: !!businessProfile,
      businessName: businessProfile?.business_name,
      registrationStatus: businessProfile?.registration_status,
      logo: businessProfile?.logo,
    },
    stats: {
      activeListings,
      totalListings,
      buyerOrdersTotal,
      buyerOrdersPending,
      buyerOrdersActive,
      buyerOrdersCompleted,
      sellerOrdersTotal,
      sellerOrdersPending,
      sellerOrdersActive,
      sellerOrdersCompleted,
      favoritesCount,
      conversationsCount,
      totalSpentETB,
      totalEarnedETB,
    },
    verifications: verifications.map((v) => ({
      type: v.verification_type,
      status: v.status,
      verifiedAt: v.verified_at,
    })),
  }
}

export async function updateAccountProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<SafeUser> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  if (input.fullName && input.fullName.trim().length >= 2) {
    user.full_name = input.fullName.trim()
  }

  if (input.avatarUrl !== undefined) {
    user.avatar_url = input.avatarUrl
  }

  await user.save()
  return user.toSafeObject() as SafeUser
}

export async function uploadAvatar(
  userId: string,
  file: Express.Multer.File,
): Promise<{ avatarUrl: string; publicId: string; user: SafeUser }> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  const uploaded = await uploadService.saveProfileImage(file, userId)

  user.avatar_url = uploaded.url
  await user.save()

  // Also update SellerProfile if present
  await SellerProfile.update(
    { profile_image: uploaded.url },
    { where: { user_id: userId } },
  )

  return {
    avatarUrl: uploaded.url,
    publicId: uploaded.publicId,
    user: user.toSafeObject() as SafeUser,
  }
}

export async function removeAvatar(userId: string): Promise<{ message: string; user: SafeUser }> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  user.avatar_url = null
  await user.save()

  await SellerProfile.update(
    { profile_image: null },
    { where: { user_id: userId } },
  )

  return {
    message: 'Avatar removed successfully.',
    user: user.toSafeObject() as SafeUser,
  }
}

export async function deactivateAccount(userId: string): Promise<{ message: string }> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }

  // Soft deactivate — preserves financial records, order history, and audit compliance
  user.status = 'DEACTIVATED'
  await user.save()

  // Deactivate seller profile if present
  await SellerProfile.update({ is_active: false }, { where: { user_id: userId } })

  return { message: 'Your account has been deactivated. You can reactivate by contacting support.' }
}
