/**
 * seedDevAdvertisements.ts
 *
 * DEVELOPMENT ONLY — seeds active test advertisements with real Cloudinary images.
 * Run: npm run seed:dev-ads (from backend/)
 *
 * Creates 3 ads per placement (MARKETPLACE_BANNER, MARKETPLACE_FEATURED, MARKETPLACE_SIDEBAR)
 * with different sellers, titles, CTAs, and Cloudinary folder:
 *   vintage-marketplace/advertisements/{advertisementId}
 *
 * Skips seeding in production. Requires Cloudinary credentials or uses local fallback.
 */

import 'dotenv/config'
import crypto from 'crypto'
import { sequelize } from '../config/database'
import { User, Advertisement, Listing, Plan } from '../models'
import * as uploadService from '../services/upload.service'
import { env } from '../config/env'

const VALID_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function mockFile(buffer: Buffer, name: string): Express.Multer.File {
  return {
    fieldname: 'image',
    originalname: name,
    encoding: '7bit',
    mimetype: 'image/png',
    buffer,
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: name,
    path: '',
  }
}

interface DevAdSpec {
  title: string
  description: string
  placement: 'MARKETPLACE_BANNER' | 'MARKETPLACE_FEATURED' | 'MARKETPLACE_SIDEBAR'
  priority: number
  targetPath: string
  sellerSuffix: string
}

const DEV_ADS: DevAdSpec[] = [
  // MARKETPLACE_BANNER (Homepage Hero)
  {
    title: 'Samsung Galaxy S23 Ultra 512GB',
    description: 'Excellent condition • 256GB • Verified seller in Bole',
    placement: 'MARKETPLACE_BANNER',
    priority: 30,
    targetPath: '/marketplace?search=Samsung',
    sellerSuffix: 'samsung',
  },
  {
    title: 'Dell Latitude 7420 Business Laptop',
    description: 'Lightweight • 16GB RAM • Perfect for professionals',
    placement: 'MARKETPLACE_BANNER',
    priority: 20,
    targetPath: '/marketplace?search=Dell',
    sellerSuffix: 'dell',
  },
  {
    title: 'Vintage Leather Jacket — Premium Quality',
    description: 'Handcrafted • Size L • Timeless style for every season',
    placement: 'MARKETPLACE_BANNER',
    priority: 10,
    targetPath: '/marketplace?search=leather',
    sellerSuffix: 'fashion',
  },
  // MARKETPLACE_FEATURED (In-feed)
  {
    title: 'Sony PlayStation 5 + Extra Controller',
    description: 'Electronics • Like new • Fast delivery in Addis Ababa',
    placement: 'MARKETPLACE_FEATURED',
    priority: 30,
    targetPath: '/marketplace?search=PlayStation',
    sellerSuffix: 'ps5',
  },
  {
    title: 'Modern L-Shaped Leather Sofa',
    description: 'Furniture • Genuine leather • Free viewing in Sarbet',
    placement: 'MARKETPLACE_FEATURED',
    priority: 20,
    targetPath: '/marketplace?search=sofa',
    sellerSuffix: 'furniture',
  },
  {
    title: 'LG Inverter Refrigerator 350L',
    description: 'Home Appliances • Energy efficient • 1-year warranty',
    placement: 'MARKETPLACE_FEATURED',
    priority: 10,
    targetPath: '/marketplace?search=LG',
    sellerSuffix: 'appliances',
  },
  // MARKETPLACE_SIDEBAR
  {
    title: 'MacBook Pro 14" M2 Pro',
    description: 'Electronics • 512GB SSD • Battery health 98%',
    placement: 'MARKETPLACE_SIDEBAR',
    priority: 30,
    targetPath: '/marketplace?search=MacBook',
    sellerSuffix: 'mac',
  },
  {
    title: 'Designer Handbag Collection',
    description: 'Fashion • Authentic • Limited time offer',
    placement: 'MARKETPLACE_SIDEBAR',
    priority: 20,
    targetPath: '/marketplace?search=handbag',
    sellerSuffix: 'bags',
  },
  {
    title: 'Solid Wood Dining Table Set',
    description: 'Furniture • Seats 6 • Hand-finished oak',
    placement: 'MARKETPLACE_SIDEBAR',
    priority: 10,
    targetPath: '/marketplace?search=dining',
    sellerSuffix: 'wood',
  },
]

