import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Trash2, ArrowRight } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { getRecentlyViewed, clearRecentlyViewed } from '../../services/recentlyViewed.service'
import { ListingCard } from '../listings/ListingCard'
import type { Listing } from '../../types/listing'
import toast from 'react-hot-toast'

interface RecentlyViewedProps {
  limit?: number
  showTitle?: boolean
  className?: string
}

export function RecentlyViewed({
  limit = 8,
  showTitle = true,
  className = '',
}: RecentlyViewedProps) {
  const { isAuthenticated } = useAuthContext()
  const [items, setItems] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isClearing, setIsClearing] = useState<boolean>(false)

  const loadItems = async () => {
    try {
      const data = await getRecentlyViewed(isAuthenticated, limit)
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [isAuthenticated, limit])

  const handleClear = async () => {
    if (!window.confirm('Clear your recently viewed items?')) return

    setIsClearing(true)
    try {
      await clearRecentlyViewed(isAuthenticated)
      setItems([])
      toast.success('Recently viewed history cleared.')
    } catch {
      toast.error('Failed to clear history.')
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading || items.length === 0) {
    return null
  }

  return (
    <section className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                Recently Viewed
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Items you looked at recently
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing}
              className="text-xs font-semibold text-stone-500 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1 border border-stone-200/80"
              title="Clear recently viewed history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear History</span>
            </button>

            <Link
              to="/browse"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 px-2 py-1"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}
