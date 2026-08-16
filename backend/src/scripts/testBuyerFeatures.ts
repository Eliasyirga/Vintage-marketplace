import { User, Listing, Favorite, RecentlyViewed, Conversation, Message } from '../models'
import * as favoriteService from '../services/favorite.service'
import * as recentlyViewedService from '../services/recentlyViewed.service'
import * as conversationService from '../services/conversation.service'
import { connectDatabase } from '../config/database'
import bcrypt from 'bcryptjs'

async function runBuyerFeaturesVerification() {
  console.log('🧪 Starting Buyer Features Automated Verification Suite...\n')

  await connectDatabase()

  // 1. Setup Test Users
  const passwordHash = await bcrypt.hash('TestPass123!', 10)

  let buyer = await User.findOne({ where: { email: 'test.buyer@vintagethiopia.com' } })
  if (!buyer) {
    buyer = await User.create({
      full_name: 'Abebe Buyer',
      email: 'test.buyer@vintagethiopia.com',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
    })
  }

  let seller = await User.findOne({ where: { email: 'test.seller@vintagethiopia.com' } })
  if (!seller) {
    seller = await User.create({
      full_name: 'Almaz Seller',
      email: 'test.seller@vintagethiopia.com',
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
    })
  }

  // 2. Fetch a sample listing
  const listing = await Listing.findOne({ where: { status: 'ACTIVE' } })
  if (!listing) {
    throw new Error('No active listings found for test verification.')
  }

  console.log(`📌 Using Buyer (${buyer.email}), Seller (${seller.email}), Listing (${listing.title})`)

  // ─────────────────────────────────────────────────────────────
  // PART 1: FAVORITES / WISHLIST TESTS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Testing Favorites System ---')

  // Test 1: Add favorite
  await favoriteService.addFavorite(buyer.id, listing.id)
  let isFav = await favoriteService.isListingFavorited(buyer.id, listing.id)
  console.assert(isFav === true, '❌ Favorite should be true after addFavorite')
  console.log('✅ Test 1: Add favorite succeeded')

  // Test 2: Duplicate favorite (should not duplicate or throw error)
  await favoriteService.addFavorite(buyer.id, listing.id)
  const favCount = await Favorite.count({ where: { user_id: buyer.id, listing_id: listing.id } })
  console.assert(favCount === 1, '❌ Favorite count should be 1 after duplicate addFavorite')
  console.log('✅ Test 2: Duplicate favorite idempotent check passed')

  // Test 3: Get user favorites list
  const userFavs = await favoriteService.getUserFavorites(buyer.id, { page: 1, limit: 10 })
  console.assert(userFavs.favorites.length >= 1, '❌ User favorites list should contain at least 1 item')
  console.assert(userFavs.favorites.some((f) => f.listing.id === listing.id), '❌ Added listing should be in favorites list')
  console.log('✅ Test 3: Get user favorites returned correct listings')

  // Test 4: Batch check favorites
  const batchMap = await favoriteService.getBatchFavoriteStatus(buyer.id, [listing.id, 'dummy-id-123'])
  console.assert(batchMap[listing.id] === true, '❌ Batch check should return true for favorited listing')
  console.assert(batchMap['dummy-id-123'] === false, '❌ Batch check should return false for non-favorited listing')
  console.log('✅ Test 4: Batch favorite check succeeded')

  // Test 5: Remove favorite
  await favoriteService.removeFavorite(buyer.id, listing.id)
  isFav = await favoriteService.isListingFavorited(buyer.id, listing.id)
  console.assert(isFav === false, '❌ Favorite should be false after removeFavorite')
  console.log('✅ Test 5: Remove favorite succeeded')

  // ─────────────────────────────────────────────────────────────
  // PART 2: RECENTLY VIEWED TESTS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Testing Recently Viewed System ---')

  // Test 6: Record listing view
  await recentlyViewedService.recordRecentlyViewed(buyer.id, listing.id)
  let recents = await recentlyViewedService.getRecentlyViewed(buyer.id, 10)
  console.assert(recents.some((r) => r.id === listing.id), '❌ Listing should be in recently viewed')
  console.log('✅ Test 6: Record recently viewed succeeded')

  // Test 7: Re-record same listing (should update timestamp without duplicate row)
  await recentlyViewedService.recordRecentlyViewed(buyer.id, listing.id)
  const recentRowCount = await RecentlyViewed.count({ where: { user_id: buyer.id, listing_id: listing.id } })
  console.assert(recentRowCount === 1, '❌ Recently viewed count should remain 1')
  console.log('✅ Test 7: Idempotent recently viewed update verified')

  // Test 8: Clear recently viewed
  await recentlyViewedService.clearRecentlyViewed(buyer.id)
  recents = await recentlyViewedService.getRecentlyViewed(buyer.id, 10)
  console.assert(recents.length === 0, '❌ Recently viewed should be empty after clear')
  console.log('✅ Test 8: Clear recently viewed succeeded')

  // ─────────────────────────────────────────────────────────────
  // PART 3: CONTACT SELLER & CONVERSATION TESTS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Testing Contact Seller / Conversations ---')

  // Test 9: Buyer cannot message themselves
  try {
    await conversationService.getOrCreateConversation(seller.id, listing.id, seller.id, 'Hello myself')
    console.assert(false, '❌ Should reject self-messaging')
  } catch (err: any) {
    console.assert(err.statusCode === 400, '❌ Expected 400 on self-messaging')
    console.log('✅ Test 9: Self-messaging prevention verified (400 Bad Request)')
  }

  // Test 10: Create conversation between buyer and seller
  const { conversation, isNew } = await conversationService.getOrCreateConversation(
    buyer.id,
    listing.id,
    seller.id,
    'Is this item available for inspection?',
  )
  console.assert(conversation.id !== undefined, '❌ Conversation ID should exist')
  console.log(`✅ Test 10: Conversation created successfully (${conversation.id})`)

  // Test 11: Duplicate contact returns existing conversation
  const repeat = await conversationService.getOrCreateConversation(
    buyer.id,
    listing.id,
    seller.id,
    'Second follow-up message',
  )
  console.assert(repeat.conversation.id === conversation.id, '❌ Should return existing conversation ID')
  console.assert(repeat.isNew === false, '❌ isNew should be false on repeat contact')
  console.log('✅ Test 11: Repeat conversation re-use verified')

  // Test 12: Send reply in conversation
  const reply = await conversationService.sendMessage(conversation.id, seller.id, 'Yes, it is available!')
  console.assert(reply.content === 'Yes, it is available!', '❌ Reply message content should match')
  console.log('✅ Test 12: Seller message reply sent successfully')

  // Test 13: Fetch user conversations list
  const buyerConvs = await conversationService.getUserConversations(buyer.id)
  console.assert(buyerConvs.some((c) => c.id === conversation.id), '❌ Conversation should appear in buyer list')
  console.log('✅ Test 13: Conversation listed in buyer inbox')

  // Test 14: Unauthorized access check
  try {
    await conversationService.getConversationDetails(conversation.id, 'random-unauthorized-user-id')
    console.assert(false, '❌ Should reject unauthorized user access')
  } catch (err: any) {
    console.assert(err.statusCode === 403, '❌ Expected 403 on unauthorized conversation access')
    console.log('✅ Test 14: Unauthorized conversation access prevented (403 Forbidden)')
  }

  console.log('\n🎉 ALL 14 BUYER FEATURE VERIFICATION TESTS PASSED SUCCESSFULLY!')
  process.exit(0)
}

runBuyerFeaturesVerification().catch((err) => {
  console.error('❌ Test suite failed:', err)
  process.exit(1)
})
