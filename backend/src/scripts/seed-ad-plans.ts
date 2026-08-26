import 'dotenv/config'
import { Plan } from '../models'
import { sequelize } from '../config/database'

export const AD_PLANS = [
  // ── MARKETPLACE_BANNER Plans ──
  {
    name: 'Home Top Banner - 3 Days',
    type: 'ADVERTISEMENT' as const,
    price: '300.00',
    currency: 'ETB',
    duration_days: 3,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_BANNER',
      'HOME_TOP',
      'Premium top-of-homepage wide banner placement',
      'Maximum visibility to every marketplace visitor',
      'Direct link to your store, listing, or external site',
      'Real-time impression & click analytics tracking',
    ],
    is_active: true,
    sort_order: 10,
  },
  {
    name: 'Home Top Banner - 7 Days',
    type: 'ADVERTISEMENT' as const,
    price: '600.00',
    currency: 'ETB',
    duration_days: 7,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_BANNER',
      'HOME_TOP',
      'Full week premium top-of-homepage wide banner',
      'Featured placement above all product categories',
      'Direct link with safe outbound referral',
      'Real-time CTR, impression & click analytics',
    ],
    is_active: true,
    sort_order: 11,
  },
  {
    name: 'Home Top Banner - 14 Days',
    type: 'ADVERTISEMENT' as const,
    price: '1100.00',
    currency: 'ETB',
    duration_days: 14,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_BANNER',
      'HOME_TOP',
      '2-week extended top-of-homepage placement',
      'High-conversion brand showcase for businesses',
      'Verified sponsored badge with custom creatives',
      'Priority delivery & comprehensive analytics',
    ],
    is_active: true,
    sort_order: 12,
  },
  {
    name: 'Home Top Banner - 30 Days',
    type: 'ADVERTISEMENT' as const,
    price: '2200.00',
    currency: 'ETB',
    duration_days: 30,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_BANNER',
      'HOME_TOP',
      'Full month top banner domination',
      'Unmatched reach across all Bonda traffic',
      'Dedicated sponsor attribution & reporting',
    ],
    is_active: true,
    sort_order: 13,
  },

  // ── MARKETPLACE_FEATURED Plans ──
  {
    name: 'Marketplace In-Feed - 3 Days',
    type: 'ADVERTISEMENT' as const,
    price: '200.00',
    currency: 'ETB',
    duration_days: 3,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_FEATURED',
      'MARKETPLACE_MIDDLE',
      'Native in-feed ad embedded between product search results',
      'Reaches high-intent shoppers actively browsing products',
      'Engaging visual card with Learn More action',
      'Full analytics tracking (impressions, clicks, CTR)',
    ],
    is_active: true,
    sort_order: 20,
  },
  {
    name: 'Marketplace In-Feed - 7 Days',
    type: 'ADVERTISEMENT' as const,
    price: '400.00',
    currency: 'ETB',
    duration_days: 7,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_FEATURED',
      'MARKETPLACE_MIDDLE',
      '1 week native in-feed placement in browse & search grids',
      'Targeted directly at vintage & second-hand buyers',
      'Custom title, banner visual & landing page link',
      'Performance analytics dashboard',
    ],
    is_active: true,
    sort_order: 21,
  },
  {
    name: 'Marketplace In-Feed - 14 Days',
    type: 'ADVERTISEMENT' as const,
    price: '750.00',
    currency: 'ETB',
    duration_days: 14,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_FEATURED',
      'MARKETPLACE_MIDDLE',
      '2-week native in-feed sponsored card',
      'Continuous exposure in category and search results',
      'Performance reporting with CTR insights',
    ],
    is_active: true,
    sort_order: 22,
  },
  {
    name: 'Marketplace In-Feed - 30 Days',
    type: 'ADVERTISEMENT' as const,
    price: '1500.00',
    currency: 'ETB',
    duration_days: 30,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_FEATURED',
      'MARKETPLACE_MIDDLE',
      'Full month native in-feed presence in marketplace results',
      'Maximum repeat buyer exposure',
      'Monthly analytics & engagement metrics',
    ],
    is_active: true,
    sort_order: 23,
  },

  // ── MARKETPLACE_SIDEBAR Plans ──
  {
    name: 'Marketplace Sidebar - 3 Days',
    type: 'ADVERTISEMENT' as const,
    price: '150.00',
    currency: 'ETB',
    duration_days: 3,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_SIDEBAR',
      'MARKETPLACE_BOTTOM',
      'Prominent desktop sidebar banner beside search filters',
      'Catches engaged buyers as they refine search results',
      'Sponsored call-to-action button to your business',
      'Impression and click tracking',
    ],
    is_active: true,
    sort_order: 30,
  },
  {
    name: 'Marketplace Sidebar - 7 Days',
    type: 'ADVERTISEMENT' as const,
    price: '300.00',
    currency: 'ETB',
    duration_days: 7,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_SIDEBAR',
      'MARKETPLACE_BOTTOM',
      '1 week sidebar promotional highlight',
      'High conversion sidebar spotlight beside marketplace listings',
      'Direct link to website or promotion',
      'Full metrics and performance tracking',
    ],
    is_active: true,
    sort_order: 31,
  },
  {
    name: 'Marketplace Sidebar - 14 Days',
    type: 'ADVERTISEMENT' as const,
    price: '550.00',
    currency: 'ETB',
    duration_days: 14,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_SIDEBAR',
      'MARKETPLACE_BOTTOM',
      '2-week sidebar banner spotlight',
      'Consistent brand recall across desktop browsing',
      'Analytics & engagement tracking',
    ],
    is_active: true,
    sort_order: 32,
  },
  {
    name: 'Marketplace Sidebar - 30 Days',
    type: 'ADVERTISEMENT' as const,
    price: '1000.00',
    currency: 'ETB',
    duration_days: 30,
    billing_cycle: 'ONE_TIME' as const,
    features: [
      'MARKETPLACE_SIDEBAR',
      'MARKETPLACE_BOTTOM',
      'Full month sidebar spotlight banner',
      'Budget-friendly long term presence',
      'Detailed engagement reporting',
    ],
    is_active: true,
    sort_order: 33,
  },
]

export async function seedAdvertisementPlans() {
  console.log('🌱 Seeding advertisement plans...')
  for (const planData of AD_PLANS) {
    const existing = await Plan.findOne({
      where: {
        name: planData.name,
        type: 'ADVERTISEMENT',
      },
    })

    if (!existing) {
      await Plan.create(planData)
      console.log(`  ➕ Created ad plan: ${planData.name}`)
    } else {
      await existing.update(planData)
      console.log(`  🔄 Updated ad plan: ${planData.name}`)
    }
  }
  console.log('✅ Advertisement plans seeded successfully.')
}

if (require.main === module) {
  sequelize
    .authenticate()
    .then(() => seedAdvertisementPlans())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Failed to seed ad plans:', err)
      process.exit(1)
    })
}