async function findOrCreateSeller(suffix: string): Promise<User> {
  const email = `dev-ad-seller-${suffix}@vintage-marketplace.local`
  let user = await User.findOne({ where: { email } })
  if (!user) {
    user = await User.create({
      full_name: `Dev Ad Seller (${suffix})`,
      email,
      password_hash: 'dev-seed-no-login',
      role: 'USER',
      status: 'ACTIVE',
    })
  }
  return user
}

async function resolveListingTarget(path: string): Promise<string> {
  const listing = await Listing.findOne({
    where: { status: 'ACTIVE' },
    order: [['created_at', 'DESC']],
  })
  if (listing && path.includes('Samsung')) {
    return `/listings/${listing.id}`
  }
  const base = env.CLIENT_URL || 'http://localhost:5173'
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export async function seedDevAdvertisements(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    console.log('⏭️  Skipping dev advertisement seed in production.')
    return
  }

  console.log('\n🎯 Seeding development test advertisements...')
  console.log(`   Cloudinary: ${env.CLOUDINARY_ENABLED ? 'enabled' : 'local fallback'}`)

  await sequelize.authenticate()

  let plan = await Plan.findOne({ where: { type: 'ADVERTISEMENT', is_active: true } })
  if (!plan) {
    plan = await Plan.create({
      name: 'Dev Ad Plan',
      type: 'ADVERTISEMENT',
      price: '500.00',
      currency: 'ETB',
      duration_days: 30,
      billing_cycle: 'ONE_TIME',
      is_active: true,
      features: ['MARKETPLACE_BANNER', 'MARKETPLACE_FEATURED', 'MARKETPLACE_SIDEBAR'],
      sort_order: 0,
    })
  }

  const now = new Date()
  const startAt = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const endAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  let created = 0
  let skipped = 0

  for (const spec of DEV_ADS) {
    const existing = await Advertisement.findOne({
      where: { title: spec.title, placement: spec.placement },
    })
    if (existing?.status === 'ACTIVE') {
      console.log(`   ↩ Skipped (exists): ${spec.title}`)
      skipped++
      continue
    }

    const seller = await findOrCreateSeller(spec.sellerSuffix)
    const adId = crypto.randomUUID()
    const targetUrl = await resolveListingTarget(spec.targetPath)

    const uploaded = await uploadService.saveAdImage(
      mockFile(VALID_PNG, `${spec.sellerSuffix}-ad.png`),
      adId,
    )

    const folderOk = uploaded.publicId.includes(`advertisements/${adId}`) ||
      uploaded.publicId.includes('advertisements')

    await Advertisement.create({
      id: adId,
      advertiser_id: seller.id,
      plan_id: plan.id,
      title: spec.title,
      description: spec.description,
      image: uploaded.url,
      image_public_id: uploaded.publicId,
      image_width: uploaded.width ?? null,
      image_height: uploaded.height ?? null,
      image_format: uploaded.format ?? 'png',
      image_bytes: uploaded.bytes ?? null,
      target_url: targetUrl,
      placement: spec.placement,
      budget: plan.price,
      status: 'ACTIVE',
      start_at: startAt,
      end_at: endAt,
      priority: spec.priority,
      click_count: 0,
      impression_count: 0,
    })

    console.log(`   ✅ ${spec.placement}: ${spec.title}`)
    console.log(`      image: ${uploaded.url}`)
    console.log(`      public_id: ${uploaded.publicId}${folderOk ? ' ✓' : ' (check folder)'}`)
    created++
  }

  console.log(`\n✨ Done — ${created} created, ${skipped} skipped.\n`)
}

if (require.main === module) {
  seedDevAdvertisements()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Dev ad seed failed:', err)
      process.exit(1)
    })
}
