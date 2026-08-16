import React, { useState } from 'react'
import {
  Phone,
  Send,
  X,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { createOrGetConversation } from '../../services/conversation.service'
import { useNavigate } from 'react-router-dom'
import type { Listing } from '../../types/listing'
import toast from 'react-hot-toast'

interface ContactSellerModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
}

const QUICK_MESSAGES = [
  'Is this item still available?',
  'What is your final price for this?',
  'Can I inspect this item today?',
  'Are you available to meet near Bole / Atlas?',
]

export function ContactSellerModal({
  listing,
  isOpen,
  onClose,
}: ContactSellerModalProps) {
  const { user, isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const [messageText, setMessageText] = useState(QUICK_MESSAGES[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  if (!isOpen) return null

  const isOwner = user?.id === listing.seller.id

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Please sign in to contact the seller.')
      navigate('/login')
      return
    }

    if (isOwner) {
      toast.error('You cannot message yourself about your own listing.')
      return
    }

    if (!messageText.trim()) {
      toast.error('Please enter a message.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await createOrGetConversation(
        listing.id,
        listing.seller.id,
        messageText.trim(),
      )
      toast.success(res.isNew ? 'Conversation started!' : 'Message sent!')
      onClose()
      navigate(`/messages?conversationId=${res.conversationId}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start conversation.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close contact modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Contact Seller
          </span>
          <h2 className="text-xl font-extrabold text-stone-900">
            Inquire about this listing
          </h2>
        </div>

        {/* Listing preview pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <img
            src={listing.images?.[0]?.url || '/placeholder.png'}
            alt={listing.title}
            className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-stone-900 truncate">
              {listing.title}
            </h4>
            <p className="text-sm font-extrabold text-amber-600">
              {Number(listing.price).toLocaleString('en-US')} ETB
            </p>
            <p className="text-[11px] text-stone-500 truncate">
              {listing.city} {listing.subCity ? `• ${listing.subCity}` : ''}
            </p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60">
          <div className="flex items-center gap-2.5">
            {listing.seller.avatarUrl ? (
              <img
                src={listing.seller.avatarUrl}
                alt={listing.seller.fullName}
                className="w-10 h-10 rounded-full object-cover border border-amber-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-sm">
                {listing.seller.fullName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-stone-900">
                {listing.seller.fullName}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Marketplace Seller</span>
              </div>
            </div>
          </div>
        </div>

        {/* Self-messaging warning if owner */}
        {isOwner && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>This is your own listing. You cannot send inquiries to yourself.</span>
          </div>
        )}

        {!isAuthenticated && (
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-center space-y-3">
            <p className="text-xs text-stone-600 font-medium">
              Please sign in to send messages and connect with this seller securely.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/login')
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/register')
                }}
                className="px-5 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-50"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Messaging Form */}
        {isAuthenticated && !isOwner && (
          <form onSubmit={handleSendMessage} className="space-y-4">
            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Quick Questions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_MESSAGES.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageText(msg)}
                    className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all text-left font-medium ${
                      messageText === msg
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800">
                Your Message
              </label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your inquiry or question to the seller..."
                className="w-full bg-stone-50 focus:bg-white text-stone-900 rounded-2xl p-3.5 text-xs font-medium border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Starting Conversation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {/* Call option toggle (if phone verified) */}
              {listing.seller.isPhoneVerified && (
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-stone-200"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{showPhone ? 'Hide Call Info' : 'Call Seller'}</span>
                </button>
              )}
            </div>

            {showPhone && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs space-y-1 animate-in fade-in duration-150">
                <p className="font-bold text-emerald-900">
                  Seller has verified phone support
                </p>
                <p className="text-stone-600 text-[11px]">
                  Please initiate a chat inquiry first to confirm availability before calling.
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
