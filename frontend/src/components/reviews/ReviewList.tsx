import { useState } from 'react'
import { RatingStars } from './RatingStars'
import type { ReviewItem, RatingSummary } from '../../types/review'
import { MoreVertical, Flag, ChevronLeft, ChevronRight, MessageSquare, Star } from 'lucide-react'

interface ReviewListProps {
  reviews: ReviewItem[]
  summary?: RatingSummary | null
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onReportReview?: (reviewId: string) => void
}

export function ReviewList({
  reviews,
  summary,
  currentPage,
  totalPages,
  onPageChange,
  onReportReview,
}: ReviewListProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Rating Summary Breakdown */}
      {summary && summary.totalReviews > 0 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 text-center md:border-r md:border-stone-100 md:pr-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
              <span>{summary.avgRating.toFixed(1)}</span>
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xs font-bold text-stone-600">
              Based on {summary.totalReviews} verified review{summary.totalReviews !== 1 ? 's' : ''}
            </p>
            <div className="flex justify-center pt-1">
              <RatingStars rating={summary.avgRating} size="md" />
            </div>
          </div>

          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.distribution[stars as keyof typeof summary.distribution] || 0
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0

              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-stone-600">
                  <span className="w-12 flex items-center gap-1 font-bold text-stone-800">
                    {stars} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-stone-400 text-[11px] font-medium">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviews Stream */}
      {reviews.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-stone-800">No reviews yet</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            This seller has not received any buyer reviews yet. Reviews from completed transactions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3 relative transition-all hover:border-amber-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {rev.reviewer.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-stone-900">{rev.reviewer.displayName}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RatingStars rating={rev.rating} size="sm" />
                      <span className="text-[10px] text-stone-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Report Review Trigger */}
                {onReportReview && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === rev.id ? null : rev.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      aria-label="Review options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenuId === rev.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-20 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null)
                            onReportReview(rev.id)
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Report Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {rev.listing && (
                <div className="text-[11px] font-semibold text-amber-700 bg-amber-50/60 border border-amber-200/50 px-2.5 py-1 rounded-lg inline-block">
                  Purchased: {rev.listing.title}
                </div>
              )}

              <p className="text-xs text-stone-700 leading-relaxed font-medium">"{rev.comment}"</p>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-stone-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
