import Plan from '../models/Plan'

export async function seedPlans(): Promise<void> {
  const count = await Plan.count()
  if (count > 0) return

  const defaultPlans = [
    // ── Boost Plans ──────────────────────────────────────────────────────────
    {
      name: 'Boost 3 Days',
      type: 'BOOST' as const,
      price: '100.00',
      currency: 'ETB',
      duration_days: 3,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Higher search placement', '3x visibility in category feeds', '3-day duration'],
      is_active: true,
      sort_order: 1,
    },
    {
      name: 'Boost 7 Days',
      type: 'BOOST' as const,
      price: '180.00',
      currency: 'ETB',
      duration_days: 7,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Maximum search placement boost', '5x visibility', '7-day duration', 'Best value for quick sales'],
      is_active: true,
      sort_order: 2,
    },

    // ── Featured Plans ───────────────────────────────────────────────────────
    {
      name: 'Featured 3 Days',
      type: 'FEATURED' as const,
      price: '100.00',
      currency: 'ETB',
      duration_days: 3,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Featured Products section badge', 'Homepage showcase spotlight', '3-day duration'],
      is_active: true,
      sort_order: 3,
    },
    {
      name: 'Featured 7 Days',
      type: 'FEATURED' as const,
      price: '200.00',
      currency: 'ETB',
      duration_days: 7,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Prime homepage banner carousel badge', 'Category top banner position', '7-day duration', 'Featured badge'],
      is_active: true,
      sort_order: 4,
    },

    // ── Subscription Plans ───────────────────────────────────────────────────
    {
      name: 'Premium Seller',
      type: 'PREMIUM' as const,
      price: '350.00',
      currency: 'ETB',
      duration_days: 30,
      billing_cycle: 'MONTHLY' as const,
      features: [
        'Advanced Seller Analytics (Views, Favorites, Conversion rates)',
        '10% Discount on listing boosts and featured spots',
        'Verified Premium Seller badge',
        'Priority customer support',
        'Up to 50 active listings',
      ],
      is_active: true,
      sort_order: 5,
    },
    {
      name: 'Business Pro',
      type: 'BUSINESS' as const,
      price: '850.00',
      currency: 'ETB',
      duration_days: 30,
      billing_cycle: 'MONTHLY' as const,
      features: [
        'Full Verified Business Profile (Address, Phone, TIN, Brand Logo)',
        'Unlimited active product listings',
        'Advanced Business Analytics & Buyer Insights',
        'Access to Advertising Campaigns',
        '20% Promotion discounts',
        'Dedicated account manager',
      ],
      is_active: true,
      sort_order: 6,
    },

    // ── Verification Plan ────────────────────────────────────────────────────
    {
      name: 'Fast-Track Official Verification',
      type: 'VERIFICATION' as const,
      price: '250.00',
      currency: 'ETB',
      duration_days: 365,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Priority review queue within 24h', 'Official National ID / Fayda & Business document validation', 'Lifetime verified trust badge'],
      is_active: true,
      sort_order: 7,
    },

    // ── Advertisement Plans ──────────────────────────────────────────────────
    {
      name: 'Home Banner Ad (7 Days)',
      type: 'ADVERTISEMENT' as const,
      price: '500.00',
      currency: 'ETB',
      duration_days: 7,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Homepage hero placement banner', 'Direct link to your store or active listing', 'Click & impression tracking'],
      is_active: true,
      sort_order: 8,
    },
    {
      name: 'Marketplace Banner Ad (7 Days)',
      type: 'ADVERTISEMENT' as const,
      price: '350.00',
      currency: 'ETB',
      duration_days: 7,
      billing_cycle: 'ONE_TIME' as const,
      features: ['Browse and search header banner', 'Category-specific targeting', 'Real-time performance analytics'],
      is_active: true,
      sort_order: 9,
    },
  ]

  await Plan.bulkCreate(defaultPlans as any)
  console.log('✅ Default monetization plans seeded')
}
