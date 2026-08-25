import {
  Conversation,
  ConversationParticipant,
  Message,
  User,
  Listing,
  ListingImage,
  SellerProfile,
  Notification,
  UserBlock,
} from '../models'
import { sequelize } from '../config/database'
import { Op } from 'sequelize'
import { trackInteraction } from './interaction.service'
import { emitToConversation, emitToUser, isUserOnline } from '../socket/socket.service'

const MAX_MESSAGE_LENGTH = 2000

const userAttributes = [
  'id',
  'full_name',
  'avatar_url',
  'is_email_verified',
  'is_phone_verified',
  'is_fayda_verified',
]

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SafeConversation {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  lastMessageAt: Date
  createdAt: Date
  unreadCount: number
  listing: {
    id: string
    title: string
    price: number
    status: string
    condition: string | null
    city: string | null
    image: string | null
  }
  otherParty: {
    id: string
    fullName: string
    avatarUrl: string | null
    displayName?: string | null
    isOnline: boolean
  }
  lastMessage?: {
    id: string
    content: string
    senderId: string
    isRead: boolean
    isDeleted: boolean
    createdAt: Date
  } | null
}

export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: 'TEXT' | 'SYSTEM'
  isRead: boolean
  isDeleted: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Sanitize text: strip HTML tags, trim, enforce max length */
function sanitizeMessage(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, '')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH)
}

/** Check if either user has blocked the other */
async function checkBlock(userA: string, userB: string): Promise<void> {
  const block = await UserBlock.findOne({
    where: {
      [Op.or]: [
        { blocker_id: userA, blocked_user_id: userB },
        { blocker_id: userB, blocked_user_id: userA },
      ],
    },
  })
  if (block) {
    throw Object.assign(new Error('You cannot message this user.'), { statusCode: 403 })
  }
}

/** Upsert ConversationParticipant records for both buyer and seller */
async function ensureParticipants(
  conversationId: string,
  buyerId: string,
  sellerId: string,
  transaction?: any,
): Promise<void> {
  await ConversationParticipant.findOrCreate({
    where: { conversation_id: conversationId, user_id: buyerId },
    defaults: {
      conversation_id: conversationId,
      user_id: buyerId,
      last_read_at: new Date(),
      joined_at: new Date(),
    },
    transaction,
  })
  await ConversationParticipant.findOrCreate({
    where: { conversation_id: conversationId, user_id: sellerId },
    defaults: {
      conversation_id: conversationId,
      user_id: sellerId,
      last_read_at: new Date(),
      joined_at: new Date(),
    },
    transaction,
  })
}

/** Count unread messages for a user in a conversation */
async function getUnreadCount(conversationId: string, userId: string): Promise<number> {
  const participant = await ConversationParticipant.findOne({
    where: { conversation_id: conversationId, user_id: userId },
  })
  if (!participant) return 0

  return Message.count({
    where: {
      conversation_id: conversationId,
      sender_id: { [Op.ne]: userId },
      deleted_at: null,
      created_at: { [Op.gt]: participant.last_read_at },
    },
  })
}

/** Send an in-app notification to a user that is currently offline */
async function notifyOfflineUser(
  recipientId: string,
  senderName: string,
  messageContent: string,
  conversationId: string,
): Promise<void> {
  try {
    await Notification.create({
      user_id: recipientId,
      title: `New message from ${senderName}`,
      message:
        messageContent.length > 60 ? messageContent.slice(0, 57) + '...' : messageContent,
      type: 'SYSTEM',
      link: `/messages?conversationId=${conversationId}`,
      is_read: false,
      metadata: { conversationId },
    })
  } catch {
    // non-fatal – notification delivery failure must not break message sending
  }
}

// ── Public Service Functions ──────────────────────────────────────────────────

/**
 * Create or get an existing conversation between buyer and seller for a listing.
 * Validates block status, self-messaging, listing existence.
 * Persists initial message to DB before returning.
 */
