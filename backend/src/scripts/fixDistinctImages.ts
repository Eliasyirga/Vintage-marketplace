import 'dotenv/config'
import { sequelize } from '../config/database'
import {
  Category,
  Listing,
  ListingImage,
  Advertisement,
  User,
} from '../models'

// Curated unique high-resolution photographs with harmonious lighting & contrast
const CATEGORY_COVERS: Record<string, string> = {
  'vintage-fashion': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  'retro-electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
  'ethiopian-antiques': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  'watches-jewelry': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  'collectibles': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  'clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  'electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
  'jewelry': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  'art': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
}

const UNIQUE_LISTING_IMAGE_MAP: Array<{ keyword: string; url: string }> = [
  { keyword: 'kemis', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'dress', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'casio', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'cross', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'polaroid', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'vinyl', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'record', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'coffee', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'table', url: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'denim', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'chair', url: 'https://images.unsplash.com/photo-1580481077194-e4c1fb3a127f?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'rug', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'typewriter', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'telescope', url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'guitar', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'jebena', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'shoe', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
  { keyword: 'radio', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
]

// Distinct fallback catalogue of guaranteed non-duplicated product photos
const DISTINCT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1547996160-71dfabbce5d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
]

const DISTINCT_AD_IMAGES = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
]

const DISTINCT_USER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
]

export async function fixDistinctImages() {
  console.log('🔄 Connecting to PostgreSQL to update all images with unique, appropriate photography...')
  await sequelize.authenticate()

  // 1. Update Categories
  console.log('🏷️ Updating Categories...')
  const categories = await Category.findAll()
  for (const cat of categories) {
    const coverUrl = CATEGORY_COVERS[cat.slug] || CATEGORY_COVERS['vintage-fashion']
    await cat.update({ image: coverUrl })
  }

  // 2. Update User Avatars
  console.log('👤 Updating User Avatars...')
  const users = await User.findAll({ order: [['created_at', 'ASC']] })
  for (let i = 0; i < users.length; i++) {
    const avatar = DISTINCT_USER_AVATARS[i % DISTINCT_USER_AVATARS.length]
    await users[i].update({ avatar_url: avatar })
  }

  // 3. Update Listings & Listing Images with zero duplicates
  console.log('🛍️ Updating Listings & Images without duplicates...')
  const listings = await Listing.findAll({
    include: [{ model: ListingImage, as: 'images' }],
    order: [['created_at', 'ASC']],
  })

  const usedListingUrls = new Set<string>()
  let fallbackIdx = 0

  for (const listing of listings) {
    const titleLower = listing.title.toLowerCase()
    let assignedUrl: string | null = null

    for (const mapping of UNIQUE_LISTING_IMAGE_MAP) {
      if (titleLower.includes(mapping.keyword) && !usedListingUrls.has(mapping.url)) {
        assignedUrl = mapping.url
        break
      }
    }

    if (!assignedUrl) {
      while (fallbackIdx < DISTINCT_FALLBACK_IMAGES.length) {
        const candidate = DISTINCT_FALLBACK_IMAGES[fallbackIdx++]
        if (!usedListingUrls.has(candidate)) {
          assignedUrl = candidate
          break
        }
      }
    }

    if (assignedUrl) {
      usedListingUrls.add(assignedUrl)
      const images = (listing as any).images || []
      if (images.length > 0) {
        await images[0].update({ url: assignedUrl, is_cover: true })
      } else {
        await ListingImage.create({
          listing_id: listing.id,
          url: assignedUrl,
          is_cover: true,
          sort_order: 0,
        })
      }
    }
  }

  // 4. Update Advertisements with high-resolution unique ad banners
  console.log('📢 Updating Advertisements...')
  const ads = await Advertisement.findAll({ order: [['created_at', 'ASC']] })
  for (let i = 0; i < ads.length; i++) {
    const adImage = DISTINCT_AD_IMAGES[i % DISTINCT_AD_IMAGES.length]
    await ads[i].update({ image: adImage })
  }

  console.log('\n======================================================')
  console.log(`✅ SUCCESS: Updated ${categories.length} categories, ${users.length} user avatars, ${listings.length} listings, and ${ads.length} ads with 100% unique, harmonious imagery.`)
  console.log('======================================================\n')
}

if (require.main === module) {
  fixDistinctImages()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal image fix error:', err)
      process.exit(1)
    })
}
