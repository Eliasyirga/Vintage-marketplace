export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface ConversationItem {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  lastMessageAt: string
  createdAt: string
  listing: {
    id: string
    title: string
    price: number
    status: string
    image: string | null
    city?: string
    condition?: string
  }
  otherParty: {
    id: string
    fullName: string
    avatarUrl: string | null
    displayName?: string | null
  }
  lastMessage?: {
    id: string
    content: string
    senderId: string
    isRead: boolean
    createdAt: string
  } | null
  messages?: ConversationMessage[]
}
