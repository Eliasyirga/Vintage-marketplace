import { useState } from 'react'
import { RatingStars } from './RatingStars'
import { createReview } from '../../services/review.service'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  sellerId: string
  sellerName: string
  listingId: string
  listingTitle: string
  onReviewSubmitted?: () => void
}

export function ReviewFormModal({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  listingId,
  listingTitle,
  onReviewSubmitted,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.error('Please write a brief comment.')
      return
    }

    setIsSubmitting(true)
    try {
      await createReview({
        sellerId,
        listingId,
        rating,
        comment: comment.trim(),
      })
      toast.success('Review submitted successfully!')
      onReviewSubmitted?.()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-extrabold text-stone-900">Review Seller</h3>
          <p className="text-xs text-stone-500 mt-1">
            Share your experience buying <span className="font-bold text-amber-700">{listingTitle}</span> from{' '}
            <span className="font-bold text-stone-800">{sellerName}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Picker */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-amber-900">Your Overall Rating</span>
            <RatingStars rating={rating} size="lg" interactive onChange={setRating} />
            <span className="text-xs font-bold text-amber-700">
              {rating === 5 && 'Outstanding (5/5)'}
              {rating === 4 && 'Good (4/5)'}
              {rating === 3 && 'Average (3/5)'}
              {rating === 2 && 'Below Average (2/5)'}
              {rating === 1 && 'Poor (1/5)'}
            </span>
          </div>

          {/* Comment text area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Your Review / Feedback</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the product in the condition described? Was communication clear?"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none font-medium"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
