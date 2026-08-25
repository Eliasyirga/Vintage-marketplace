import bcrypt from 'bcryptjs'
import User from '../models/User'
import Category from '../models/Category'
import Listing from '../models/Listing'
import ListingImage from '../models/ListingImage'
import { sequelize } from '../config/database'

interface SeedProduct {
  title: string
  description: string
  price: string
  condition: 'BRAND_NEW' | 'LIKE_NEW' | 'LIGHTLY_USED' | 'FAIR' | 'HEAVILY_USED'
  categorySlug: string
  city: string
  subCity: string
  neighborhood: string
  images: Array<{ url: string; altText: string }>
}

const SAMPLE_PRODUCTS: SeedProduct[] = [
  {
    title: 'Samsung Galaxy S23 Ultra 512GB (Phantom Black)',
    description:
      'Lightly used Samsung Galaxy S23 Ultra, 512GB storage, 12GB RAM. Original box, S-Pen, and fast charger included. Battery health 98%. No scratches on front or back glass.',
    price: '78000.00',
    condition: 'LIGHTLY_USED',
    categorySlug: 'phones-tablets',
    city: 'Addis Ababa',
    subCity: 'Bole',
    neighborhood: 'Atlas',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        altText: 'Samsung Galaxy S23 Ultra Front',
      },
      {
        url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
        altText: 'Smartphone Display',
      },
    ],
  },
  {
    title: 'Apple MacBook Pro 14" M2 Pro (16GB RAM, 512GB SSD)',
    description:
      'Practically brand new MacBook Pro 14-inch Space Gray with M2 Pro chip. Battery cycle count: 24. Comes with original 67W USB-C power adapter and MagSafe 3 cable.',
    price: '125000.00',
    condition: 'LIKE_NEW',
    categorySlug: 'computers-accessories',
    city: 'Addis Ababa',
    subCity: 'Kirkos',
    neighborhood: 'Kazanchis',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        altText: 'MacBook Pro Desk Setup',
      },
      {
        url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
        altText: 'MacBook Pro Top View',
      },
    ],
  },
  {
    title: 'Sony PlayStation 5 Digital Edition + Extra Controller',
    description:
      'PS5 Digital Edition in excellent working condition. Comes with two DualSense wireless controllers (White & Cosmic Red) and HDMI 2.1 high-speed cable.',
    price: '48000.00',
    condition: 'LIGHTLY_USED',
    categorySlug: 'electronics',
    city: 'Addis Ababa',
    subCity: 'Nifas Silk-Lafto',
    neighborhood: 'Old Airport',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
        altText: 'Sony PlayStation 5 Console',
      },
    ],
  },
  {
    title: 'Modern L-Shaped Leather Sofa Set (Brown)',
    description:
      'High-quality genuine leather L-shaped sofa set. Very comfortable foam cushion, durable wooden frame. Ideal for modern living rooms in Addis Ababa.',
    price: '65000.00',
    condition: 'LIKE_NEW',
    categorySlug: 'furniture',
    city: 'Addis Ababa',
    subCity: 'Lideta',
    neighborhood: 'Sarbet',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        altText: 'Modern Leather Sofa',
      },
    ],
  },
  {
    title: 'LG Inverter Linear Refrigerator 350L (Stainless Steel)',
    description:
      'Energy-efficient LG double door refrigerator with smart inverter compressor. Low noise operation, fast cooling, spacious freezer compartment.',
    price: '55000.00',
    condition: 'LIGHTLY_USED',
    categorySlug: 'home-appliances',
    city: 'Addis Ababa',
    subCity: 'Akaky Kaliti',
    neighborhood: 'Gotera',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        altText: 'Stainless Steel Refrigerator',
      },
    ],
  },
  {
    title: 'Toyota Vitz 2012 Automatic (Silver, Clean)',
    description:
      'Toyota Vitz 2012 model, automatic transmission, 1.3L fuel-efficient engine. Well maintained service history. Original paint, clean interior.',
    price: '1850000.00',
    condition: 'FAIR',
    categorySlug: 'vehicles',
    city: 'Addis Ababa',
    subCity: 'Arada',
    neighborhood: 'Piassa',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        altText: 'Compact Hatchback Car',
      },
    ],
  },
  {
    title: 'Nike Air Force 1 Low 07 White (Size EU 42 / US 8.5)',
    description:
      'Brand new authentic Nike Air Force 1 Low in original Nike box. Never worn. Classic all-white colorway.',
    price: '6500.00',
    condition: 'BRAND_NEW',
    categorySlug: 'fashion-apparel',
    city: 'Addis Ababa',
    subCity: 'Yeka',
    neighborhood: 'Megenagna',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        altText: 'Nike Sneakers',
      },
    ],
  },
  {
    title: 'Canon EOS R6 Mark II Mirrorless Camera + 24-105mm Lens',
    description:
      'Professional full-frame mirrorless camera Canon EOS R6 Mark II with RF 24-105mm F4-7.1 IS STM kit lens. Shutter count under 3,000 shots.',
    price: '145000.00',
    condition: 'LIKE_NEW',
    categorySlug: 'electronics',
    city: 'Addis Ababa',
    subCity: 'Arada',
    neighborhood: '4 Kilo',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        altText: 'Canon Camera and Lens',
      },
    ],
  },
  {
    title: 'Bosch GSB 18V-55 Professional Cordless Impact Drill Kit',
    description:
      'Heavy-duty Bosch 18V brushless cordless drill driver set with 2x 4.0Ah Lithium-Ion batteries, quick charger, and L-BOXX carrying case.',
    price: '12500.00',
    condition: 'BRAND_NEW',
    categorySlug: 'tools-equipment',
    city: 'Addis Ababa',
    subCity: 'Addis Ketema',
    neighborhood: 'Merkato',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        altText: 'Power Drill Tools',
      },
    ],
  },
  {
    title: 'Motorized Electric Treadmill 3.0 HP with LCD Display',
    description:
      'High-performance home gym treadmill with 3.0 HP peak motor, automatic incline, shock absorption deck, and Bluetooth pulse monitor.',
    price: '38000.00',
    condition: 'LIGHTLY_USED',
    categorySlug: 'sports-fitness',
    city: 'Addis Ababa',
    subCity: 'Yeka',
    neighborhood: 'CMC',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576678927484-cc909957088c?auto=format&fit=crop&w=800&q=80',
        altText: 'Fitness Treadmill Equipment',
      },
    ],
  },
]

