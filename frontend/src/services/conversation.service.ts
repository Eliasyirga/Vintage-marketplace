import api from './api'
import type { ConversationItem, ConversationMessage } from '../types/conversation'

export async function createOrGetConversation(
  listingId: string,
  sellerId: string,
  message?: string,
): Promise<{ conversationId: string; isNew: boolean }> {
  const res = await api.post('/conversations', {
    listingId,
    sellerId,
    message,
  })
  return res.data.data
}

export async function getUserConversations(): Promise<ConversationItem[]> {
  const res = await api.get('/conversations')
  return res.data.data || []
}

export async function getConversationById(id: string): Promise<ConversationItem> {
  const res = await api.get(`/conversations/${id}`)
  return res.data.data.conversation
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ConversationMessage> {
  const res = await api.post(`/conversations/${conversationId}/messages`, { content })
  return res.data.data.message
}
