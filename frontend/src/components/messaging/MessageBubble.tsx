import { useState, useRef } from 'react'
import { Trash2, Flag, MoreVertical } from 'lucide-react'
import type { ConversationMessage } from '../../types/conversation'
import { formatRelativeTime } from '../../utils/date'

interface MessageBubbleProps {
  message: ConversationMessage
  isMine: boolean
  onDelete?: (messageId: string) => void
  onReport?: (messageId: string) => void
}

export function MessageBubble({ message, isMine, onDelete, onReport }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isDeleted = message.isDeleted
  const isSystem = message.messageType === 'SYSTEM'

  // ── System messages centered ───────────────────────────────────────────────
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-end gap-2 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Bubble */}
      <div
        className={`relative max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity ${
          isDeleted
            ? 'bg-stone-100 text-stone-400 italic border border-stone-200'
            : isMine
            ? 'bg-amber-500 text-white rounded-br-sm shadow-sm shadow-amber-500/20'
            : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm shadow-sm'
        }`}
      >
        <p>{isDeleted ? 'This message was deleted.' : message.content}</p>

        {/* Timestamp */}
        <div
          className={`flex items-center gap-1 mt-1 text-[10px] ${
            isMine && !isDeleted ? 'text-amber-100' : 'text-stone-400'
          }`}
        >
          <span>
            {formatRelativeTime(message.createdAt)}
          </span>
          {isMine && !isDeleted && (
            <span>{message.isRead ? '✓✓' : '✓'}</span>
          )}
        </div>
      </div>

      {/* Action Menu */}
      {!isDeleted && (
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity relative"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div
              className={`absolute z-20 bottom-7 ${isMine ? 'right-0' : 'left-0'} bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[130px]`}
            >
              {isMine && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(message.id)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
              {!isMine && onReport && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false)
                    onReport(message.id)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
