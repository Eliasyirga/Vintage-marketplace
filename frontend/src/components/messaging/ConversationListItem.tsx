import { formatRelativeTime } from '../../utils/date'
import type { ConversationItem } from '../../types/conversation'

interface ConversationItemProps {
  conversation: ConversationItem
  isActive: boolean
  currentUserId: string
  onClick: () => void
}

export function ConversationListItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const { otherParty, listing, lastMessage, unreadCount, lastMessageAt } = conversation

  const lastMsgContent = lastMessage
    ? lastMessage.isDeleted
      ? 'Message deleted'
      : lastMessage.content
    : 'No messages yet'

  const isMine = lastMessage?.senderId === currentUserId

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-stone-100 hover:bg-stone-50 ${
        isActive ? 'bg-amber-50 border-l-2 border-l-amber-500' : 'border-l-2 border-l-transparent'
      }`}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        {otherParty.avatarUrl ? (
          <img
            src={otherParty.avatarUrl}
            alt={otherParty.fullName}
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {otherParty.fullName.charAt(0)}
          </div>
        )}
        {otherParty.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-bold truncate ${isActive ? 'text-amber-700' : 'text-stone-900'}`}>
            {otherParty.displayName || otherParty.fullName}
          </p>
          <span className="text-[10px] text-stone-400 flex-shrink-0">
            {formatRelativeTime(lastMessageAt)}
          </span>
        </div>
        <p className="text-[11px] text-stone-400 truncate mt-0.5 leading-tight">
          {listing.title}
        </p>
        <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? 'text-stone-800 font-semibold' : 'text-stone-400'}`}>
          {isMine ? `You: ${lastMsgContent}` : lastMsgContent}
        </p>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
