import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Crown } from 'lucide-react'
import { ListingCard } from '../listings/ListingCard'
import { getListings } from '../../services/listing.service'
import type { Listing } from '../../types/listing'

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadFeatured() {
      try {
        const res = await getListings({ limit: 5, sort: 'most_viewed' })
        if (isMounted && res.listings?.length > 0) {
          setListings(res.listings)
        }
      } catch (err) {
        console.warn('Failed to fetch featured listings:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadFeatured()
    return () => {
      isMounted = false
    }
  }, [])

  if (!isLoading && listings.length === 0) {
    return null
  }

  const [featured, ...rest] = listings

  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(253,186,116,0.1) 0%, transparent 40%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Deals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm font-medium text-stone-600 mt-2 max-w-lg">
              Top quality items verified and available right now in Addis Ababa
            </p>
          </div>

          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-200 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <div className="col-span-2 row-span-2 rounded-2xl bg-stone-100 border border-stone-200 animate-pulse aspect-[4/3] lg:aspect-auto lg:min-h-[420px]" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-5 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 auto-rows-fr">
            {featured && (
              <div className="col-span-2 row-span-2 relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/40 via-amber-300/20 to-orange-400/30 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative h-full">
                  <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-lg">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Top Pick</span>
                  </div>
                  <div className="h-full [&>div]:h-full [&>div]:shadow-lg [&>div]:border-amber-200/80 [&_img]:lg:aspect-[16/10]">
                    <ListingCard listing={featured} />
                  </div>
                </div>
              </div>
            )}
            {rest.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
