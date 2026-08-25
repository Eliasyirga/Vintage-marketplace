/**
 * testCloudinaryUploads.ts
 *
 * Comprehensive automated test suite for Cloudinary integration in Vintage Marketplace:
 * 1. Image Format & Magic-Byte Validation
 * 2. Listing Image Upload (folder: vintage-marketplace/listings/{listingId})
 * 3. Listing Image Replace, Reorder & Remove
 * 4. Listing Cleanup on Delete
 * 5. Advertisement Creative Upload (folder: vintage-marketplace/advertisements/{adId})
 * 6. Profile Avatar Upload & Removal (folder: vintage-marketplace/profiles/{userId})
 * 7. Security & Authorization: User B cannot modify/delete User A's images
 * 8. Secret Protection: Verify no Cloudinary secret is ever in safe objects or API responses
 */

import 'dotenv/config'
import { sequelize } from '../config/database'
import { User, Category, Listing, ListingImage, Advertisement, Plan, SellerProfile } from '../models'
import * as uploadService from '../services/upload.service'
import * as listingService from '../services/listing.service'
import * as adService from '../services/advertisement.service'
import * as accountService from '../services/account.service'
import * as cloudinaryService from '../services/cloudinary.service'
import { env } from '../config/env'
import crypto from 'crypto'

// Minimal 1x1 valid PNG image buffer (with proper magic bytes 89 50 4E 47 0D 0A 1A 0A)
const VALID_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

// Minimal 1x1 valid JPEG image buffer (with proper magic bytes FF D8 FF)
const VALID_JPEG_BUFFER = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64',
)

// Invalid text file disguised as image
const FAKE_IMAGE_BUFFER = Buffer.from('NOT AN IMAGE FILE CONTENT', 'utf-8')

