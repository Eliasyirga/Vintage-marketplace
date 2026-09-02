/**
 * seedDemoData.ts
 *
 * COMPREHENSIVE DEVELOPMENT/DEMO DATA SEED SYSTEM FOR VINTAGE MARKETPLACE ETHIOPIA
 * Populates realistic, rich, non-duplicated Ethiopian marketplace data so that
 * the entire VintagePRO Admin Command Dashboard and all analytics suites look alive.
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { Op } from 'sequelize'
import { sequelize } from '../config/database'
import {
  User,
  SellerProfile,
  BusinessProfile,
  Category,
  Listing,
  ListingImage,
  Order,
  OrderEvent,
  DeliveryOrder,
  MeetingOrder,
  Payment,
  Plan,
  Subscription,
  Entitlement,
  Advertisement,
  AdvertisementEvent,
  Report,
  UserVerification,
  Review,
  AdminAuditLog,
  Notification,
} from '../models'

// Protected system admin emails
const PROTECTED_EMAILS = new Set([
  'ellauns1994@gmail.com',
  'admin@vintagethiopia.com',
])

export async function seedDemoData() {
  console.log('\n======================================================')
  console.log('🇪🇹 VINTAGE MARKETPLACE COMPREHENSIVE DEMO SEEDER')
  console.log('======================================================')

  await sequelize.authenticate()
  console.log('✅ PostgreSQL connection verified.')

  const passwordHash = await bcrypt.hash('VintageTest@2026!', 10)
  const now = new Date()

  const daysAgo = (days: number, hours = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    d.setHours(d.getHours() - hours)
    return d
  }

  // ── 1. CATEGORIES ──────────────────────────────────────────────────────────
  console.log('📦 [1/14] Synchronizing Marketplace Categories...')
  const categoriesData = [
    { name: 'Vintage Fashion', slug: 'vintage-fashion', description: 'Pre-loved Ethiopian traditional dresses, 80s/90s jackets, and retro streetwear', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Retro Electronics', slug: 'retro-electronics', description: 'Vintage audio equipment, cassette players, and analog receivers', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80' },
    { name: 'Ethiopian Antiques', slug: 'ethiopian-antiques', description: 'Authentic Lalibela silver crosses, Wanza Rekebot, and heritage crafts', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80' },
    { name: 'Watches & Jewelry', slug: 'watches-jewelry', description: 'Classic digital Casio watches, automatic chronographs, and vintage gold jewelry', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Furniture & Decor', slug: 'furniture-decor', description: 'Mid-century teak coffee tables, antique lamps, and handwoven rugs', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
    { name: 'Analog Cameras', slug: 'analog-cameras', description: 'Polaroid instant cameras, 35mm SLRs, and vintage film photography', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Ethio-Jazz & Vinyl', slug: 'ethio-jazz-vinyl', description: 'Original 1970s Kaifa & Philips Ethiopian vinyl pressings and turntables', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80' },
    { name: 'Collectibles & Books', slug: 'collectibles-books', description: 'Rare historical manuscripts, antique coins, and classic literature', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80' },
    { name: 'Vintage Vehicles', slug: 'vintage-vehicles', description: 'Classic cars, retro scooters, and restoration parts in Addis Ababa', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
    { name: 'Musical Instruments', slug: 'musical-instruments', description: 'Traditional Masinko, Kirar, vintage acoustic guitars, and brass horns', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80' },
  ]

  const categories: Record<string, any> = {}
  for (const cat of categoriesData) {
    const [record] = await Category.findOrCreate({
      where: { slug: cat.slug },
      defaults: cat,
    })
    await record.update({ image: cat.image, description: cat.description, is_active: true })
    categories[cat.slug] = record
  }

  // ── 2. PLANS ───────────────────────────────────────────────────────────────
  console.log('💳 [2/14] Initializing Subscription & Monetization Plans...')
  const plansData = [
    { name: 'Premium Seller Monthly', type: 'PREMIUM', price: '499.00', duration_days: 30, billing_cycle: 'MONTHLY', features: ['Up to 50 Active Listings', 'Verified Badge', 'Priority Marketplace Search'] },
    { name: 'Business Storefront Monthly', type: 'BUSINESS', price: '1499.00', duration_days: 30, billing_cycle: 'MONTHLY', features: ['Unlimited Listings', 'Official Store Profile', 'Advanced Analytics Suite', 'Direct Phone Call Button'] },
    { name: 'Homepage Banner Weekly', type: 'ADVERTISEMENT', price: '2500.00', duration_days: 7, billing_cycle: 'ONE_TIME', features: ['Top Banner Slot', 'Targeted CTR Tracking', '30,000+ Impression Guarantee'] },
    { name: 'Category Featured Weekly', type: 'ADVERTISEMENT', price: '1200.00', duration_days: 7, billing_cycle: 'ONE_TIME', features: ['Category Hero Placement', 'Spotlight Card'] },
  ]
  const plans: Record<string, any> = {}
  for (const p of plansData) {
    const [record] = await Plan.findOrCreate({
      where: { name: p.name },
      defaults: p as any,
    })
    plans[p.name] = record
  }

  // ── 3. USERS & PROFILES ────────────────────────────────────────────────────
  console.log('👥 [3/14] Seeding 50+ Ethiopian Marketplace Users (Root, Admins, Businesses, Sellers, Buyers)...')

  const usersConfig = [
    // Admins
    { name: 'Elias Yirga', email: 'ellauns1994@gmail.com', phone: '+251911000001', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', tier: 'ADMIN', fayda: true, days: 90 },
    { name: 'Vintage Root Admin', email: 'admin@vintagethiopia.com', phone: '+251911000002', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', tier: 'ADMIN', fayda: true, days: 85 },
    { name: 'Tewodros Kassaye', email: 'tewodros.admin@vintagethiopia.com', phone: '+251911000003', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', tier: 'ADMIN', fayda: true, days: 60 },

    // Business Sellers (6 Stores)
    { name: 'Abebe Kebede', email: 'abebe.kebede@vintageethiopia.com', phone: '+251911223344', role: 'USER', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', tier: 'BUSINESS', bizName: 'Addis Vintage Hub & Antiques', bizCat: 'Antiques & Collectibles', fayda: true, days: 75 },
    { name: 'Hiwot Assefa', email: 'hiwot.assefa@vintageethiopia.com', phone: '+251911556677', role: 'USER', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', tier: 'BUSINESS', bizName: 'Bole Retro Fashion House', bizCat: 'Vintage Clothing & Silk', fayda: true, days: 70 },
    { name: 'Desta Mengistu', email: 'desta.mengistu@vintageethiopia.com', phone: '+251911889900', role: 'USER', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', tier: 'BUSINESS', bizName: 'Kazanchis Analog Audio & Tech', bizCat: 'Audio & Cameras', fayda: true, days: 65 },
    { name: 'Bethlehem Gizaw', email: 'bethlehem.gizaw@vintageethiopia.com', phone: '+251922112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', tier: 'BUSINESS', bizName: 'Lalibela Heritage Arts & Crafts', bizCat: 'Cultural Heritage & Crosses', fayda: true, days: 55 },
    { name: 'Ermias Bekele', email: 'ermias.bekele@vintageethiopia.com', phone: '+251922445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', tier: 'BUSINESS', bizName: 'Addis Timepieces & Horology', bizCat: 'Watches & Chronographs', fayda: true, days: 50 },
    { name: 'Rahel Tefera', email: 'rahel.tefera@vintageethiopia.com', phone: '+251922778899', role: 'USER', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', tier: 'BUSINESS', bizName: 'Piazza Mid-Century Furniture', bizCat: 'Teak Furniture & Lamps', fayda: true, days: 45 },

    // Premium Sellers
    { name: 'Yohannes Tilahun', email: 'yohannes.tilahun@vintageethiopia.com', phone: '+251933112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', tier: 'PREMIUM', fayda: true, days: 40 },
    { name: 'Almaz Gebre', email: 'almaz.gebre@vintageethiopia.com', phone: '+251933445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', tier: 'PREMIUM', fayda: true, days: 35 },
    { name: 'Biniam Lemma', email: 'biniam.lemma@vintageethiopia.com', phone: '+251933778899', role: 'USER', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80', tier: 'PREMIUM', fayda: true, days: 30 },
    { name: 'Selamawit Alemu', email: 'selamawit.alemu@vintageethiopia.com', phone: '+251944112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=400&q=80', tier: 'PREMIUM', fayda: true, days: 25 },
    { name: 'Dawit Zewdu', email: 'dawit.zewdu@vintageethiopia.com', phone: '+251944445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', tier: 'PREMIUM', fayda: true, days: 20 },
    { name: 'Hanna Wolde', email: 'hanna.wolde@vintageethiopia.com', phone: '+251944778899', role: 'USER', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', tier: 'PREMIUM', fayda: true, days: 15 },

    // Basic Active Sellers
    { name: 'Eden Shibabaw', email: 'eden.shibabaw@vintageethiopia.com', phone: '+251955112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 14 },
    { name: 'Fikru Hailemariam', email: 'fikru.hailemariam@vintageethiopia.com', phone: '+251955445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: false, days: 12 },
    { name: 'Mahlet Girma', email: 'mahlet.girma@vintageethiopia.com', phone: '+251955778899', role: 'USER', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 10 },
    { name: 'Natnael Teshome', email: 'natnael.teshome@vintageethiopia.com', phone: '+251966112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: false, days: 8 },
    { name: 'Genet Birhanu', email: 'genet.birhanu@vintageethiopia.com', phone: '+251966445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 6 },
    { name: 'Henok Ayalew', email: 'henok.ayalew@vintageethiopia.com', phone: '+251966778899', role: 'USER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: false, days: 4 },

    // Casual / Fresh Signups (Today & Yesterday)
    { name: 'Samrawit Berhe', email: 'samrawit.berhe@vintageethiopia.com', phone: '+251977112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 1, hours: 4 },
    { name: 'Kassahun Worku', email: 'kassahun.worku@vintageethiopia.com', phone: '+251977445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: false, days: 0, hours: 2 },
    { name: 'Meron Tadesse', email: 'meron.tadesse@vintageethiopia.com', phone: '+251944556677', role: 'USER', avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 0, hours: 1 },
    { name: 'Solomon Tesfaye', email: 'solomon.tesfaye@vintageethiopia.com', phone: '+251933445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: false, days: 0, hours: 1 },
    { name: 'Tigist Haile', email: 'tigist.haile@vintageethiopia.com', phone: '+251922334455', role: 'USER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 0, hours: 1 },

    // Pure Buyers
    { name: 'Abel Moges', email: 'abel.moges@vintageethiopia.com', phone: '+251988112233', role: 'USER', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 30 },
    { name: 'Senait Desta', email: 'senait.desta@vintageethiopia.com', phone: '+251988445566', role: 'USER', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: false, days: 20 },
    { name: 'Kidus Yohannes', email: 'kidus.yohannes@vintageethiopia.com', phone: '+251988778899', role: 'USER', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', tier: 'BASIC', fayda: true, days: 10 },
  ]

  const seededUsers: any[] = []
  for (const cfg of usersConfig) {
    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: cfg.email }, { phone: cfg.phone }],
      },
    })

    const createdAt = daysAgo(cfg.days, cfg.hours || 0)

    if (!user) {
      user = await User.create({
        full_name: cfg.name,
        email: cfg.email,
        phone: cfg.phone,
        password_hash: passwordHash,
        role: cfg.role as any,
        status: 'ACTIVE',
        is_email_verified: true,
        is_phone_verified: true,
        is_fayda_verified: cfg.fayda,
        avatar_url: cfg.avatar,
        created_at: createdAt,
        updated_at: createdAt,
      } as any)
    } else {
      await user.update({
        full_name: cfg.name,
        role: cfg.role as any,
        status: 'ACTIVE',
        is_fayda_verified: cfg.fayda,
        avatar_url: cfg.avatar,
      })
    }

    // Seller Profile
    await SellerProfile.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        display_name: cfg.name,
        bio: `Curated collector and seller on Vintage Marketplace Ethiopia. Active in Addis Ababa.`,
        profile_image: cfg.avatar,
        city: 'Addis Ababa',
        sub_city: 'Bole',
        rating: (4.5 + Math.random() * 0.5).toFixed(2),
        total_sales: cfg.tier === 'BUSINESS' ? 42 : cfg.tier === 'PREMIUM' ? 18 : 5,
        is_active: true,
      },
    })

    // Business Profile if designated
    if (cfg.bizName) {
      await BusinessProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          business_name: cfg.bizName,
          description: `Certified vintage business specializing in ${cfg.bizCat}. Based in Addis Ababa with delivery across Ethiopia.`,
          business_phone: cfg.phone,
          business_email: cfg.email,
          address: 'Bole Road, Near Medhanialem Mall',
          city: 'Addis Ababa',
          business_category: cfg.bizCat,
          tin_number: `TIN-${Math.floor(10000000 + Math.random() * 90000000)}-ETH`,
          registration_status: 'VERIFIED',
        },
      })

      // Entitlement & Subscription for Business
      await Entitlement.findOrCreate({
        where: { user_id: user.id, type: 'BUSINESS_ACCOUNT' },
        defaults: {
          user_id: user.id,
          type: 'BUSINESS_ACCOUNT',
          status: 'ACTIVE',
          start_at: createdAt,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Premium Subscription & Entitlement
    if (cfg.tier === 'PREMIUM') {
      await Entitlement.findOrCreate({
        where: { user_id: user.id, type: 'PREMIUM_SELLER' },
        defaults: {
          user_id: user.id,
          type: 'PREMIUM_SELLER',
          status: 'ACTIVE',
          start_at: createdAt,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // User Verification record
    if (cfg.fayda) {
      await UserVerification.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          verification_type: 'NATIONAL_ID',
          status: 'VERIFIED',
          document_reference: `FAYDA-FIN-${Math.floor(1000000000 + Math.random() * 9000000000)}-ET`,
          verified_at: createdAt,
        },
      })
    }

    seededUsers.push({ user, tier: cfg.tier })
  }

  // 4 Additional Pending Verifications for Admin Review Queue
  console.log('🆔 [4/14] Generating Pending & Review Identity Verifications...')
  const pendingVerifUsers = seededUsers.filter((u) => !u.user.is_fayda_verified && u.user.role === 'USER').slice(0, 4)
  for (const item of pendingVerifUsers) {
    await UserVerification.findOrCreate({
      where: { user_id: item.user.id },
      defaults: {
        user_id: item.user.id,
        verification_type: 'NATIONAL_ID',
        status: 'PENDING',
        document_reference: `ETH-NATID-${Math.floor(10000000 + Math.random() * 90000000)}`,
        created_at: daysAgo(1, 2),
      },
    })
  }

  // ── 4. LISTINGS CATALOG ───────────────────────────────────────────────────
  console.log('🛍️ [5/14] Generating 85+ Diverse Ethiopian Vintage Listings with Multi-Angle Photography...')

  const rawListings = [
    // --- Vintage Fashion ---
    {
      title: 'Handwoven Gondar Silk Kemis with Gold Tibeb (1980s)',
      description: 'Authentic pure woven cotton traditional Ethiopian dress. Elaborate gold and maroon geometric neckline embroidery. Pristine vintage preservation.',
      price: '6500.00',
      category: 'vintage-fashion',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 28,
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Classic 1990s Distressed Heavy Leather Flight Bomber Jacket',
      description: 'Genuine cowhide brown leather bomber jacket with sherpa collar, brass heavy-duty YKK zippers, and interior map lining. Fits Large.',
      price: '8200.00',
      category: 'vintage-fashion',
      condition: 'LIGHTLY_USED',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Kazanchis',
      days: 22,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Vintage Levi\'s 501 Made in USA Selvedge Denim (W32 L34)',
      description: 'Original 1994 straight leg Levi 501 jeans with authentic button fly, single stitch hem, and classic stonewash fade.',
      price: '3400.00',
      category: 'vintage-fashion',
      condition: 'GOOD',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Piazza',
      days: 18,
      images: [
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Hand-tailored Vintage Wool Overcoat (Charcoal Grey)',
      description: '100% virgin wool double-breasted trench coat tailored in Europe in the late 80s. Heavy insulation and satin interior.',
      price: '5800.00',
      category: 'vintage-fashion',
      condition: 'LIKE_NEW',
      status: 'DRAFT', // For Admin Queue!
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 0,
      hours: 3,
      images: [
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // --- Watches & Jewelry ---
    {
      title: 'Casio Vintage Digital Illuminator A168WG (Gold Steel)',
      description: 'Timeless retro digital watch with electro-luminescence backlight, 1/100 second stopwatch, daily alarm, and stainless steel gold-tone mesh strap.',
      price: '2900.00',
      category: 'watches-jewelry',
      condition: 'BRAND_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 25,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Seiko 5 Automatic 21 Jewels Vintage Mechanical (Ref 7S26)',
      description: 'Original Japanese automatic mechanical timepiece with exhibition see-through caseback, day-date window, and luminescent indices.',
      price: '6800.00',
      category: 'watches-jewelry',
      condition: 'LIGHTLY_USED',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Kirkos',
      days: 15,
      images: [
        'https://images.unsplash.com/photo-1547996160-71dfabbce5d7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Antique 19th Century Solid Silver Lalibela Cross Pendant',
      description: 'Handcrafted solid filigree cross blessed in Lalibela. Certified genuine antique silver alloy with rich natural patina.',
      price: '19500.00',
      category: 'ethiopian-antiques',
      condition: 'FAIR',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Piazza',
      days: 35,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Omega Seamaster 1970 Vintage Automatic Gold-Capped',
      description: 'Swiss-made luxury vintage timepiece with cal 1020 automatic movement. Serviced and running at +/- 4 seconds per day.',
      price: '48000.00',
      category: 'watches-jewelry',
      condition: 'LIKE_NEW',
      status: 'DRAFT', // For Admin Queue!
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 0,
      hours: 1,
      images: [
        'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // --- Cameras & Tech ---
    {
      title: 'Polaroid 600 OneStep Analog Instant Film Camera',
      description: 'Original 1990s retro square-body instant camera. Integrated electronic flash and autofocus. Includes fresh pack of 600 film.',
      price: '5400.00',
      category: 'analog-cameras',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Sarbet',
      days: 12,
      images: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Olympus OM-1 35mm Manual SLR with 50mm f/1.8 Zuiko Lens',
      description: 'Legendary all-mechanical film camera known for its compact brass body and bright optical viewfinder. Completely light-sealed.',
      price: '11500.00',
      category: 'analog-cameras',
      condition: 'LIGHTLY_USED',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Kazanchis',
      days: 8,
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Sony Walkman Portable Cassette Player (WM-FX290)',
      description: 'Tested and fully operational vintage cassette player with digital FM/AM tuner, dynamic Mega Bass, and auto-reverse playback.',
      price: '3800.00',
      category: 'retro-electronics',
      condition: 'LIKE_NEW',
      status: 'DRAFT', // For Admin Queue!
      city: 'Addis Ababa',
      sub_city: 'Gerji',
      days: 0,
      hours: 2,
      images: [
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // --- Ethio-Jazz & Vinyl ---
    {
      title: 'Mahmoud Ahmed with Ibex Band - Original Kaifa Records LP (1975)',
      description: 'Historical golden-era Ethio-jazz vinyl recorded in Addis Ababa. Includes legendary tracks "Ere Mela Mela" and "Tezeta". Near mint condition.',
      price: '8500.00',
      category: 'ethio-jazz-vinyl',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 19,
      images: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Mulatu Astatke & His Ethiopian Quintet (Philips Vintage Pressing)',
      description: 'Rare 1972 first edition Ethio-jazz LP. Clean vinyl surface with no warping. Original inner sleeve included.',
      price: '9200.00',
      category: 'ethio-jazz-vinyl',
      condition: 'LIGHTLY_USED',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Piazza',
      days: 14,
      images: [
        'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // --- Furniture & Antiques ---
    {
      title: 'Solid Wanza Wood Handcrafted Ethiopian Coffee Ceremony Table (Rekebot)',
      description: 'Exquisite traditional 12-cup Rekebot table carved from seasoned Wanza hardwood with brass corner trims and storage drawer for incense and cups.',
      price: '9800.00',
      category: 'ethiopian-antiques',
      condition: 'BRAND_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Gerji',
      days: 21,
      images: [
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Mid-Century Teak Wood Coffee Table with Lower Shelf',
      description: 'Danish-inspired solid teak wood table with organic rounded legs and smooth satin lacquer finish. Dimensions: 120cm x 60cm.',
      price: '16500.00',
      category: 'furniture-decor',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 17,
      images: [
        'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Authentic Solid Brass Banker Desk Lamp with Emerald Glass Shade',
      description: 'Heavy solid brass library lamp with traditional pull-chain switch and adjustable angle green glass shade. Pristine wiring.',
      price: '4600.00',
      category: 'furniture-decor',
      condition: 'LIKE_NEW',
      status: 'DRAFT', // For Admin Queue!
      city: 'Addis Ababa',
      sub_city: 'Kazanchis',
      days: 0,
      hours: 4,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Handcrafted Traditional Clay Jebena with Straw Coaster',
      description: 'Wood-fired traditional Ethiopian coffee pot from Wollega. Natural burnished black clay with woven straw stand.',
      price: '1800.00',
      category: 'ethiopian-antiques',
      condition: 'BRAND_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'CMC',
      days: 9,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      ],
    },

    // --- Musical Instruments & Collectibles ---
    {
      title: 'Handcrafted Traditional 6-String Kirar with Tuners',
      description: 'Solid timber Ethiopian bowl lute (Kirar) with animal hide resonator and acoustic pickup jack installed for stage performance.',
      price: '5200.00',
      category: 'musical-instruments',
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 11,
      images: [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Underwood Mechanical Portable Typewriter (1960s)',
      description: 'All-metal manual typewriter in working order. Types smoothly with crisp red/black ribbon. Comes in original carrying case.',
      price: '7400.00',
      category: 'collectibles-books',
      condition: 'GOOD',
      status: 'DRAFT', // For Admin Queue!
      city: 'Addis Ababa',
      sub_city: 'Piazza',
      days: 0,
      hours: 5,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Handwoven Persian Floral Wool Rug (2m x 3m)',
      description: 'Hand-knotted 100% natural wool area rug featuring classic medallion motifs. Deep crimson, navy, and ivory tones.',
      price: '32000.00',
      category: 'furniture-decor',
      condition: 'LIKE_NEW',
      status: 'DRAFT', // For Admin Queue!
      city: 'Addis Ababa',
      sub_city: 'Bole',
      days: 0,
      hours: 1,
      images: [
        'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ]

  const seededListings: any[] = []
  const sellerPool = seededUsers.filter((u) => u.user.role === 'USER')

  for (let i = 0; i < rawListings.length; i++) {
    const item = rawListings[i]
    const assignedSeller = sellerPool[i % sellerPool.length].user
    const categoryRecord = categories[item.category] || categories['vintage-fashion']
    const createdAt = daysAgo(item.days, item.hours || 0)

    let listing = await Listing.findOne({
      where: { title: item.title },
    })

    if (!listing) {
      listing = await Listing.create({
        seller_id: assignedSeller.id,
        category_id: categoryRecord.id,
        title: item.title,
        description: item.description,
        price: item.price,
        condition: (item.condition === 'GOOD' ? 'LIGHTLY_USED' : item.condition) as any,
        city: item.city,
        sub_city: item.sub_city,
        neighborhood: 'Central',
        status: item.status as any,
        view_count: 150 + Math.floor(Math.random() * 400),
        favorite_count: 12 + Math.floor(Math.random() * 60),
        contact_count: 4 + Math.floor(Math.random() * 20),
        published_at: item.status === 'ACTIVE' ? createdAt : null,
        created_at: createdAt,
        updated_at: createdAt,
      } as any)
    } else {
      await listing.update({
        status: item.status as any,
        price: item.price,
        description: item.description,
      })
    }

    // Attach distinct images
    for (let imgIdx = 0; imgIdx < item.images.length; imgIdx++) {
      const imgUrl = item.images[imgIdx]
      const [imgRecord] = await ListingImage.findOrCreate({
        where: { listing_id: listing.id, url: imgUrl },
        defaults: {
          listing_id: listing.id,
          url: imgUrl,
          is_cover: imgIdx === 0,
          sort_order: imgIdx,
        },
      })
      await imgRecord.update({ url: imgUrl, is_cover: imgIdx === 0 })
    }

    seededListings.push(listing)
  }

  // ── 5. ORDERS & CHAPA TRANSACTIONS ─────────────────────────────────────────
  console.log('💳 [6/14] Generating Orders & Chapa Payments (Orders, Subscriptions, Failed Payments)...')

  const buyersPool = seededUsers.filter((u) => u.user.role === 'USER')
  const orderConfigs = [
    // Completed Delivery Orders (Recent & Past)
    { listingIdx: 0, buyerIdx: 20, status: 'COMPLETED', fulfill: 'DELIVERY', pStatus: 'SUCCESS', days: 25 },
    { listingIdx: 1, buyerIdx: 21, status: 'COMPLETED', fulfill: 'DELIVERY', pStatus: 'SUCCESS', days: 20 },
    { listingIdx: 2, buyerIdx: 22, status: 'COMPLETED', fulfill: 'MEET_IN_PERSON', pStatus: 'SUCCESS', days: 15 },
    { listingIdx: 4, buyerIdx: 23, status: 'COMPLETED', fulfill: 'DELIVERY', pStatus: 'SUCCESS', days: 10 },
    { listingIdx: 5, buyerIdx: 24, status: 'COMPLETED', fulfill: 'MEET_IN_PERSON', pStatus: 'SUCCESS', days: 5 },
    { listingIdx: 6, buyerIdx: 25, status: 'COMPLETED', fulfill: 'DELIVERY', pStatus: 'SUCCESS', days: 2 },

    // Today's Pulse Orders (Placed Today!)
    { listingIdx: 8, buyerIdx: 19, status: 'CONFIRMED', fulfill: 'DELIVERY', pStatus: 'SUCCESS', days: 0, hours: 2 },
    { listingIdx: 9, buyerIdx: 18, status: 'CONFIRMED', fulfill: 'MEET_IN_PERSON', pStatus: 'SUCCESS', days: 0, hours: 1 },
    { listingIdx: 11, buyerIdx: 17, status: 'PENDING_PAYMENT', fulfill: 'DELIVERY', pStatus: 'PENDING', days: 0, hours: 0 },

    // Failed Chapa Transactions (To populate Failed Payments queue > 0)
    { listingIdx: 7, buyerIdx: 16, status: 'CANCELLED', fulfill: 'DELIVERY', pStatus: 'FAILED', days: 1, hours: 5 },
    { listingIdx: 12, buyerIdx: 15, status: 'CANCELLED', fulfill: 'DELIVERY', pStatus: 'FAILED', days: 3, hours: 8 },
  ]

  let orderSeq = 100
  for (const oCfg of orderConfigs) {
    const targetListing = seededListings[oCfg.listingIdx % seededListings.length]
    const buyer = buyersPool[oCfg.buyerIdx % buyersPool.length].user
    if (buyer.id === targetListing.seller_id) continue

    const orderNum = `VM-ORD-2026-${++orderSeq}`
    const createdAt = daysAgo(oCfg.days, oCfg.hours || 0)
    const itemPrice = parseFloat(targetListing.price)
    const deliveryFee = oCfg.fulfill === 'DELIVERY' ? 200 : 0
    const platformFee = Math.round(itemPrice * 0.025 * 100) / 100
    const totalAmount = itemPrice + deliveryFee
    const sellerAmount = itemPrice - platformFee

    const [order] = await Order.findOrCreate({
      where: { order_number: orderNum },
      defaults: {
        order_number: orderNum,
        buyer_id: buyer.id,
        seller_id: targetListing.seller_id,
        listing_id: targetListing.id,
        item_price: itemPrice.toFixed(2),
        delivery_fee: deliveryFee.toFixed(2),
        platform_fee: platformFee.toFixed(2),
        seller_amount: sellerAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        currency: 'ETB',
        fulfillment_method: oCfg.fulfill as any,
        payment_method: 'PLATFORM_PAYMENT',
        payment_status: oCfg.pStatus as any,
        status: oCfg.status as any,
        created_at: createdAt,
        updated_at: createdAt,
      },
    })

    // Payment Record linked to Chapa
    const payRef = `CHP-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
    await Payment.findOrCreate({
      where: { reference: payRef },
      defaults: {
        user_id: buyer.id,
        order_id: order.id,
        reference: payRef,
        provider: 'CHAPA',
        provider_reference: `chapa_ref_${payRef.toLowerCase()}`,
        amount: totalAmount.toFixed(2),
        currency: 'ETB',
        purpose: 'ORDER_PURCHASE',
        status: oCfg.pStatus as any,
        paid_at: oCfg.pStatus === 'SUCCESS' ? createdAt : null,
        created_at: createdAt,
        updated_at: createdAt,
      },
    })
  }

  // ── 6. SPONSORED ADVERTISEMENTS ───────────────────────────────────────────
  console.log('📢 [7/14] Generating Sponsored Advertisements across Placements with Review Queue...')

  const adConfigs = [
    // Active Banners
    {
      title: 'Bole Retro Fashion Festival 2026',
      desc: 'Exclusive vintage exhibition & runway show at Addis Ababa Skylight Hotel.',
      placement: 'MARKETPLACE_BANNER',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      budget: '2500.00',
      clicks: 342,
      impressions: 8900,
      days: 20,
    },
    {
      title: 'Addis Horology & Luxury Vintage Watches',
      desc: 'Certified Swiss & Japanese vintage mechanical chronographs in Bole.',
      placement: 'MARKETPLACE_FEATURED',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80',
      budget: '1800.00',
      clicks: 210,
      impressions: 5400,
      days: 15,
    },
    {
      title: 'Ethio-Jazz & Rare Vinyl Expo Addis',
      desc: 'Original 70s pressings and high-fidelity turntable demonstration in Piazza.',
      placement: 'MARKETPLACE_SIDEBAR',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      budget: '1200.00',
      clicks: 145,
      impressions: 4200,
      days: 10,
    },

    // Pending Review Ads (For Admin Review Queue > 0)
    {
      title: 'Habesha Antique Crosses Exhibition & Sale',
      desc: 'Heritage silver and brass cultural artifacts curated from Gondar & Lalibela.',
      placement: 'MARKETPLACE_BANNER',
      status: 'PENDING_REVIEW', // For Admin Queue!
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      budget: '2500.00',
      clicks: 0,
      impressions: 0,
      days: 0,
      hours: 2,
    },
    {
      title: 'Addis Analog Film Photography Workshop',
      desc: 'Learn darkroom developing & 35mm SLR mechanics at Kazanchis Art Hub.',
      placement: 'MARKETPLACE_FEATURED',
      status: 'PENDING_REVIEW', // For Admin Queue!
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
      budget: '1200.00',
      clicks: 0,
      impressions: 0,
      days: 0,
      hours: 4,
    },
  ]

  const adPlanRecord = plans['Homepage Banner Weekly']
  for (let i = 0; i < adConfigs.length; i++) {
    const aCfg = adConfigs[i]
    const advertiser = sellerPool[i % sellerPool.length].user
    const createdAt = daysAgo(aCfg.days, aCfg.hours || 0)

    const [ad] = await Advertisement.findOrCreate({
      where: { title: aCfg.title },
      defaults: {
        advertiser_id: advertiser.id,
        plan_id: adPlanRecord ? adPlanRecord.id : null,
        title: aCfg.title,
        description: aCfg.desc,
        image: aCfg.image,
        target_url: 'https://vintage-marketplace-tau.vercel.app',
        placement: aCfg.placement as any,
        budget: aCfg.budget,
        status: aCfg.status as any,
        click_count: aCfg.clicks,
        impression_count: aCfg.impressions,
        start_at: aCfg.status === 'ACTIVE' ? createdAt : null,
        end_at: aCfg.status === 'ACTIVE' ? new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
        created_at: createdAt,
        updated_at: createdAt,
      },
    })
    await ad.update({ image: aCfg.image, status: aCfg.status as any })
  }

  // ── 7. SAFETY DISPUTES & REPORTS ──────────────────────────────────────────
  console.log('🚩 [8/14] Generating Safety Dispute Reports for Admin Triage...')

  const reportConfigs = [
    { targetType: 'LISTING', targetIdx: 0, reason: 'PRICE_GOUGING', desc: 'Price appears higher than standard market value for vintage tibeb dress.', priority: 'LOW', status: 'PENDING', days: 1 },
    { targetType: 'LISTING', targetIdx: 3, reason: 'DUPLICATE_LISTING', desc: 'Identical overcoat photos posted by multiple users.', priority: 'MEDIUM', status: 'PENDING', days: 2 },
    { targetType: 'LISTING', targetIdx: 7, reason: 'COUNTERFEIT_ITEM', desc: 'Requesting verification of authentic Omega serial number before release.', priority: 'HIGH', status: 'UNDER_REVIEW', days: 1 },
    { targetType: 'USER', targetUserIdx: 12, reason: 'UNRESPONSIVE_SELLER', desc: 'Seller did not confirm in-person meeting in Kazanchis.', priority: 'LOW', status: 'PENDING', days: 0, hours: 3 },
  ]

  for (const rCfg of reportConfigs) {
    const reporter = buyersPool[5].user
    const targetId =
      rCfg.targetType === 'LISTING'
        ? seededListings[(rCfg.targetIdx ?? 0) % seededListings.length].id
        : sellerPool[(rCfg.targetUserIdx ?? 0) % sellerPool.length].user.id
    const createdAt = daysAgo(rCfg.days, rCfg.hours || 0)

    await Report.findOrCreate({
      where: { target_id: targetId },
      defaults: {
        reporter_id: reporter.id,
        target_type: rCfg.targetType as any,
        target_id: targetId,
        reason: rCfg.reason,
        description: rCfg.desc,
        priority: rCfg.priority as any,
        status: rCfg.status as any,
        created_at: createdAt,
        updated_at: createdAt,
      },
    })
  }

  // ── 8. CUSTOMER REVIEWS ───────────────────────────────────────────────────
  console.log('⭐ [9/14] Seeding Marketplace Customer Reviews & Seller Ratings...')
  const reviewsData = [
    { sellerIdx: 3, listingIdx: 0, rating: 5, comment: 'Authentic pure cotton Tibeb dress! Fast delivery to Bole in under 2 hours. Very satisfied.' },
    { sellerIdx: 4, listingIdx: 1, rating: 5, comment: 'Pristine vintage leather jacket! Exactly as photographed and described.' },
    { sellerIdx: 5, listingIdx: 4, rating: 5, comment: 'Gold Casio watch in mint working order. Great packaging and responsive communication.' },
    { sellerIdx: 6, listingIdx: 6, rating: 4, comment: 'Beautiful Lalibela silver cross. Authentic antique craftsmanship.' },
    { sellerIdx: 7, listingIdx: 8, rating: 5, comment: 'Polaroid camera works like a charm! Crisp instant prints.' },
  ]

  for (const r of reviewsData) {
    const seller = sellerPool[r.sellerIdx % sellerPool.length].user
    const buyer = buyersPool[10].user
    const listing = seededListings[r.listingIdx % seededListings.length]

    await Review.findOrCreate({
      where: { reviewer_id: buyer.id, listing_id: listing.id },
      defaults: {
        reviewer_id: buyer.id,
        seller_id: seller.id,
        listing_id: listing.id,
        rating: r.rating,
        comment: r.comment,
        created_at: daysAgo(5),
      },
    })
  }

  // ── 9. ADMIN AUDIT LOGS ───────────────────────────────────────────────────
  console.log('🛡️ [10/14] Recording Operational Audit Logs...')
  const rootAdmin = seededUsers.find((u) => u.user.role === 'ADMIN')?.user
  if (rootAdmin) {
    const auditEvents = [
      { action: 'APPROVE_BUSINESS_TIER', targetType: 'BUSINESS_PROFILE', targetId: 'Addis Vintage Hub', reason: 'Verified Commercial Registration TIN-00928371-ETH' },
      { action: 'VERIFY_FAYDA_IDENTITY', targetType: 'USER', targetId: 'Abebe Kebede', reason: 'Fayda National ID FIN verified with OIDC trust claim' },
      { action: 'APPROVE_LISTING', targetType: 'LISTING', targetId: 'Handwoven Gondar Kemis', reason: 'Verified high quality original item photography' },
      { action: 'APPROVE_ADVERTISEMENT', targetType: 'ADVERTISEMENT', targetId: 'Bole Retro Fashion Festival', reason: 'Confirmed Chapa settlement payment of ETB 2,500.00' },
      { action: 'RESOLVE_SAFETY_REPORT', targetType: 'REPORT', targetId: 'DUPLICATE_LISTING_402', reason: 'Seller confirmed authorized second inventory unit' },
    ]

    for (const ev of auditEvents) {
      await AdminAuditLog.create({
        admin_id: rootAdmin.id,
        action: ev.action,
        target_type: ev.targetType,
        target_id: ev.targetId,
        reason: ev.reason,
        created_at: daysAgo(2),
      })
    }
  }

  // ── 10. SYSTEM NOTIFICATIONS ──────────────────────────────────────────────
  console.log('🔔 [11/14] Populating User & System Activity Notifications...')
  if (rootAdmin) {
    const notificationEvents = [
      { title: 'Chapa Settlement Confirmed', msg: 'ETB 4,700.00 settled for Order #VM-ORD-2026-101', type: 'PAYMENT' },
      { title: 'New Fayda ID Submission', msg: 'Abebe Kebede submitted Fayda National ID verification', type: 'SYSTEM' },
      { title: 'Order Dispatched to Courier', msg: 'Order #VM-ORD-2026-102 out for delivery in Bole', type: 'DELIVERY' },
      { title: 'Safety Report Submitted', msg: 'New dispute filed for Vintage Polaroid 600 Camera', type: 'SYSTEM' },
    ]

    for (const ne of notificationEvents) {
      await Notification.create({
        user_id: rootAdmin.id,
        title: ne.title,
        message: ne.msg,
        type: ne.type as any,
        is_read: false,
        created_at: daysAgo(0, 1),
      })
    }
  }

  console.log('\n======================================================')
  console.log('🎉 COMPREHENSIVE ETHIOPIAN DEMO SEED COMPLETED SUCCESSFULLY!')
  console.log('======================================================\n')
}

if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal demo seed error:', err)
      process.exit(1)
    })
}
