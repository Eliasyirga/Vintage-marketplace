import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { Op } from 'sequelize'
import { sequelize } from '../config/database'
import {
  User,
  Category,
  Listing,
  ListingImage,
  Order,
  Payment,
  Advertisement,
  Report,
  UserVerification,
  BusinessProfile,
  Plan,
} from '../models'

export async function seedSampleData() {
  console.log('🔄 Connecting to PostgreSQL database...')
  await sequelize.authenticate()
  console.log('✅ Connected successfully.')

  const passwordHash = await bcrypt.hash('Password123!', 10)

  // 1. Categories
  console.log('📦 Seeding Categories...')
  const categoriesData = [
    { name: 'Vintage Fashion', slug: 'vintage-fashion', description: 'Authentic retro & pre-loved Ethiopian clothing' },
    { name: 'Retro Electronics', slug: 'retro-electronics', description: 'Vintage audio, cameras, and analog tech' },
    { name: 'Ethiopian Antiques', slug: 'ethiopian-antiques', description: 'Traditional crafts, crosses, and cultural relics' },
    { name: 'Watches & Jewelry', slug: 'watches-jewelry', description: 'Classic timepieces and vintage jewelry' },
    { name: 'Home & Decor', slug: 'home-decor', description: 'Antique furniture, lamps, and retro artifacts' },
    { name: 'Collectibles', slug: 'collectibles', description: 'Rare coins, vinyl records, and books' },
  ]

  const categories: any[] = []
  for (const cat of categoriesData) {
    const [category] = await Category.findOrCreate({
      where: { slug: cat.slug },
      defaults: cat,
    })
    categories.push(category)
  }

  // 2. Users (Sellers & Buyers)
  console.log('👥 Seeding Users & Sellers...')
  const usersData = [
    {
      full_name: 'Abebe Kebede',
      email: 'abebe.kebede@vintageethiopia.com',
      phone: '+251911223344',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_fayda_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
    {
      full_name: 'Tigist Haile',
      email: 'tigist.haile@vintageethiopia.com',
      phone: '+251922334455',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_fayda_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
    {
      full_name: 'Solomon Tesfaye',
      email: 'solomon.tesfaye@vintageethiopia.com',
      phone: '+251933445566',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_fayda_verified: false,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    },
    {
      full_name: 'Meron Tadesse',
      email: 'meron.tadesse@vintageethiopia.com',
      phone: '+251944556677',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_fayda_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
  ]

  const users: any[] = []
  for (const u of usersData) {
    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: u.email }, { phone: u.phone }],
      },
    })
    if (!user) {
      user = await User.create(u as any)
    }
    users.push(user)
  }

  // 3. Business Profile
  console.log('🏢 Seeding Business Profile...')
  if (users[0]) {
    await BusinessProfile.findOrCreate({
      where: { user_id: users[0].id },
      defaults: {
        user_id: users[0].id,
        business_name: 'Addis Vintage Hub & Antiques',
        description: 'Certified Ethiopian antique store and curated retro collectibles in Bole.',
        business_phone: '+251911223344',
        business_email: 'store@addisvintage.et',
        address: 'Bole Road, Behind Edna Mall',
        city: 'Addis Ababa',
        business_category: 'Antiques & Vintage Artifacts',
        tin_number: 'TIN-00928371-ETH',
        registration_status: 'VERIFIED',
      },
    })
  }

  // 4. Sample Listings
  console.log('🏷️ Seeding Listings...')
  const listingsData = [
    {
      title: 'Handwoven Vintage Ethiopian Kemis Dress (1990s)',
      description: 'Authentic pure cotton traditional Tibeb dress with gold-thread embroidery. Pristine condition from Gondar.',
      price: '4500.00',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      seller_id: users[0].id,
      category_id: categories[0].id,
      city: 'Addis Ababa',
      sub_city: 'Bole',
      view_count: 342,
      favorite_count: 28,
      images: [
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', is_cover: true },
      ],
    },
    {
      title: 'Classic Vintage Casio Digital Gold Watch A168W',
      description: '1980s retro digital watch with electro-luminescence backlight, stainless steel gold-tone band.',
      price: '2800.00',
      condition: 'LIGHTLY_USED',
      status: 'ACTIVE',
      seller_id: users[1].id,
      category_id: categories[3].id,
      city: 'Addis Ababa',
      sub_city: 'Kazanchis',
      view_count: 512,
      favorite_count: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800', is_cover: true },
      ],
    },
    {
      title: 'Antique Ethiopian Silver Processional Cross',
      description: 'Handcrafted Lalibela-style solid silver filigree cross. Genuine heritage collectible dating back to early 20th century.',
      price: '18500.00',
      condition: 'FAIR',
      status: 'ACTIVE',
      seller_id: users[0].id,
      category_id: categories[2].id,
      city: 'Addis Ababa',
      sub_city: 'Piazza',
      view_count: 890,
      favorite_count: 92,
      images: [
        { url: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800', is_cover: true },
      ],
    },
    {
      title: 'Vintage Polaroid 600 Analog Instant Camera',
      description: 'Classic 1990s square-body instant film camera. Fully tested with built-in electronic flash.',
      price: '6200.00',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      seller_id: users[2].id,
      category_id: categories[1].id,
      city: 'Addis Ababa',
      sub_city: 'Sarbet',
      view_count: 275,
      favorite_count: 19,
      images: [
        { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', is_cover: true },
      ],
    },
    {
      title: 'Original Vinyl LP: Mahmoud Ahmed & Ibex Band (1975)',
      description: 'Rare first-pressing Ethio-jazz vinyl record produced by Kaifa Records. Gatefold cover intact.',
      price: '7500.00',
      condition: 'LIGHTLY_USED',
      status: 'ACTIVE',
      seller_id: users[3].id,
      category_id: categories[5].id,
      city: 'Addis Ababa',
      sub_city: 'Bole',
      view_count: 610,
      favorite_count: 64,
      images: [
        { url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', is_cover: true },
      ],
    },
    {
      title: 'Vintage Handcrafted Wooden Coffee Table Set',
      description: 'Solid Wanza wood traditional Ethiopian coffee ceremony table (Rekebot) with hand-carved motifs.',
      price: '9200.00',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      seller_id: users[0].id,
      category_id: categories[4].id,
      city: 'Addis Ababa',
      sub_city: 'Gerji',
      view_count: 420,
      favorite_count: 38,
      images: [
        { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800', is_cover: true },
      ],
    },
  ]

  const listings: any[] = []
  for (const item of listingsData) {
    const { images, ...listingData } = item
    const [listing] = await Listing.findOrCreate({
      where: { title: listingData.title },
      defaults: listingData as any,
    })
    listings.push(listing)

    if (images && images.length > 0) {
      for (const img of images) {
        await ListingImage.findOrCreate({
          where: { listing_id: listing.id, url: img.url },
          defaults: {
            listing_id: listing.id,
            url: img.url,
            is_cover: img.is_cover,
          },
        })
      }
    }
  }

  // 5. Orders & Payments
  console.log('💳 Seeding Orders & Chapa Payments...')
  if (listings.length >= 2) {
    // Order 1: Completed Delivery Order
    const [order1] = await Order.findOrCreate({
      where: { order_number: 'VM-ORD-2026-001' },
      defaults: {
        order_number: 'VM-ORD-2026-001',
        buyer_id: users[2].id,
        seller_id: users[0].id,
        listing_id: listings[0].id,
        item_price: '4500.00',
        delivery_fee: '200.00',
        platform_fee: '112.50',
        seller_amount: '4387.50',
        total_amount: '4700.00',
        currency: 'ETB',
        fulfillment_method: 'DELIVERY',
        payment_method: 'PLATFORM_PAYMENT',
        payment_status: 'SUCCESS',
        status: 'COMPLETED',
      },
    })

    await Payment.findOrCreate({
      where: { reference: 'CHAPA-TXN-83920194' },
      defaults: {
        user_id: users[2].id,
        order_id: order1.id,
        reference: 'CHAPA-TXN-83920194',
        provider: 'CHAPA',
        provider_reference: 'chapa_ref_83920194',
        amount: '4700.00',
        currency: 'ETB',
        purpose: 'ORDER_PURCHASE',
        status: 'SUCCESS',
        paid_at: new Date(),
      },
    })

    // Order 2: In-Person Meeting Order
    const [order2] = await Order.findOrCreate({
      where: { order_number: 'VM-ORD-2026-002' },
      defaults: {
        order_number: 'VM-ORD-2026-002',
        buyer_id: users[3].id,
        seller_id: users[1].id,
        listing_id: listings[1].id,
        item_price: '2800.00',
        delivery_fee: '0.00',
        platform_fee: '70.00',
        seller_amount: '2730.00',
        total_amount: '2800.00',
        currency: 'ETB',
        fulfillment_method: 'MEET_IN_PERSON',
        payment_method: 'PLATFORM_PAYMENT',
        payment_status: 'SUCCESS',
        status: 'CONFIRMED',
      },
    })

    await Payment.findOrCreate({
      where: { reference: 'CHAPA-TXN-91823019' },
      defaults: {
        user_id: users[3].id,
        order_id: order2.id,
        reference: 'CHAPA-TXN-91823019',
        provider: 'CHAPA',
        provider_reference: 'chapa_ref_91823019',
        amount: '2800.00',
        currency: 'ETB',
        purpose: 'ORDER_PURCHASE',
        status: 'SUCCESS',
        paid_at: new Date(),
      },
    })

    // Payment 3: Business Store Subscription
    await Payment.findOrCreate({
      where: { reference: 'CHAPA-SUB-77291044' },
      defaults: {
        user_id: users[0].id,
        reference: 'CHAPA-SUB-77291044',
        provider: 'CHAPA',
        provider_reference: 'chapa_ref_77291044',
        amount: '1500.00',
        currency: 'ETB',
        purpose: 'BUSINESS_SUBSCRIPTION',
        status: 'SUCCESS',
        paid_at: new Date(),
      },
    })
  }

  // 6. Sponsored Advertisements
  console.log('📢 Seeding Advertisements...')
  const [adPlan] = await Plan.findOrCreate({
    where: { name: 'Homepage Top Banner Weekly' },
    defaults: {
      name: 'Homepage Top Banner Weekly',
      type: 'ADVERTISEMENT',
      price: '2500.00',
      duration_days: 7,
      billing_cycle: 'ONE_TIME',
      features: ['Top Homepage Placement', 'Unlimited Click Impressions', 'Real-time CTR Telemetry'],
    },
  })

  await Advertisement.findOrCreate({
    where: { title: 'Bole Retro Fashion Festival 2026' },
    defaults: {
      advertiser_id: users[0].id,
      plan_id: adPlan.id,
      title: 'Bole Retro Fashion Festival 2026',
      description: 'Exclusive vintage exhibition and runway at Skylight Hotel Addis Ababa.',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
      target_url: 'https://vintage-marketplace-tau.vercel.app',
      placement: 'MARKETPLACE_BANNER',
      budget: '2500.00',
      status: 'ACTIVE',
      click_count: 142,
      impression_count: 3890,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // 7. National ID & Fayda Verifications
  console.log('🆔 Seeding Verifications...')
  await UserVerification.findOrCreate({
    where: { user_id: users[0].id },
    defaults: {
      user_id: users[0].id,
      verification_type: 'NATIONAL_ID',
      status: 'VERIFIED',
      document_reference: 'FAYDA-FIN-9928172635-ET',
      verified_at: new Date(),
    },
  })

  await UserVerification.findOrCreate({
    where: { user_id: users[2].id },
    defaults: {
      user_id: users[2].id,
      verification_type: 'NATIONAL_ID',
      status: 'PENDING',
      document_reference: 'ETH-KEBELE-ID-882910394',
    },
  })

  // 8. Safety Reports
  console.log('🚩 Seeding Safety Reports...')
  if (listings[3]) {
    await Report.findOrCreate({
      where: { target_id: listings[3].id },
      defaults: {
        reporter_id: users[1].id,
        target_type: 'LISTING',
        target_id: listings[3].id,
        reason: 'DUPLICATE_LISTING',
        description: 'User noticed this same vintage Polaroid camera photos on another marketplace.',
        status: 'PENDING',
        priority: 'MEDIUM',
      },
    })
  }

  console.log('\n======================================================')
  console.log('🎉 SAMPLE MARKETPLACE DATA POPULATED SUCCESSFULLY!')
  console.log('======================================================\n')
}

if (require.main === module) {
  seedSampleData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal seed error:', err)
      process.exit(1)
    })
}