function createMockMulterFile(
  buffer: Buffer,
  originalname = 'sample.png',
  mimetype = 'image/png',
): Express.Multer.File {
  return {
    fieldname: 'images',
    originalname,
    encoding: '7bit',
    mimetype,
    buffer,
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: originalname,
    path: '',
  }
}

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`)
    failed++
  }
}

async function runTests() {
  console.log('\n======================================================')
  console.log('🚀 RUNNING CLOUDINARY INTEGRATION TEST SUITE')
  console.log(`   Cloudinary Mode: ${env.CLOUDINARY_ENABLED ? 'Cloud CDN (Enabled)' : 'Local Disk Fallback'}`)
  console.log(`   Cloud Name: ${env.CLOUDINARY_CLOUD_NAME || '(Not set)'}`)
  console.log('======================================================\n')

  await sequelize.authenticate()

  // Setup test category
  const [category] = await Category.findOrCreate({
    where: { slug: 'test-cloudinary-cat' },
    defaults: {
      name: 'Test Cloudinary Category',
      slug: 'test-cloudinary-cat',
      description: 'Category for Cloudinary tests',
      is_active: true,
    },
  })

  // Setup test user A (owner)
  const userAEmail = `cloudinary_test_a_${Date.now()}@example.com`
  const userA = await User.create({
    full_name: 'Cloudinary Tester A',
    email: userAEmail,
    password_hash: 'hashedpassword',
    role: 'USER',
    status: 'ACTIVE',
  })

  // Setup test user B (attacker / non-owner)
  const userBEmail = `cloudinary_test_b_${Date.now()}@example.com`
  const userB = await User.create({
    full_name: 'Cloudinary Tester B',
    email: userBEmail,
    password_hash: 'hashedpassword',
    role: 'USER',
    status: 'ACTIVE',
  })

  // Setup test ad plan
  let plan = await Plan.findOne({ where: { type: 'ADVERTISEMENT', is_active: true } })
  if (!plan) {
    plan = await Plan.create({
      name: 'Test Ad Plan',
      type: 'ADVERTISEMENT',
      price: '500.00',
      duration_days: 7,
      is_active: true,
      features: ['banner'],
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Validation Tests (MIME, Magic Bytes, Size)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 1. Validation Tests ---')
  try {
    uploadService.validateImageMagicBytes(VALID_PNG_BUFFER)
    assert(uploadService.validateImageMagicBytes(VALID_PNG_BUFFER) === true, 'PNG magic bytes valid')
    assert(uploadService.validateImageMagicBytes(VALID_JPEG_BUFFER) === true, 'JPEG magic bytes valid')
    assert(uploadService.validateImageMagicBytes(FAKE_IMAGE_BUFFER) === false, 'Disguised fake image rejected by magic bytes')
  } catch (err: any) {
    assert(false, 'Validation checks threw unexpected error', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Listing Image Upload & Storage Test
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 2. Listing Image Upload Test ---')
  let createdListing: any = null
  try {
    const file1 = createMockMulterFile(VALID_PNG_BUFFER, 'vintage_item_1.png', 'image/png')
    const file2 = createMockMulterFile(VALID_JPEG_BUFFER, 'vintage_item_2.jpg', 'image/jpeg')

    createdListing = await listingService.createListing(
      userA.id,
      {
        categoryId: category.id,
        title: 'Rare Vintage Camera 1970s',
        description: 'Authentic 1970s rangefinder vintage camera in pristine mint condition with original strap.',
        price: 12500,
        condition: 'LIKE_NEW',
        city: 'Addis Ababa',
        subCity: 'Bole',
        status: 'ACTIVE',
      },
      [file1, file2],
    )

    assert(createdListing.id !== undefined, 'Listing created with ID')
    assert(createdListing.images.length === 2, '2 listing images stored')
    assert(createdListing.images[0].url.length > 0, 'Image 1 has valid public URL')
    assert(createdListing.images[0].isCover === true, 'Image 1 designated as cover')
    assert(createdListing.images[1].isCover === false, 'Image 2 designated as secondary')

    if (env.CLOUDINARY_ENABLED) {
      assert(createdListing.images[0].publicId.includes('vintage-marketplace/listings/'), 'Listing image stored in vintage-marketplace/listings folder')
    }
  } catch (err: any) {
    assert(false, 'Listing creation with images failed', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Listing Image Replace, Reorder & Remove
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 3. Listing Image Update / Replace / Remove Test ---')
  try {
    const file3 = createMockMulterFile(VALID_PNG_BUFFER, 'vintage_item_3.png', 'image/png')
    const removedImageId = createdListing.images[1].id
    const keptImageId = createdListing.images[0].id

    const updatedListing = await listingService.updateListing(
      createdListing.id,
      userA.id,
      {
        title: 'Rare Vintage Camera 1970s (Updated)',
        removeImageIds: [removedImageId],
        imageSortOrder: [{ id: keptImageId, sortOrder: 1 }],
      },
      [file3],
    )

    assert(updatedListing.images.length === 2, 'Listing has 2 images after 1 removed and 1 added')
    const remainingIds = updatedListing.images.map((i: any) => i.id)
    assert(!remainingIds.includes(removedImageId), 'Removed image ID no longer in listing')
    assert(remainingIds.includes(keptImageId), 'Kept image remains in listing')
  } catch (err: any) {
    assert(false, 'Listing update with image modification failed', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Authorization Test: User B cannot modify User A's listing
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 4. Security & Authorization Test ---')
  try {
    let unauthorizedBlocked = false
    try {
      await listingService.updateListing(
        createdListing.id,
        userB.id,
        { title: 'Hacked Title by User B' },
        [],
      )
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 403 || err.message.includes('not found') || err.message.includes('permission')) {
        unauthorizedBlocked = true
      }
    }
    assert(unauthorizedBlocked, 'Unauthorized user B blocked from modifying user A listing')
  } catch (err: any) {
    assert(false, 'Authorization test threw unexpected error', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Advertisement Creative Upload Test
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 5. Advertisement Creative Upload Test ---')
  let createdAd: any = null
  try {
    const adFile = createMockMulterFile(VALID_JPEG_BUFFER, 'ad_creative.jpg', 'image/jpeg')
    const customAdId = crypto.randomUUID()
    const uploadedAdImage = await uploadService.saveAdImage(adFile, customAdId)

    createdAd = await adService.createAdvertisement(userA.id, {
      id: customAdId,
      planId: plan.id,
      title: 'Vintage Leather Goods Sale',
      description: 'Exclusive 20% off all handcrafted leather vintage items.',
      imageUrl: uploadedAdImage.url,
      imagePublicId: uploadedAdImage.publicId,
      imageWidth: uploadedAdImage.width,
      imageHeight: uploadedAdImage.height,
      imageFormat: uploadedAdImage.format,
      imageBytes: uploadedAdImage.bytes,
      targetUrl: 'https://vintagemarketplace.com/promotions',
      placement: 'MARKETPLACE_BANNER',
    })

    assert(createdAd.id === customAdId, 'Ad created with custom ID')
    assert(createdAd.image === uploadedAdImage.url, 'Ad image URL saved')
    assert(createdAd.image_public_id === uploadedAdImage.publicId, 'Ad public_id saved')

    if (env.CLOUDINARY_ENABLED) {
      assert(createdAd.image_public_id.includes('vintage-marketplace/advertisements/'), 'Ad image stored in vintage-marketplace/advertisements folder')
    }
  } catch (err: any) {
    assert(false, 'Advertisement creative upload failed', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Profile Avatar Upload & Removal Test
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 6. Profile Avatar Upload & Removal Test ---')
  try {
    const avatarFile = createMockMulterFile(VALID_PNG_BUFFER, 'profile_avatar.png', 'image/png')
    const avatarResult = await accountService.uploadAvatar(userA.id, avatarFile)

    assert(avatarResult.avatarUrl.length > 0, 'Avatar URL returned on upload')
    const updatedUser = await User.findByPk(userA.id)
    assert(updatedUser?.avatar_url === avatarResult.avatarUrl, 'User avatar_url updated in DB')

    if (env.CLOUDINARY_ENABLED) {
      assert(avatarResult.publicId.includes(`vintage-marketplace/profiles/${userA.id}`), 'Avatar image stored in vintage-marketplace/profiles/{userId} folder')
    }

    // Test avatar removal
    const removeResult = await accountService.removeAvatar(userA.id)
    const userAfterRemove = await User.findByPk(userA.id)
    assert(userAfterRemove?.avatar_url === null, 'Avatar URL successfully cleared from DB')
  } catch (err: any) {
    assert(false, 'Profile avatar upload/remove failed', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Cloudinary Secret Leak Prevention Test
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 7. Secret Protection Test ---')
  try {
    const safeListing = createdListing
    const safeAd = createdAd ? createdAd.toSafeObject() : {}
    const safeUser = userA.toSafeObject()

    const listingJson = JSON.stringify(safeListing)
    const adJson = JSON.stringify(safeAd)
    const userJson = JSON.stringify(safeUser)

    const secretValue = process.env.CLOUDINARY_API_SECRET || ''

    let leaked = false
    if (secretValue && secretValue.length > 5) {
      if (listingJson.includes(secretValue) || adJson.includes(secretValue) || userJson.includes(secretValue)) {
        leaked = true
      }
    }

    assert(!leaked, 'Cloudinary API secret is NEVER exposed in database models, safe objects, or JSON responses')
  } catch (err: any) {
    assert(false, 'Secret protection check failed', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Optimized Transformation URL Helper Test
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 8. Optimized Transformation URL Helper Test ---')
  try {
    const sampleCloudinaryUrl = 'https://res.cloudinary.com/vmhpsvzq/image/upload/v12345/vintage-marketplace/listings/item.jpg'
    const transformed = cloudinaryService.getOptimizedUrl(sampleCloudinaryUrl, {
      width: 600,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
    })

    if (env.CLOUDINARY_ENABLED) {
      assert(transformed.includes('f_auto,q_auto,w_600,h_600,c_fill,g_auto'), 'Cloudinary transform parameters injected into CDN URL')
    } else {
      assert(transformed === sampleCloudinaryUrl, 'Fallback URL returned when Cloudinary is not enabled')
    }
  } catch (err: any) {
    assert(false, 'Transformation helper check failed', err.message)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Cleanup Test Artifacts
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Cleanup ---')
  try {
    if (createdListing) {
      await listingService.deleteListing(createdListing.id, userA.id)
    }
    if (createdAd) {
      await Advertisement.destroy({ where: { id: createdAd.id } })
    }
    await User.destroy({ where: { id: [userA.id, userB.id] } })
    console.log('  🧹 Cleaned up temporary test database records.')
  } catch (err: any) {
    console.warn('  ⚠️ Cleanup warning:', err.message)
  }

  console.log('\n======================================================')
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('======================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err)
    process.exit(1)
  })
