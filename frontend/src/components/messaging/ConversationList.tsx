import { useState, useEffect } from 'react'
import { Search, MessageSquarePlus, Loader2 } from 'lucide-react'
import type { ConversationItem } from '../../types/conversation'
import { ConversationListItem } from './ConversationListItem'
import * as convService from '../../services/conversation.service'
import { onNewMessage } from '../../services/socket.service'

interface ConversationListProps {
  currentUserId: string
  activeConversationId: string | null
  onSelect: (conv: ConversationItem) => void
}

export function ConversationList({
  currentUserId,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadConversations = async () => {
    try {
      const data = await convService.getUserConversations()
      setConversations(data)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Re-sort conversation to top when a new message arrives
  useEffect(() => {
    const cleanup = onNewMessage((msg) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.conversationId)
        if (idx === -1) {
          // Unknown conversation — reload the list
          loadConversations()
          return prev
        }
        const updated = { ...prev[idx], lastMessageAt: msg.createdAt }
        // Increment unread if not active
        if (msg.conversationId !== activeConversationId && msg.senderId !== currentUserId) {
          updated.unreadCount = (updated.unreadCount ?? 0) + 1
        }
        updated.lastMessage = {
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          isRead: false,
          isDeleted: msg.isDeleted,
          createdAt: msg.createdAt,
        }
        const rest = prev.filter((_, i) => i !== idx)
        return [updated, ...rest]
      })
    })
    return cleanup
  }, [activeConversationId, currentUserId])

  const filtered = conversations.filter((c) =>
    c.otherParty.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.listing.title.toLowerCase().includes(search.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-stone-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-stone-900">Messages</h2>
          <MessageSquarePlus className="w-4 h-4 text-stone-400" />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-stone-100 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white border border-transparent focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
              <MessageSquarePlus className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-sm font-bold text-stone-600">No conversations yet</p>
            <p className="text-xs text-stone-400 mt-1">
              {search ? 'No results for your search.' : 'Start by contacting a seller from any listing.'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              currentUserId={currentUserId}
              onClick={() => onSelect(conv)}
            />
          ))
        )}
      </div>
    </div>
  )
}
