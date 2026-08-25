import api from './api'
import type { ConversationItem, ConversationMessage, MessagesPage } from '../types/conversation'

// ── Conversation Management ────────────────────────────────────────────────────

export async function createOrGetConversation(
  listingId: string,
  sellerId: string,
  message?: string,
): Promise<{ conversationId: string; isNew: boolean }> {
  const res = await api.post('/conversations', { listingId, sellerId, message })
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

// ── Messages ───────────────────────────────────────────────────────────────────

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit = 30,
): Promise<MessagesPage> {
  const params: Record<string, string | number> = { limit }
  if (cursor) params.cursor = cursor
  const res = await api.get(`/conversations/${conversationId}/messages`, { params })
  return res.data.data
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ConversationMessage> {
  const res = await api.post(`/conversations/${conversationId}/messages`, { content })
  return res.data.data.message
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await api.post(`/conversations/${conversationId}/read`)
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await api.post(`/conversations/${conversationId}/messages/${messageId}/delete`)
}

// ── Reporting ─────────────────────────────────────────────────────────────────

export async function reportMessage(
  conversationId: string,
  messageId: string,
  reason: string,
  description?: string,
): Promise<void> {
  await api.post(`/conversations/${conversationId}/messages/${messageId}/report`, {
    reason,
    description,
  })
}

export async function reportConversation(
  conversationId: string,
  reason: string,
  description?: string,
): Promise<void> {
  await api.post(`/conversations/${conversationId}/report`, { reason, description })
}

// ── Blocking ──────────────────────────────────────────────────────────────────

export async function blockUser(userId: string): Promise<void> {
  await api.post(`/conversations/block/${userId}`)
}

export async function unblockUser(userId: string): Promise<void> {
  await api.delete(`/conversations/block/${userId}`)
}

export async function getBlockedUserIds(): Promise<string[]> {
  const res = await api.get('/conversations/blocked')
  return res.data.data?.blockedIds ?? []
}
