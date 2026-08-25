import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { ListingCard } from '../listings/ListingCard'
import { getListings } from '../../services/listing.service'
import type { Listing } from '../../types/listing'

export default function RecentListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadRecent() {
      try {
        const res = await getListings({ limit: 8, sort: 'newest' })
        if (isMounted && res.listings?.length > 0) {
          setListings(res.listings)
        }
      } catch (err) {
        console.warn('Failed to fetch recent listings:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadRecent()
    return () => {
      isMounted = false
    }
  }, [])

  if (!isLoading && listings.length === 0) {
    return null
  }

  return (
    <section className="py-14 sm:py-16 bg-stone-100/60 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Fresh Market Arrivals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Recently Added
            </h2>
            <p className="text-xs sm:text-sm font-medium text-stone-600 mt-1">
              Explore the latest listings posted by sellers across Ethiopia
            </p>
          </div>

          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors group"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-2xs animate-pulse flex flex-col justify-between"
              >
                <div className="aspect-[4/3] w-full bg-stone-200" />
                <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3.5 sm:h-4 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-4 sm:h-5 bg-stone-200 rounded-md w-1/2" />
                  <div className="pt-1.5 sm:pt-2 border-t border-stone-100 flex justify-between">
                    <div className="h-2.5 sm:h-3 bg-stone-200 rounded w-1/3" />
                    <div className="h-2.5 sm:h-3 bg-stone-200 rounded w-1/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Bottom Load More CTA */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-bold px-6 sm:px-8 py-3 rounded-xl transition-all shadow-2xs hover:border-amber-500 hover:shadow-xs text-xs sm:text-sm"
          >
            <span>Explore All Marketplace Listings</span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </Link>
        </div>
      </div>
    </section>
  )
}
