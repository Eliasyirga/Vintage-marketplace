import { sequelize } from '../config/database'
import { Plan } from '../models'

async function cleanDuplicatePlans() {
  try {
    console.log('--- Cleaning duplicate monetization plans ---')

    // Deactivate duplicate legacy plans
    await sequelize.query(`
      UPDATE monetization_plans 
      SET is_active = false 
      WHERE id IN ('39b95022-ceb3-4e8a-8fca-31e7b9627df6', '98551f46-485e-40be-9fa0-adce01a1f1df')
    `)

    // Ensure the 2 active paid plans have clear, comprehensive features
    await Plan.update(
      {
        name: 'Premium Seller',
        price: '499.00',
        features: [
          'Up to 50 Active Listings',
          'Verified Seller Badge',
          'Priority Marketplace Search',
          'Advanced Seller Analytics (Views, Likes & Inquiries)',
          '10% Promotion & Boost Discounts',
          'Priority Customer Support',
        ],
        sort_order: 1,
        is_active: true,
      },
      { where: { id: '6fb78e83-efe8-4806-a813-969efbaf6e00' } },
    )

    await Plan.update(
      {
        name: 'Business Storefront',
        price: '1499.00',
        features: [
          'Unlimited Active Listings',
          'Official Storefront Profile & Custom Branding',
          'Direct Phone Call & Location Button',
          'Full Verification & TIN/Business Badge',
          'Access to Advertising Campaigns',
          '20% Promotion & Boost Discounts',
          'Dedicated Account Manager',
        ],
        sort_order: 2,
        is_active: true,
      },
      { where: { id: '2113c5a7-7489-4e3b-9dc3-215ad68a096d' } },
    )

    console.log('Successfully set 3 clean account tiers (Free, Premium Seller, Business Storefront)!')
    process.exit(0)
  } catch (err) {
    console.error('Failed to clean duplicate plans:', err)
    process.exit(1)
  }
}

cleanDuplicatePlans()