export async function getOrCreateConversation(
  buyerId: string,
  listingId: string,
  sellerId: string,
  initialMessage?: string,
): Promise<{ conversation: Conversation; isNew: boolean; conversationId: string }> {
  if (buyerId === sellerId) {
    throw Object.assign(new Error('You cannot message yourself about your own listing.'), {
      statusCode: 400,
    })
  }

  await checkBlock(buyerId, sellerId)

  const listing = await Listing.findByPk(listingId)
  if (!listing) {
    throw Object.assign(new Error('Listing not found.'), { statusCode: 404 })
  }

  const seller = await User.findByPk(sellerId, { attributes: userAttributes })
  if (!seller) {
    throw Object.assign(new Error('Seller not found.'), { statusCode: 404 })
  }

  // Try to find existing conversation
  let conversation = await Conversation.findOne({
    where: { listing_id: listingId, buyer_id: buyerId },
  })

  let isNew = false

  if (!conversation) {
    isNew = true

    conversation = await sequelize.transaction(async (t) => {
      const conv = await Conversation.create(
        {
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
          last_message_at: new Date(),
        },
        { transaction: t },
      )

      await ensureParticipants(conv.id, buyerId, sellerId, t)

      if (initialMessage) {
        const clean = sanitizeMessage(initialMessage)
        if (clean) {
          await Message.create(
            {
              conversation_id: conv.id,
              sender_id: buyerId,
              content: clean,
              message_type: 'TEXT',
              is_read: false,
              deleted_at: null,
            },
            { transaction: t },
          )
        }
      }

      return conv
    })

    try {
      await listing.increment('contact_count')
    } catch {
      /* non-fatal */
    }
  } else {
    await ensureParticipants(conversation.id, buyerId, sellerId)

    if (initialMessage) {
      const clean = sanitizeMessage(initialMessage)
      if (clean) {
        const msg = await Message.create({
          conversation_id: conversation.id,
          sender_id: buyerId,
          content: clean,
          message_type: 'TEXT',
          is_read: false,
          deleted_at: null,
        })

        conversation.last_message_at = new Date()
        await conversation.save()

        // Real-time emit
        emitToConversation(conversation.id, 'message:new', msg.toSafeObject())
        emitToUser(sellerId, 'message:new', msg.toSafeObject())

        if (!isUserOnline(sellerId)) {
          const buyer = await User.findByPk(buyerId, { attributes: ['id', 'full_name'] })
          await notifyOfflineUser(sellerId, buyer?.full_name ?? 'Someone', clean, conversation.id)
        }
      }
    }
  }

  trackInteraction(buyerId, 'CONTACT', listingId)

  return { conversation, isNew, conversationId: conversation.id }
}

/**
 * List all conversations for the given user, with unread count, last message, and listing snapshot.
 */
export async function getUserConversations(userId: string): Promise<SafeConversation[]> {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [{ buyer_id: userId }, { seller_id: userId }],
    },
    include: [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'price', 'status', 'condition', 'city'],
        include: [
          {
            model: ListingImage,
            as: 'images',
            attributes: ['url', 'sort_order', 'is_cover'],
          },
        ],
        paranoid: false,
      },
      {
        model: User,
        as: 'buyer',
        attributes: userAttributes,
        include: [{ model: SellerProfile, as: 'sellerProfile', attributes: ['display_name', 'profile_image'] }],
      },
      {
        model: User,
        as: 'seller',
        attributes: userAttributes,
        include: [{ model: SellerProfile, as: 'sellerProfile', attributes: ['display_name', 'profile_image'] }],
      },
      {
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['created_at', 'DESC']],
      },
    ],
    order: [['last_message_at', 'DESC']],
  })

  const results: SafeConversation[] = []

  for (const conv of conversations) {
    const isBuyer = conv.buyer_id === userId
    const otherUser = isBuyer
      ? (conv as any).seller as User | undefined
      : (conv as any).buyer as User | undefined

    const listing = (conv as any).listing as (Listing & { images?: ListingImage[] }) | undefined
    const images = listing?.images ?? []
    const sortedImages = images.slice().sort((a, b) => a.sort_order - b.sort_order)
    const coverImage =
      sortedImages.find((img) => (img as any).is_cover)?.url ??
      sortedImages[0]?.url ??
      null

    const otherProfile = (otherUser as any)?.sellerProfile as SellerProfile | undefined
    const lastMsg = ((conv as any).messages as Message[])?.[0]

    const unreadCount = await getUnreadCount(conv.id, userId)

    results.push({
      id: conv.id,
      listingId: conv.listing_id,
      buyerId: conv.buyer_id,
      sellerId: conv.seller_id,
      lastMessageAt: conv.last_message_at,
      createdAt: conv.created_at,
      unreadCount,
      listing: {
        id: listing?.id ?? conv.listing_id,
        title: listing?.title ?? 'Listing',
        price: listing ? Number(listing.price) : 0,
        status: listing?.status ?? 'ACTIVE',
        condition: (listing as any)?.condition ?? null,
        city: (listing as any)?.city ?? null,
        image: coverImage,
      },
      otherParty: {
        id: otherUser?.id ?? '',
        fullName: otherUser?.full_name ?? 'User',
        avatarUrl: otherProfile?.profile_image ?? otherUser?.avatar_url ?? null,
        displayName: otherProfile?.display_name ?? null,
        isOnline: otherUser ? isUserOnline(otherUser.id) : false,
      },
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.deleted_at ? 'This message was deleted.' : lastMsg.content,
            senderId: lastMsg.sender_id,
            isRead: lastMsg.is_read,
            isDeleted: !!lastMsg.deleted_at,
            createdAt: lastMsg.created_at,
          }
        : null,
    })
  }

  return results
}

