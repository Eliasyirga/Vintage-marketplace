import { Op, fn, col } from 'sequelize'
import { Listing, UserInteraction, Favorite, Message, Conversation } from '../models'
import * as entitlementService from './entitlement.service'

export interface SellerAnalyticsSummary {
  isPremium: boolean
  totalViews: number
  totalFavorites: number
  totalContacts: number
  totalListings: number
  conversionRate: number // percentage
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

export async function getSellerAnalytics(
  sellerId: string,
  days = 30,
): Promise<SellerAnalyticsSummary> {
  const isPremium =
    (await entitlementService.hasEntitlement(sellerId, 'PREMIUM_SELLER')) ||
    (await entitlementService.hasEntitlement(sellerId, 'BUSINESS_ACCOUNT')) ||
    (await entitlementService.hasEntitlement(sellerId, 'ANALYTICS'))

  // 1. Get seller listings
  const listings = await Listing.findAll({
    where: { seller_id: sellerId },
    attributes: ['id', 'title', 'price', 'view_count', 'favorite_count', 'contact_count'],
  })

  const listingIds = listings.map((l) => l.id)

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0)
  const totalFavorites = listings.reduce((sum, l) => sum + ((l as any).favorite_count || 0), 0)
  const totalContacts = listings.reduce((sum, l) => sum + ((l as any).contact_count || 0), 0)
  const totalListings = listings.length
  const conversionRate = totalViews > 0 ? Math.round((totalContacts / totalViews) * 1000) / 10 : 0

  // If Free Tier, return basic summary only
  if (!isPremium) {
    return {
      isPremium: false,
      totalViews,
      totalFavorites,
      totalContacts,
      totalListings,
      conversionRate,
    }
  }

  // 2. Advanced: Top 5 Listings
  const sorted = [...listings].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
  const topListings = sorted.slice(0, 5).map((l) => ({
    id: l.id,
    title: l.title,
    price: Number(l.price),
    views: l.view_count || 0,
    favorites: (l as any).favorite_count || 0,
    contacts: (l as any).contact_count || 0,
  }))

  // 3. Advanced: Daily Performance Trend
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Generate date map
  const dailyMap: Record<string, { views: number; favorites: number; contacts: number }> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const dateKey = d.toISOString().split('T')[0]
    dailyMap[dateKey] = { views: 0, favorites: 0, contacts: 0 }
  }

  if (listingIds.length > 0) {
    // Daily views & interactions from UserInteraction
    const interactions = await UserInteraction.findAll({
      where: {
        listing_id: { [Op.in]: listingIds },
        created_at: { [Op.gte]: startDate },
      },
      attributes: ['interaction_type', 'created_at'],
    })

    for (const item of interactions) {
      const dateKey = new Date(item.created_at).toISOString().split('T')[0]
      if (dailyMap[dateKey]) {
        if (item.interaction_type === 'VIEW') {
          dailyMap[dateKey].views++
        } else if (item.interaction_type === 'FAVORITE') {
          dailyMap[dateKey].favorites++
        } else if (item.interaction_type === 'CONTACT') {
          dailyMap[dateKey].contacts++
        }
      }
    }
  }

  const dailyPerformance = Object.entries(dailyMap).map(([date, counts]) => ({
    date,
    ...counts,
  }))

  return {
    isPremium: true,
    totalViews,
    totalFavorites,
    totalContacts,
    totalListings,
    conversionRate,
    dailyPerformance,
    topListings,
  }
}
