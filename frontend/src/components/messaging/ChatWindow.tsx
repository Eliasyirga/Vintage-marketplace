import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft,
  MoreVertical,
  ShieldOff,
  Flag,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import type {
  ConversationItem,
  ConversationMessage,
  TypingEvent,
  ReadEvent,
  MessageDeletedEvent,
} from '../../types/conversation'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ListingContextCard } from './ListingContextCard'
import { TypingIndicator } from './TypingIndicator'
import { BlockUserModal } from './BlockUserModal'
import { ReportChatModal } from './ReportChatModal'
import * as convService from '../../services/conversation.service'
import {
  joinConversation,
  leaveConversation,
  onNewMessage,
  onTypingStart,
  onTypingStop,
  onMessageRead,
  onMessageDeleted,
  onPresenceOnline,
  onPresenceOffline,
} from '../../services/socket.service'
import toast from 'react-hot-toast'

const MESSAGES_PER_PAGE = 30

interface ChatWindowProps {
  conversation: ConversationItem
  currentUserId: string
  onBack?: () => void
}

export function ChatWindow({ conversation, currentUserId, onBack }: ChatWindowProps) {
  const otherParty = conversation?.otherParty || {
    id: '',
    fullName: 'User',
    displayName: null,
    avatarUrl: null,
    isOnline: false,
  }
  const convId = conversation?.id || ''

  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isOtherOnline, setIsOtherOnline] = useState(otherParty.isOnline)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [reportMessageId, setReportMessageId] = useState<string | null>(null)
  const [showReportConv, setShowReportConv] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }

  // Load initial messages
  useEffect(() => {
    let cancelled = false
    setIsInitialLoading(true)
    setMessages([])
    setCursor(null)
    setHasMore(false)

    convService.getMessages(convId, undefined, MESSAGES_PER_PAGE).then((data) => {
      if (cancelled) return
      setMessages(data.messages)
      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
      setIsInitialLoading(false)
      setTimeout(() => scrollToBottom('instant'), 50)
    }).catch(() => {
      if (!cancelled) setIsInitialLoading(false)
    })

    // Mark as read
    convService.markConversationRead(convId).catch(() => {})

    return () => { cancelled = true }
  }, [convId])

  // Join/leave socket room
  useEffect(() => {
    joinConversation(convId)
    return () => leaveConversation(convId)
  }, [convId])

  // Real-time: new message
  useEffect(() => {
    const cleanup = onNewMessage((msg) => {
      if (msg.conversationId !== convId) return
      setMessages((prev) => {
        // Deduplicate
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      setTimeout(() => scrollToBottom('smooth'), 50)
      // Mark read
      if (msg.senderId !== currentUserId) {
        convService.markConversationRead(convId).catch(() => {})
      }
    })
    return cleanup
  }, [convId, currentUserId])

  // Real-time: typing
  useEffect(() => {
    const cleanStart = onTypingStart((ev: TypingEvent) => {
      if (ev.conversationId !== convId || ev.userId === currentUserId) return
      setIsOtherTyping(true)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setIsOtherTyping(false), 3000)
    })
    const cleanStop = onTypingStop((ev: TypingEvent) => {
      if (ev.conversationId !== convId || ev.userId === currentUserId) return
      setIsOtherTyping(false)
    })
    return () => { cleanStart(); cleanStop() }
  }, [convId, currentUserId])

  // Real-time: read receipts
  useEffect(() => {
    const cleanup = onMessageRead((ev: ReadEvent) => {
      if (ev.conversationId !== convId || ev.userId === currentUserId) return
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })))
    })
    return cleanup
  }, [convId, currentUserId])

  // Real-time: message deleted
  useEffect(() => {
    const cleanup = onMessageDeleted((ev: MessageDeletedEvent) => {
      if (ev.conversationId !== convId) return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === ev.messageId
            ? { ...m, isDeleted: true, content: 'This message was deleted.' }
            : m,
        ),
      )
    })
    return cleanup
  }, [convId])

  // Sync presence initial state
  useEffect(() => {
    setIsOtherOnline(otherParty.isOnline ?? false)
  }, [otherParty.isOnline])

  // Real-time: presence
  useEffect(() => {
    if (!otherParty.id) return
    const cleanOnline = onPresenceOnline((ev) => {
      if (ev.userId === otherParty.id) setIsOtherOnline(true)
    })
    const cleanOffline = onPresenceOffline((ev) => {
      if (ev.userId === otherParty.id) setIsOtherOnline(false)
    })
    return () => { cleanOnline(); cleanOffline() }
  }, [otherParty.id])

  // Load more (older messages)
  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || isLoadingMore) return
    setIsLoadingMore(true)
    const prevScrollHeight = scrollRef.current?.scrollHeight ?? 0

    try {
      const data = await convService.getMessages(convId, cursor, MESSAGES_PER_PAGE)
      setMessages((prev) => [...data.messages, ...prev])
      setHasMore(data.hasMore)
      setCursor(data.nextCursor)

      // Maintain scroll position after prepend
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevScrollHeight
        }
      })
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false)
    }
  }, [convId, cursor, hasMore, isLoadingMore])

  // Infinite scroll on top
  const handleScroll = useCallback(() => {
    if (scrollRef.current && scrollRef.current.scrollTop < 100) {
      loadMore()
    }
  }, [loadMore])

  const handleSend = async (content: string) => {
    // Optimistic insert
    const tempId = `temp-${Date.now()}`
    const optimistic: ConversationMessage = {
      id: tempId,
      conversationId: convId,
      senderId: currentUserId,
      content,
      messageType: 'TEXT',
      isRead: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setTimeout(() => scrollToBottom('smooth'), 30)

    try {
      const saved = await convService.sendMessage(convId, content)
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)))
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error(err?.response?.data?.message || 'Failed to send message.')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await convService.deleteMessage(convId, messageId)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted.' } : m,
        ),
      )
    } catch {
      toast.error('Failed to delete message.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white flex-shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full text-stone-500 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {otherParty.avatarUrl ? (
            <img
              src={otherParty.avatarUrl}
              alt={otherParty.fullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {otherParty.fullName.charAt(0)}
            </div>
          )}
          {isOtherOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-stone-900 truncate leading-tight">
            {otherParty.displayName || otherParty.fullName}
          </p>
          <p className="text-[10px] text-stone-400 leading-tight">
            {isOtherOnline ? (
              <span className="text-emerald-500 font-semibold">Online</span>
            ) : (
              'Offline'
            )}
          </p>
        </div>

        {/* Listing card */}
        <div className="hidden sm:block max-w-[180px] flex-shrink-0">
          <ListingContextCard listing={conversation.listing} />
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-9 z-20 bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[160px]">
              <button
                type="button"
                onClick={() => { setShowMenu(false); setShowReportConv(true) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" /> Report conversation
              </button>
              <button
                type="button"
                onClick={() => { setShowMenu(false); setShowBlock(true) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <ShieldOff className="w-3.5 h-3.5" /> Block user
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Listing card mobile */}
      <div className="sm:hidden px-3 py-2 border-b border-stone-200 bg-stone-50 flex-shrink-0">
        <ListingContextCard listing={conversation.listing} />
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50/60"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          </div>
        )}

        {hasMore && !isLoadingMore && (
          <button
            type="button"
            onClick={loadMore}
            className="w-full text-center text-xs text-amber-600 hover:text-amber-500 font-semibold py-2"
          >
            Load earlier messages
          </button>
        )}

        {isInitialLoading ? (
          <div className="flex justify-center items-center h-full py-20">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-200 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-sm font-bold text-stone-500">No messages yet</p>
            <p className="text-xs text-stone-400 mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUserId}
              onDelete={msg.senderId === currentUserId ? handleDeleteMessage : undefined}
              onReport={msg.senderId !== currentUserId ? (id) => setReportMessageId(id) : undefined}
            />
          ))
        )}

        {isOtherTyping && (
          <TypingIndicator senderName={otherParty.fullName} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        conversationId={convId}
        onSend={handleSend}
      />

      {/* Modals */}
      {showBlock && (
        <BlockUserModal
          userId={otherParty.id}
          userName={otherParty.fullName}
          onClose={() => setShowBlock(false)}
          onBlocked={() => { setShowBlock(false) }}
        />
      )}
      {showReportConv && (
        <ReportChatModal
          conversationId={convId}
          onClose={() => setShowReportConv(false)}
        />
      )}
      {reportMessageId && (
        <ReportChatModal
          conversationId={convId}
          messageId={reportMessageId}
          onClose={() => setReportMessageId(null)}
        />
      )}
    </div>
  )
}
