import { useState, useEffect } from 'react'
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Listing } from '../../types/listing'
import * as monetizationService from '../../services/monetization.service'
import { ListingCard } from '../listings/ListingCard'

export function FeaturedSection() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    monetizationService
      .getFeaturedProducts(6)
      .then((data) => setListings(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    )
  }

  if (listings.length === 0) return null

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-amber-500/10 via-stone-900/40 to-stone-900/20 border border-amber-500/20 rounded-3xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Featured Products</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Spotlight
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Hand-picked and verified promotions from top marketplace sellers
            </p>
          </div>
        </div>

        <Link
          to="/browse"
          className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition group"
        >
          <span>Explore All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative z-10">
        {listings.map((item) => (
          <div key={item.id} className="relative group">
            <div className="absolute top-2 left-2 z-20 bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 pointer-events-none">
              <Sparkles className="w-2.5 h-2.5" />
              <span>FEATURED</span>
            </div>
            <ListingCard listing={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
