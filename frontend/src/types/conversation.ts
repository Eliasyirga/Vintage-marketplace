export type MessageType = 'TEXT' | 'SYSTEM'

export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: MessageType
  isRead: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConversationListing {
  id: string
  title: string
  price: number
  status: string
  condition: string | null
  city: string | null
  image: string | null
}

export interface ConversationParty {
  id: string
  fullName: string
  avatarUrl: string | null
  displayName?: string | null
  isOnline: boolean
}

export interface ConversationLastMessage {
  id: string
  content: string
  senderId: string
  isRead: boolean
  isDeleted: boolean
  createdAt: string
}

export interface ConversationItem {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  lastMessageAt: string
  createdAt: string
  unreadCount: number
  listing: ConversationListing
  otherParty: ConversationParty
  lastMessage?: ConversationLastMessage | null
}

export interface MessagesPage {
  messages: ConversationMessage[]
  hasMore: boolean
  nextCursor: string | null
}

export interface TypingEvent {
  conversationId: string
  userId: string
}

export interface PresenceEvent {
  userId: string
  lastSeenAt?: string
}

export interface ReadEvent {
  conversationId: string
  userId: string
  readAt: string
}

export interface MessageDeletedEvent {
  messageId: string
  conversationId: string
}
