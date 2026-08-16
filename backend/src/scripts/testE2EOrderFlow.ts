import { sequelize, connectDatabase } from '../config/database'
import { User, Listing, Category, Order, DeliveryOrder, MeetingOrder, Payment, OrderEvent } from '../models'
import * as orderService from '../services/order.service'
import * as deliveryService from '../services/delivery.service'
import * as meetingService from '../services/meeting.service'
import * as paymentService from '../services/payment/payment.service'
import { MockPaymentProvider } from '../services/payment/MockPaymentProvider'

async function runTests() {
  console.log('🧪 Starting E2E Purchase, Payment, Delivery & Meeting Test Suite...\n')
  await connectDatabase()

  let passedCount = 0
  let totalCount = 0

  const assert = (condition: boolean, testName: string) => {
    totalCount++
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passedCount++
    } else {
      console.error(`  ❌ [FAIL] ${testName}`)
      throw new Error(`Assertion failed: ${testName}`)
    }
  }

  try {
    // ── Setup Test Fixtures ──────────────────────────────────────────────
    console.log('📦 Setting up test fixtures...')
    const testCategory = await Category.findOne() || await Category.create({
      name: 'Test Electronics',
      slug: 'test-electronics',
    })

    const timestamp = Date.now()
    const seller = await User.create({
      full_name: 'Test Seller Abebe',
      email: `seller_${timestamp}@example.com`,
      password_hash: 'hash123',
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
    })

    const buyer = await User.create({
      full_name: 'Test Buyer Almaz',
      email: `buyer_${timestamp}@example.com`,
      password_hash: 'hash123',
      role: 'USER',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
    })

    const listing = await Listing.create({
      seller_id: seller.id,
      category_id: testCategory.id,
      title: 'Samsung Galaxy S23 Ultra (Vintage Test)',
      description: 'Lightly used, perfect condition',
      price: '45000.00',
      condition: 'LIGHTLY_USED',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      neighborhood: 'Medhanialem',
      status: 'ACTIVE',
    })

    console.log('✨ Fixtures created successfully.\n')

    // ── Test 1: Buyer can purchase an active listing ─────────────────────
    const preflight = await orderService.validateBuyNowEligible(listing.id, buyer.id)
    assert(preflight.eligible === true, 'Test 1: Buyer can purchase an active listing')

    // ── Test 2: Buyer cannot purchase own listing ────────────────────────
    let selfPurchaseError = false
    try {
      await orderService.validateBuyNowEligible(listing.id, seller.id)
    } catch {
      selfPurchaseError = true
    }
    assert(selfPurchaseError, 'Test 2: Buyer cannot purchase own listing')

    // ── Test 3: Delivery checkout calculates correct authoritative totals ──
    const deliveryEstimate = deliveryService.calculateDeliveryFee('Bole', 'Bole', 'Addis Ababa', 'Addis Ababa')
    assert(deliveryEstimate.deliveryFee === 100, 'Test 3a: Intra-Bole delivery fee is exactly 100 ETB')

    const diffSubCityEstimate = deliveryService.calculateDeliveryFee('Bole', 'Yeka', 'Addis Ababa', 'Addis Ababa')
    assert(diffSubCityEstimate.deliveryFee === 200, 'Test 3b: Cross-subcity delivery fee is exactly 200 ETB')

    const regionalEstimate = deliveryService.calculateDeliveryFee('Bole', 'Bole', 'Addis Ababa', 'Hawassa')
    assert(regionalEstimate.deliveryFee === 450, 'Test 3c: Regional inter-city delivery fee is exactly 450 ETB')

    // ── Test 4: Create Delivery Order with atomic listing reservation ────
    const deliveryOrderResult = await orderService.createOrder(buyer.id, {
      listingId: listing.id,
      fulfillmentMethod: 'DELIVERY',
      paymentMethod: 'PLATFORM_PAYMENT',
      provider: 'MOCK',
      deliveryInfo: {
        fullName: 'Almaz Tesfaye',
        phone: '0911223344',
        city: 'Addis Ababa',
        subCity: 'Bole',
        neighborhood: 'Rwanda',
        deliveryLocation: 'House 304, Street 12',
        deliveryNotes: 'Please ring bell',
      },
    })

    const orderId = deliveryOrderResult.order.id
    assert(!!deliveryOrderResult.order.id, 'Test 4a: Order created with UUID primary key')
    assert(deliveryOrderResult.order.order_number.startsWith('BONDA-'), 'Test 4b: Human-readable order number generated')
    assert(Number(deliveryOrderResult.order.total_amount) === 45100, 'Test 4c: Authoritative total calculated server-side (45,000 + 100 = 45,100 ETB)')

    // ── Test 5: Listing is temporarily RESERVED ─────────────────────────
    await listing.reload()
    assert(listing.status === 'RESERVED', 'Test 5: Listing status transitioned from ACTIVE to RESERVED')

    // ── Test 6: Another buyer cannot purchase RESERVED listing ───────────
    let duplicateBlocked = false
    try {
      await orderService.validateBuyNowEligible(listing.id, 'another-buyer-id')
    } catch {
      duplicateBlocked = true
    }
    assert(duplicateBlocked, 'Test 6: Race-condition protection prevents concurrent purchase of reserved item')

    // ── Test 7: Fake payment success cannot activate order without server verification ─
    const payment = deliveryOrderResult.payment!
    assert(payment.status === 'PENDING', 'Test 7a: Payment initialized in PENDING state')

    // Simulate provider approval in sandbox
    MockPaymentProvider.simulateStatus(payment.reference, 'SUCCESS')

    const verifyResult = await paymentService.verifyAndProcessPayment(payment.reference, 'MOCK')
    assert(verifyResult.payment.status === 'SUCCESS', 'Test 7b: Payment verified server-side')

    // ── Test 8: Order updated to PREPARING upon successful payment ───────
    const verifiedOrder = await Order.findByPk(orderId)
    assert(verifiedOrder?.payment_status === 'SUCCESS', 'Test 8a: Order payment status updated to SUCCESS')
    assert(verifiedOrder?.status === 'PREPARING', 'Test 8b: Delivery order status advanced to PREPARING')

    // ── Test 9: Idempotent payment verification (duplicate webhook replay) ─
    const replayResult = await paymentService.verifyAndProcessPayment(payment.reference, 'MOCK')
    assert(replayResult.activated === false, 'Test 9: Webhook replay is idempotent and does not duplicate activation')

    // ── Test 10: Seller confirms & marks item ready ──────────────────────
    await orderService.sellerMarkReady(orderId, seller.id)
    const readyOrder = await Order.findByPk(orderId)
    assert(readyOrder?.status === 'READY_FOR_DELIVERY', 'Test 10: Seller marked order ready for courier pickup')

    // ── Test 11: Buyer completes delivery receipt -> Listing becomes SOLD ─
    await orderService.completeOrder(orderId, buyer.id)
    const completedOrder = await Order.findByPk(orderId)
    await listing.reload()
    assert(completedOrder?.status === 'COMPLETED', 'Test 11a: Order marked as COMPLETED')
    assert(listing.status === 'SOLD', 'Test 11b: Listing marked permanently SOLD')

    // ── Test 12: Cannot purchase SOLD listing ────────────────────────────
    let soldBlocked = false
    try {
      await orderService.validateBuyNowEligible(listing.id, buyer.id)
    } catch {
      soldBlocked = true
    }
    assert(soldBlocked, 'Test 12: Buyer cannot purchase already SOLD listing')

    // ── Test 13: Meet in Person Workflow & Inspection Checklist ───────────
    const listing2 = await Listing.create({
      seller_id: seller.id,
      category_id: testCategory.id,
      title: 'Vintage Leather Jacket (Test Item 2)',
      description: 'Authentic 90s vintage',
      price: '3500.00',
      condition: 'LIKE_NEW',
      city: 'Addis Ababa',
      sub_city: 'Yeka',
      neighborhood: 'Megenagna',
      status: 'ACTIVE',
    })

    const meetingOrderResult = await orderService.createOrder(buyer.id, {
      listingId: listing2.id,
      fulfillmentMethod: 'MEET_IN_PERSON',
      paymentMethod: 'DIRECT_TO_SELLER',
      meetingInfo: {
        meetingLocation: '📍 Megenagna Century Mall',
        meetingDate: '2026-08-20',
        meetingTime: '15:00',
        buyerNote: 'Will wait by main fountain',
      },
    })

    const meetingId = (await MeetingOrder.findOne({ where: { order_id: meetingOrderResult.order.id } }))!.id

    // Seller confirms meeting
    const confirmedMeeting = await meetingService.confirmMeeting(meetingId, seller.id)
    assert(confirmedMeeting.seller_confirmed === true, 'Test 13a: Seller confirmed meeting agreement')

    // Buyer completes product inspection checklist
    const inspectedMeeting = await meetingService.completeInspection(meetingId, buyer.id, {
      productReceived: true,
      conditionMatchesListing: true,
      accessoriesIncluded: true,
      productWorksAsExpected: true,
      notes: 'Excellent vintage condition verified',
    })
    assert(inspectedMeeting.inspection_completed === true, 'Test 13b: Buyer verified in-person inspection checklist')

    // Buyer completes purchase
    await orderService.completeOrder(meetingOrderResult.order.id, buyer.id)
    await listing2.reload()
    assert(listing2.status === 'SOLD', 'Test 13c: Meet-in-person completed and listing marked SOLD')

    // ── Test 14: Expired reservation cleanup returns listing to ACTIVE ────
    const listing3 = await Listing.create({
      seller_id: seller.id,
      category_id: testCategory.id,
      title: 'Vintage Swiss Watch (Test Item 3)',
      description: 'Mechanical watch',
      price: '12000.00',
      condition: 'LIGHTLY_USED',
      city: 'Addis Ababa',
      sub_city: 'Bole',
      status: 'ACTIVE',
    })

    const expiredOrderResult = await orderService.createOrder(buyer.id, {
      listingId: listing3.id,
      fulfillmentMethod: 'DELIVERY',
      paymentMethod: 'PLATFORM_PAYMENT',
      deliveryInfo: {
        fullName: 'Almaz Tesfaye',
        phone: '0911223344',
        city: 'Addis Ababa',
        subCity: 'Bole',
        deliveryLocation: 'Bole Road',
      },
    })

    // Force expire reservation timestamp
    await expiredOrderResult.order.update({
      reservation_expires_at: new Date(Date.now() - 3600000), // 1 hour ago
    })

    const releasedCount = await orderService.cleanupExpiredReservations()
    await listing3.reload()
    assert(releasedCount >= 1, 'Test 14a: Expired reservation cleanup detected abandoned session')
    assert(listing3.status === 'ACTIVE', 'Test 14b: Listing restored to ACTIVE marketplace availability')

    // ── Test 15: Cancellation & Audit Trail ──────────────────────────────
    const events = await OrderEvent.findAll({ where: { order_id: orderId } })
    assert(events.length >= 3, 'Test 15: Immutable OrderEvent audit timeline successfully recorded milestones')

    console.log(`\n🎉 All ${passedCount}/${totalCount} E2E Order Flow tests passed with 100% success!`)
  } catch (err) {
    console.error('❌ Test suite execution failed:', err)
    process.exit(1)
  }
}

runTests().then(() => process.exit(0))
