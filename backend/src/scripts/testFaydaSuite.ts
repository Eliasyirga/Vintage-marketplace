import 'dotenv/config'
import { sequelize } from '../config/database'
import {
  User,
  UserVerification,
  SellerProfile,
  Listing,
} from '../models'
import * as verificationService from '../services/verification.service'
import * as faydaProvider from '../services/fayda/fayda.provider'
import * as sellerService from '../services/seller.service'

async function runFaydaSuite() {
  console.log('🧪 Starting Comprehensive Fayda Verification Test Suite...\n')

  await sequelize.authenticate()
  console.log('✅ Database connected')

  // Setup Test Users
  let testUser1 = await User.findOne({ where: { email: 'fayda.user1@vintagemarketplace.com' } })
  if (!testUser1) {
    testUser1 = await User.create({
      email: 'fayda.user1@vintagemarketplace.com',
      password_hash: 'hash_test_123',
      full_name: 'Fayda Test User One',
      phone: '+251911999111',
      role: 'USER',
      is_fayda_verified: false,
    })
  } else {
    await testUser1.update({ is_fayda_verified: false })
  }

  let testUser2 = await User.findOne({ where: { email: 'fayda.user2@vintagemarketplace.com' } })
  if (!testUser2) {
    testUser2 = await User.create({
      email: 'fayda.user2@vintagemarketplace.com',
      password_hash: 'hash_test_123',
      full_name: 'Fayda Test User Two',
      phone: '+251911999222',
      role: 'USER',
      is_fayda_verified: false,
    })
  } else {
    await testUser2.update({ is_fayda_verified: false })
  }

  let adminUser = await User.findOne({ where: { email: 'admin.fayda@vintagemarketplace.com' } })
  if (!adminUser) {
    adminUser = await User.create({
      email: 'admin.fayda@vintagemarketplace.com',
      password_hash: 'hash_test_123',
      full_name: 'Fayda Admin',
      phone: '+251911999333',
      role: 'ADMIN',
    })
  }

  // Clean up previous verification records for test users
  await UserVerification.destroy({ where: { user_id: [testUser1.id, testUser2.id] } })

  console.log('─────────────────────────────────────────────────────────────────')

  // TEST 1: Initial state is unverified
  console.log('TEST 1: Initial unverified state...')
  if (testUser1.is_fayda_verified) throw new Error('TEST 1 Failed: User starts verified')
  const initialVerifs = await verificationService.getUserVerifications(testUser1.id)
  if (initialVerifs.some((v) => v.status === 'VERIFIED')) throw new Error('TEST 1 Failed: Has verified record')
  console.log('✅ TEST 1 Passed: User starts unverified.\n')

  // TEST 2: Initiate Fayda verification creates PENDING record with state token
  console.log('TEST 2: Initiate Fayda verification session...')
  const initResult = await verificationService.initiateFaydaVerification(testUser1.id)
  if (!initResult.redirectUrl || !initResult.redirectUrl.includes('state=')) {
    throw new Error('TEST 2 Failed: No redirectUrl or state param returned')
  }
  const pendingRecord = await UserVerification.findOne({
    where: { user_id: testUser1.id, verification_type: 'NATIONAL_ID' },
  })
  if (!pendingRecord || pendingRecord.status !== 'PENDING' || !pendingRecord.fayda_state_token) {
    throw new Error('TEST 2 Failed: PENDING UserVerification record with state token was not created')
  }
  console.log('✅ TEST 2 Passed: Verification session initiated with anti-CSRF state token.\n')

  // TEST 3: Spoofed state token is rejected
  console.log('TEST 3: Callback with spoofed state token is rejected...')
  try {
    await verificationService.completeFaydaVerification('fake_state_token_12345', 'sandbox_code')
    throw new Error('TEST 3 Failed: Spoofed state token was accepted!')
  } catch (err: any) {
    if (err.message.includes('TEST 3 Failed')) throw err
  }
  console.log('✅ TEST 3 Passed: Invalid state token safely rejected.\n')

  // TEST 4: Expired state token is rejected
  console.log('TEST 4: Expired state token handling...')
  await pendingRecord.update({ fayda_state_expires_at: new Date(Date.now() - 60 * 1000) })
  try {
    await verificationService.completeFaydaVerification(pendingRecord.fayda_state_token!, 'sandbox_code')
    throw new Error('TEST 4 Failed: Expired state token was accepted!')
  } catch (err: any) {
    if (err.message.includes('TEST 4 Failed')) throw err
  }
  const expiredRecord = await UserVerification.findByPk(pendingRecord.id)
  if (expiredRecord?.status !== 'EXPIRED') throw new Error('TEST 4 Failed: Status not marked EXPIRED')
  console.log('✅ TEST 4 Passed: Expired verification state rejected and marked EXPIRED.\n')

  // TEST 5: Complete valid Fayda verification in sandbox mode
  console.log('TEST 5: Complete valid Fayda verification...')
  // Re-initiate fresh state
  const freshInit = await verificationService.initiateFaydaVerification(testUser1.id)
  const freshRecord = await UserVerification.findOne({
    where: { user_id: testUser1.id, verification_type: 'NATIONAL_ID' },
  })
  const stateToken = freshRecord!.fayda_state_token!

  const completeResult = await verificationService.completeFaydaVerification(stateToken, 'sandbox_duplicate_code')
  if (!completeResult.success || completeResult.userId !== testUser1.id) {
    throw new Error('TEST 5 Failed: completeFaydaVerification returned unsuccessful')
  }

  const verifiedUser1 = await User.findByPk(testUser1.id)
  if (!verifiedUser1?.is_fayda_verified) {
    throw new Error('TEST 5 Failed: User.is_fayda_verified is false after completion')
  }
  const verifiedRecord = await UserVerification.findOne({
    where: { user_id: testUser1.id, verification_type: 'NATIONAL_ID' },
  })
  if (verifiedRecord?.status !== 'VERIFIED' || !verifiedRecord.fayda_subject_hash) {
    throw new Error('TEST 5 Failed: UserVerification not VERIFIED or missing subject hash')
  }
  console.log('✅ TEST 5 Passed: Verification completed, User.is_fayda_verified set to true.\n')

  // TEST 6: Replay attack prevention (state token consumed after first use)
  console.log('TEST 6: Replay attack prevention...')
  try {
    await verificationService.completeFaydaVerification(stateToken, 'sandbox_duplicate_code')
    throw new Error('TEST 6 Failed: Replayed state token was accepted!')
  } catch (err: any) {
    if (err.message.includes('TEST 6 Failed')) throw err
  }
  console.log('✅ TEST 6 Passed: State token is single-use and cannot be replayed.\n')

  // TEST 7: Duplicate Fayda identity across different accounts
  console.log('TEST 7: Duplicate identity prevention across accounts...')
  // User 2 tries to verify with the same Fayda subject
  await verificationService.initiateFaydaVerification(testUser2.id)
  const user2Record = await UserVerification.findOne({
    where: { user_id: testUser2.id, verification_type: 'NATIONAL_ID' },
  })
  try {
    // In sandbox mode with duplicate code, it returns the same duplicate sub which matches user 1's verified record
    await verificationService.completeFaydaVerification(user2Record!.fayda_state_token!, 'sandbox_duplicate_code')
    throw new Error('TEST 7 Failed: Same Fayda sub verified second user account!')
  } catch (err: any) {
    if (err.message.includes('TEST 7 Failed')) throw err
  }
  const user2Reloaded = await User.findByPk(testUser2.id)
  if (user2Reloaded?.is_fayda_verified) throw new Error('TEST 7 Failed: User 2 was marked verified despite duplicate identity')
  console.log('✅ TEST 7 Passed: Duplicate Fayda identity rejected without linking second account.\n')

  // TEST 8: Already verified user cannot re-initiate
  console.log('TEST 8: Already verified user re-initiation guard...')
  try {
    await verificationService.initiateFaydaVerification(testUser1.id)
    throw new Error('TEST 8 Failed: Already verified user was able to re-initiate')
  } catch (err: any) {
    if (err.message.includes('TEST 8 Failed')) throw err
  }
  console.log('✅ TEST 8 Passed: Already verified account cannot start redundant session.\n')

  // TEST 9: Public seller profile reflects isFaydaVerified
  console.log('TEST 9: Public seller profile reflects verified status...')
  const publicProfile = await sellerService.getPublicSellerProfile(testUser1.id)
  if (!publicProfile.isFaydaVerified) {
    throw new Error('TEST 9 Failed: Public profile isFaydaVerified is false')
  }
  console.log('✅ TEST 9 Passed: Public seller profile displays isFaydaVerified: true.\n')

  // TEST 10: Unverified seller does not have badge
  console.log('TEST 10: Unverified seller does not have verified badge...')
  const unverifiedProfile = await sellerService.getPublicSellerProfile(testUser2.id)
  if (unverifiedProfile.isFaydaVerified) {
    throw new Error('TEST 10 Failed: Unverified seller has isFaydaVerified: true')
  }
  console.log('✅ TEST 10 Passed: Unverified seller correctly has isFaydaVerified: false.\n')

  // TEST 11: Admin approval bug fix verification
  console.log('TEST 11: Admin approval syncs User.is_fayda_verified...')
  // Create a manual review NATIONAL_ID verification for user 2
  const manualReq = await verificationService.requestVerification(testUser2.id, 'NATIONAL_ID')
  if (manualReq.status !== 'PENDING') throw new Error('TEST 11 Failed: Request not created PENDING')
  
  const approvedManual = await verificationService.approveVerification(manualReq.id, adminUser.id)
  if (approvedManual.status !== 'VERIFIED') throw new Error('TEST 11 Failed: Admin approval status not VERIFIED')
  
  const user2AfterAdminApprove = await User.findByPk(testUser2.id)
  if (!user2AfterAdminApprove?.is_fayda_verified) {
    throw new Error('TEST 11 Failed: Admin approval did not sync User.is_fayda_verified = true')
  }
  console.log('✅ TEST 11 Passed: Admin approval properly syncs User.is_fayda_verified.\n')

  // TEST 12: Admin verification query does not leak sensitive tokens
  console.log('TEST 12: Admin pending verifications does not leak state/hash tokens...')
  const pendingAdminList = await verificationService.getPendingVerifications({})
  for (const item of pendingAdminList.verifications) {
    const raw = item.toJSON ? item.toJSON() : item
    if ((raw as any).fayda_state_token || (raw as any).fayda_subject_hash) {
      throw new Error('TEST 12 Failed: Admin list query leaked fayda tokens')
    }
  }
  console.log('✅ TEST 12 Passed: Admin queries sanitize all sensitive provider tokens.\n')

  // TEST 13: Sub hash hashing stability & one-way protection
  console.log('TEST 13: Sub hash hashing stability & one-way protection...')
  const sub1 = 'fayda-user-sub-abc-123'
  const sub2 = 'fayda-user-sub-abc-124'
  const hash1 = faydaProvider.hashFaydaSub(sub1)
  const hash1b = faydaProvider.hashFaydaSub(sub1)
  const hash2 = faydaProvider.hashFaydaSub(sub2)
  if (hash1 !== hash1b || hash1 === hash2 || hash1.includes(sub1)) {
    throw new Error('TEST 13 Failed: Hash function is not deterministic or leaks raw sub')
  }
  console.log('✅ TEST 13 Passed: Sub hashing is deterministic, collision-resistant, and one-way.\n')

  console.log('═════════════════════════════════════════════════════════════════')
  console.log('🎉 ALL FAYDA VERIFICATION SYSTEM TESTS PASSED SUCCESSFULLY!')
  console.log('═════════════════════════════════════════════════════════════════')
}

runFaydaSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fayda Test Suite Failed:', err)
    process.exit(1)
  })