/**
 * Get conversation metadata and details (authorization check).
 */
export async function getConversationDetails(
  conversationId: string,
  userId: string,
): Promise<SafeConversation> {
  const conv = await Conversation.findByPk(conversationId, {
    include: [
      {
        model: Listing,
        as: 'listing',
        attributes: ['id', 'title', 'price', 'status', 'city', 'condition', 'sub_city'],
        include: [
          { model: ListingImage, as: 'images', attributes: ['url', 'sort_order', 'is_cover'] },
        ],
        paranoid: false,
      },
      {
        model: User,
        as: 'buyer',
        attributes: userAttributes,
        include: [{ model: SellerProfile, as: 'sellerProfile', attributes: ['display_name', 'profile_image'] }],
      },
      {
        model: User,
        as: 'seller',
        attributes: userAttributes,
        include: [{ model: SellerProfile, as: 'sellerProfile', attributes: ['display_name', 'profile_image'] }],
      },
      {
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['created_at', 'DESC']],
      },
    ],
  })

  if (!conv) {
    throw Object.assign(new Error('Conversation not found.'), { statusCode: 404 })
  }

  if (conv.buyer_id !== userId && conv.seller_id !== userId) {
    throw Object.assign(new Error('You do not have permission to view this conversation.'), {
      statusCode: 403,
    })
  }

  const isBuyer = conv.buyer_id === userId
  const otherUser = isBuyer
    ? (conv as any).seller as User | undefined
    : (conv as any).buyer as User | undefined

  const listing = (conv as any).listing as (Listing & { images?: ListingImage[] }) | undefined
  const images = listing?.images ?? []
  const sortedImages = images.slice().sort((a, b) => a.sort_order - b.sort_order)
  const coverImage =
    sortedImages.find((img) => (img as any).is_cover)?.url ??
    sortedImages[0]?.url ??
    null

  const otherProfile = (otherUser as any)?.sellerProfile as SellerProfile | undefined
  const lastMsg = ((conv as any).messages as Message[])?.[0]
  const unreadCount = await getUnreadCount(conv.id, userId)

  return {
    id: conv.id,
    listingId: conv.listing_id,
    buyerId: conv.buyer_id,
    sellerId: conv.seller_id,
    lastMessageAt: conv.last_message_at,
    createdAt: conv.created_at,
    unreadCount,
    listing: {
      id: listing?.id ?? conv.listing_id,
      title: listing?.title ?? 'Listing',
      price: listing ? Number(listing.price) : 0,
      status: listing?.status ?? 'ACTIVE',
      condition: (listing as any)?.condition ?? null,
      city: (listing as any)?.city ?? null,
      image: coverImage,
    },
    otherParty: {
      id: otherUser?.id ?? '',
      fullName: otherUser?.full_name ?? 'User',
      avatarUrl: otherProfile?.profile_image ?? otherUser?.avatar_url ?? null,
      displayName: otherProfile?.display_name ?? null,
      isOnline: otherUser ? isUserOnline(otherUser.id) : false,
    },
    lastMessage: lastMsg
      ? {
          id: lastMsg.id,
          content: lastMsg.deleted_at ? 'This message was deleted.' : lastMsg.content,
          senderId: lastMsg.sender_id,
          isRead: lastMsg.is_read,
          isDeleted: !!lastMsg.deleted_at,
          createdAt: lastMsg.created_at,
        }
      : null,
  }
}

