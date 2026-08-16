import Category from '../models/Category'

const SEED_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'TVs, audio equipment, cameras, and general electronics',
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Sofas, beds, tables, chairs, and office furniture',
  },
  {
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Fridges, washing machines, kitchenware, and home decor',
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    description: 'Cars, motorbikes, bicycles, and auto parts',
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    description: 'Clothing, shoes, watches, bags, and accessories',
  },
  {
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    description: 'Smartphones, tablets, and mobile accessories',
  },
  {
    name: 'Computers & Accessories',
    slug: 'computers-accessories',
    description: 'Laptops, desktops, monitors, and computer peripherals',
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Textbooks, novels, educational materials, and kids books',
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Fitness equipment, sportswear, and outdoor gear',
  },
  {
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Power tools, hand tools, machinery, and hardware',
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Musical instruments, collectibles, toys, and miscellaneous items',
  },
]

export async function seedCategories(): Promise<void> {
  const count = await Category.count()
  if (count > 0) return

  await Category.bulkCreate(SEED_CATEGORIES)
  console.log(`✅ Seeded ${SEED_CATEGORIES.length} categories`)
}
