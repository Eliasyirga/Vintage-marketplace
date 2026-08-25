import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { blockUser } from '../../services/conversation.service'

interface BlockUserModalProps {
  userId: string
  userName: string
  onClose: () => void
  onBlocked: () => void
}

export function BlockUserModal({ userId, userName, onClose, onBlocked }: BlockUserModalProps) {
  const [isBlocking, setIsBlocking] = useState(false)

  const handleBlock = async () => {
    setIsBlocking(true)
    try {
      await blockUser(userId)
      toast.success(`${userName} has been blocked.`)
      onBlocked()
    } catch {
      toast.error('Failed to block user. Please try again.')
    } finally {
      setIsBlocking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-extrabold text-stone-900 mb-1">Block {userName}?</h3>
        <p className="text-sm text-stone-500 mb-5 leading-relaxed">
          They won't be able to send you messages or start new conversations. You can unblock
          them anytime from your settings.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isBlocking}
            onClick={handleBlock}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isBlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  )
}
