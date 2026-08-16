import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { getAdminReviews } from '../../services/admin.service'
import { RatingStars } from '../../components/reviews/RatingStars'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminReviews({ page, limit: 15 })
      setReviews(data.reviews)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
    } catch {
      toast.error('Failed to load reviews.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [page])

  return (
    <AdminLayout title="Review Moderation" subtitle="Inspect marketplace ratings and buyer testimonials">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-xs text-stone-400 font-medium">
            No reviews on record yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Listing</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RatingStars rating={r.rating} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{r.reviewer?.full_name || 'Buyer'}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700">{r.seller?.full_name || 'Seller'}</td>
                    <td className="py-3.5 px-4 text-amber-700 font-bold max-w-xs truncate">{r.listing?.title || 'Listing'}</td>
                    <td className="py-3.5 px-4 text-stone-600 max-w-sm truncate italic">"{r.comment}"</td>
                    <td className="py-3.5 px-4 text-stone-400 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-bold text-stone-600">
              Page {page} of {totalPages} ({totalItems} total reviews)
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