export async function seedListings(): Promise<void> {
  const existingCount = await Listing.count()
  if (existingCount > 0) return

  // Ensure demo seller user exists
  let seller = await User.findOne({ where: { email: 'demo.seller@vintagethiopia.com' } })

  if (!seller) {
    const passwordHash = await bcrypt.hash('Password123!', 10)
    seller = await User.create({
      full_name: 'Abebe Bikila',
      email: 'demo.seller@vintagethiopia.com',
      phone: '+251911223344',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_fayda_verified: true,
    })
  }

  const categories = await Category.findAll()
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]))

  await sequelize.transaction(async (transaction) => {
    for (const prod of SAMPLE_PRODUCTS) {
      const categoryId = categoryMap.get(prod.categorySlug) || categories[0]?.id
      if (!categoryId) continue

      const listing = await Listing.create(
        {
          seller_id: seller!.id,
          category_id: categoryId,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          condition: prod.condition,
          city: prod.city,
          sub_city: prod.subCity,
          neighborhood: prod.neighborhood,
          status: 'ACTIVE',
          view_count: Math.floor(Math.random() * 45) + 5,
          published_at: new Date(),
        },
        { transaction },
      )

      await ListingImage.bulkCreate(
        prod.images.map((img, idx) => ({
          listing_id: listing.id,
          url: img.url,
          public_id: `seed-image-${listing.id}-${idx}`,
          alt_text: img.altText,
          sort_order: idx,
        })),
        { transaction },
      )
    }
  })

  console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} Ethiopian products into database`)
}
