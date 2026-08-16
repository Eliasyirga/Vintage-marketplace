import { MeetingOrder, Order, OrderEvent } from '../models'
import type {
  MeetingInput,
  ProposeMeetingInput,
  InspectionChecklistInput,
} from '../types/order.types'
import { sendOrderNotification } from './orderNotification.service'

// Curated safe public meeting locations across Ethiopian cities (primarily Addis Ababa)
export const SUGGESTED_PUBLIC_LOCATIONS = [
  '📍 Bole Medhanialem Mall / Edna Mall area',
  '📍 Kazanchis UNECA / Intercontinental Square',
  '📍 Megenagna Century Mall / Zefmesh Grand Mall',
  '📍 Piazza Commercial Bank / Cinema Empire',
  '📍 Mexico Square / Federal Police Headquarters',
  '📍 Sarbet Adams Pavilion / Vatican Embassy Square',
  '📍 4 Kilo Addis Ababa University Main Gate',
  '📍 22 Golagul Tower / Haya Hulet',
  '📍 CMC Michael Square',
  '📍 Gerji Imperial Hotel Roundabout',
]

/**
 * Create a new meeting order entity
 */
export async function createMeetingOrder(
  orderId: string,
  meetingInfo: MeetingInput,
  transaction?: any,
): Promise<MeetingOrder> {
  return MeetingOrder.create(
    {
      order_id: orderId,
      meeting_location: meetingInfo.meetingLocation,
      meeting_date: meetingInfo.meetingDate,
      meeting_time: meetingInfo.meetingTime,
      buyer_note: meetingInfo.buyerNote || null,
      buyer_confirmed: true, // Initial buyer proposal is confirmed by buyer
      seller_confirmed: false,
      inspection_completed: false,
    },
    { transaction },
  )
}

/**
 * Seller proposes a modified meeting time or public location
 */
export async function proposeMeetingChanges(
  meetingId: string,
  sellerId: string,
  proposal: ProposeMeetingInput,
): Promise<MeetingOrder> {
  const meeting = await MeetingOrder.findByPk(meetingId, {
    include: [{ model: Order, as: 'order' }],
  })

  if (!meeting) {
    throw Object.assign(new Error('Meeting order not found.'), { statusCode: 404 })
  }

  const order = (meeting as any).order as Order
  if (order.seller_id !== sellerId) {
    throw Object.assign(new Error('Only the seller can propose meeting changes.'), { statusCode: 403 })
  }

  const updates: Partial<MeetingOrder> = {
    seller_confirmed: true,
    buyer_confirmed: false, // requires buyer acknowledgment
  }

  if (proposal.meetingLocation) updates.meeting_location = proposal.meetingLocation
  if (proposal.meetingDate) updates.meeting_date = proposal.meetingDate
  if (proposal.meetingTime) updates.meeting_time = proposal.meetingTime
  if (proposal.sellerNote) updates.seller_note = proposal.sellerNote

  await meeting.update(updates)

  await OrderEvent.create({
    order_id: order.id,
    actor_id: sellerId,
    event_type: 'MEETING_RESCHEDULED',
    description: `Seller proposed meeting: ${meeting.meeting_location} on ${meeting.meeting_date} at ${meeting.meeting_time}`,
    metadata: { ...proposal },
  })

  await sendOrderNotification({
    userId: order.buyer_id,
    title: 'Meeting Adjustment Proposed',
    message: `The seller proposed meeting at ${meeting.meeting_location} on ${meeting.meeting_date} at ${meeting.meeting_time}.`,
    type: 'MEETING',
    link: `/orders/${order.id}`,
  })

  return meeting
}

/**
 * Confirm meeting proposal (by Seller or Buyer)
 */
export async function confirmMeeting(
  meetingId: string,
  userId: string,
): Promise<MeetingOrder> {
  const meeting = await MeetingOrder.findByPk(meetingId, {
    include: [{ model: Order, as: 'order' }],
  })

  if (!meeting) {
    throw Object.assign(new Error('Meeting order not found.'), { statusCode: 404 })
  }

  const order = (meeting as any).order as Order
  const isSeller = order.seller_id === userId
  const isBuyer = order.buyer_id === userId

  if (!isSeller && !isBuyer) {
    throw Object.assign(new Error('Unauthorized to confirm meeting.'), { statusCode: 403 })
  }

  if (isSeller) {
    await meeting.update({ seller_confirmed: true })
  }
  if (isBuyer) {
    await meeting.update({ buyer_confirmed: true })
  }

  // If both confirmed, update Order state
  if (
    (isSeller && meeting.buyer_confirmed) ||
    (isBuyer && meeting.seller_confirmed) ||
    (meeting.buyer_confirmed && meeting.seller_confirmed)
  ) {
    await order.update({ status: 'MEETING_CONFIRMED' })

    await OrderEvent.create({
      order_id: order.id,
      actor_id: userId,
      event_type: 'MEETING_CONFIRMED',
      description: `Meeting confirmed at ${meeting.meeting_location} on ${meeting.meeting_date} at ${meeting.meeting_time}`,
      metadata: { location: meeting.meeting_location, date: meeting.meeting_date, time: meeting.meeting_time },
    })

    const otherUserId = isSeller ? order.buyer_id : order.seller_id
    await sendOrderNotification({
      userId: otherUserId,
      title: 'Meeting Confirmed! 🤝',
      message: `Your meeting for order #${order.order_number} has been confirmed.`,
      type: 'MEETING',
      link: `/orders/${order.id}`,
    })
  }

  return meeting
}

/**
 * Complete product inspection checklist
 */
export async function completeInspection(
  meetingId: string,
  buyerId: string,
  checklist: InspectionChecklistInput,
): Promise<MeetingOrder> {
  const meeting = await MeetingOrder.findByPk(meetingId, {
    include: [{ model: Order, as: 'order' }],
  })

  if (!meeting) {
    throw Object.assign(new Error('Meeting order not found.'), { statusCode: 404 })
  }

  const order = (meeting as any).order as Order
  if (order.buyer_id !== buyerId) {
    throw Object.assign(new Error('Only the buyer can complete product inspection.'), { statusCode: 403 })
  }

  if (
    !checklist.productReceived ||
    !checklist.conditionMatchesListing ||
    !checklist.accessoriesIncluded ||
    !checklist.productWorksAsExpected
  ) {
    throw Object.assign(
      new Error('All inspection criteria must be verified to complete purchase inspection.'),
      { statusCode: 400 },
    )
  }

  await meeting.update({
    inspection_completed: true,
    inspection_data: { ...checklist, inspectedAt: new Date() },
  })

  await order.update({ status: 'INSPECTION_PENDING' })

  await OrderEvent.create({
    order_id: order.id,
    actor_id: buyerId,
    event_type: 'INSPECTION_COMPLETED',
    description: 'Buyer completed in-person product inspection successfully.',
    metadata: { checklist },
  })

  await sendOrderNotification({
    userId: order.seller_id,
    title: 'Product Inspected by Buyer',
    message: `The buyer has successfully verified the condition of order #${order.order_number}.`,
    type: 'ORDER',
    link: `/orders/${order.id}`,
  })

  return meeting
}
