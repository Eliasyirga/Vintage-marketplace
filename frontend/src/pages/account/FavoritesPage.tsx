import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { getMyFavorites, removeFavorite } from '../../services/favorite.service'
import { ListingCard } from '../../components/listings/ListingCard'
import type { FavoriteItem } from '../../types/favorite'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadFavorites = async (targetPage = 1) => {
    setIsLoading(true)
    try {
      const res = await getMyFavorites(targetPage, 20)
      setFavorites(res.data)
      setPage(res.pagination.page)
      setTotalPages(res.pagination.totalPages)
      setTotalItems(res.pagination.totalItems)
    } catch {
      toast.error('Failed to load favorites.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites(page)
  }, [page])

  const handleRemoveFavorite = async (listingId: string) => {
    // Optimistically remove from state
    setFavorites((prev) => prev.filter((item) => item.listing.id !== listingId))
    setTotalItems((prev) => Math.max(0, prev - 1))

    try {
      await removeFavorite(listingId)
      toast.success('Removed from favorites', { icon: '💔' })
    } catch {
      toast.error('Failed to remove favorite.')
      loadFavorites(page)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-red-500" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              My Favorites
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            {totalItems} {totalItems === 1 ? 'saved item' : 'saved items'} in your wishlist
          </p>
        </div>

        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs w-fit"
        >
          <span>Browse More Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-xs font-semibold text-stone-600">Loading your favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-stone-900">
              No items saved yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed font-medium">
              Tap the heart icon on any listing to bookmark items you love and keep track of them here.
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all active:scale-95"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {favorites.map((item) => {
              const isUnavailable =
                item.listing.status !== 'ACTIVE' || !item.listing.publishedAt

              return (
                <div key={item.id} className="relative">
                  <ListingCard
                    listing={item.listing}
                    isFavorite={true}
                    onFavoriteToggle={(isFav) => {
                      if (!isFav) handleRemoveFavorite(item.listing.id)
                    }}
                  />

                  {isUnavailable && (
                    <div className="mt-2 p-2 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-stone-600 font-medium text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Listing no longer active</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(item.listing.id)}
                        className="text-[10px] font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-stone-200">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-stone-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