/**
 * Get paginated messages for a conversation using cursor-based pagination.
 * Returns messages in ascending (oldest-first) order within a page.
 * Cursor is the oldest message's created_at from the previous batch.
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
  limit = 30,
): Promise<{ messages: ConversationMessage[]; hasMore: boolean; nextCursor: string | null }> {
  const conv = await Conversation.findByPk(conversationId)
  if (!conv) {
    throw Object.assign(new Error('Conversation not found.'), { statusCode: 404 })
  }
  if (conv.buyer_id !== userId && conv.seller_id !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 })
  }

  const whereClause: any = { conversation_id: conversationId }
  if (cursor) {
    whereClause.created_at = { [Op.lt]: new Date(cursor) }
  }

  const rows = await Message.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: limit + 1,
  })

  const hasMore = rows.length > limit
  if (hasMore) rows.pop()

  // Return in ascending order for display
  rows.reverse()

  const nextCursor = hasMore && rows.length > 0 ? rows[0].created_at.toISOString() : null

  return {
    messages: rows.map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.deleted_at ? 'This message was deleted.' : m.content,
      messageType: m.message_type,
      isRead: m.is_read,
      isDeleted: !!m.deleted_at,
      deletedAt: m.deleted_at,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    })),
    hasMore,
    nextCursor,
  }
}

/**
 * Send a message. DB-first persistence, then Socket.IO broadcast, then offline notification.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<ConversationMessage> {
  const clean = sanitizeMessage(content)
  if (!clean) {
    throw Object.assign(new Error('Message content cannot be empty.'), { statusCode: 400 })
  }
  if (clean.length > MAX_MESSAGE_LENGTH) {
    throw Object.assign(new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`), {
      statusCode: 400,
    })
  }

  const conv = await Conversation.findByPk(conversationId)
  if (!conv) {
    throw Object.assign(new Error('Conversation not found.'), { statusCode: 404 })
  }

  if (conv.buyer_id !== senderId && conv.seller_id !== senderId) {
    throw Object.assign(new Error('You do not have permission to send messages here.'), {
      statusCode: 403,
    })
  }

  const recipientId = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id

  // Check block
  await checkBlock(senderId, recipientId)

  // ── DB-First Persistence ──────────────────────────────────────────────────
  const message = await sequelize.transaction(async (t) => {
    const msg = await Message.create(
      {
        conversation_id: conv.id,
        sender_id: senderId,
        content: clean,
        message_type: 'TEXT',
        is_read: false,
        deleted_at: null,
      },
      { transaction: t },
    )

    await Conversation.update(
      { last_message_at: new Date() },
      { where: { id: conv.id }, transaction: t },
    )

    return msg
  })

  const safeMsg: ConversationMessage = {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    messageType: message.message_type,
    isRead: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: message.created_at,
    updatedAt: message.updated_at,
  }

  // ── Real-time Broadcast (after commit) ────────────────────────────────────
  emitToConversation(conversationId, 'message:new', safeMsg)
  emitToUser(recipientId, 'message:new', safeMsg)

  // ── Offline Notification ──────────────────────────────────────────────────
  if (!isUserOnline(recipientId)) {
    const sender = await User.findByPk(senderId, { attributes: ['id', 'full_name'] })
    await notifyOfflineUser(recipientId, sender?.full_name ?? 'Someone', clean, conversationId)
  }

  return safeMsg
}

/**
 * Mark all messages in the conversation sent by the other party as read.
 * Updates ConversationParticipant.last_read_at.
 * Emits message:read to the conversation room.
 */
export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const conv = await Conversation.findByPk(conversationId)
  if (!conv) {
    throw Object.assign(new Error('Conversation not found.'), { statusCode: 404 })
  }
  if (conv.buyer_id !== userId && conv.seller_id !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 })
  }

  const now = new Date()

  await Message.update(
    { is_read: true },
    {
      where: {
        conversation_id: conversationId,
        sender_id: { [Op.ne]: userId },
        is_read: false,
        deleted_at: null,
      },
    },
  )

  await ConversationParticipant.update(
    { last_read_at: now },
    { where: { conversation_id: conversationId, user_id: userId } },
  )

  emitToConversation(conversationId, 'message:read', { conversationId, userId, readAt: now })
}

/**
 * Soft-delete a message (only the sender can delete their own message).
 */
export async function softDeleteMessage(
  messageId: string,
  senderId: string,
): Promise<void> {
  const msg = await Message.findByPk(messageId)
  if (!msg) {
    throw Object.assign(new Error('Message not found.'), { statusCode: 404 })
  }
  if (msg.sender_id !== senderId) {
    throw Object.assign(new Error('You can only delete your own messages.'), { statusCode: 403 })
  }
  if (msg.deleted_at) {
    throw Object.assign(new Error('Message is already deleted.'), { statusCode: 400 })
  }

  msg.deleted_at = new Date()
  await msg.save()

  emitToConversation(msg.conversation_id, 'message:deleted', {
    messageId: msg.id,
    conversationId: msg.conversation_id,
  })
}
