import { useState } from 'react'
import { X, Flag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportMessage, reportConversation } from '../../services/conversation.service'

const REASONS = [
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'SPAM', label: 'Spam or advertising' },
  { value: 'SCAM', label: 'Scam or fraud attempt' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'OTHER', label: 'Other' },
]

interface ReportChatModalProps {
  conversationId: string
  messageId?: string
  onClose: () => void
}

export function ReportChatModal({ conversationId, messageId, onClose }: ReportChatModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setIsSubmitting(true)
    try {
      if (messageId) {
        await reportMessage(conversationId, messageId, reason, description || undefined)
      } else {
        await reportConversation(conversationId, reason, description || undefined)
      }
      toast.success('Report submitted. Our team will review it shortly.')
      onClose()
    } catch {
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <h3 className="text-base font-extrabold text-stone-900">
              Report {messageId ? 'Message' : 'Conversation'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">Reason *</label>
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  reason === r.value
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="accent-amber-500"
                />
                <span className="text-sm text-stone-700 font-medium">{r.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Additional details (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context…"
              className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3 py-2.5 text-sm text-stone-900 outline-none transition-all resize-none"
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
