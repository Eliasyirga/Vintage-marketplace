import { useEffect, useState, useCallback } from 'react'
import { getListings } from '../../services/listing.service'
import { getCategories } from '../../services/category.service'
import type { Listing, SafeCategory, ListingCondition } from '../../types/listing'
import { ListingCard } from '../../components/listings/ListingCard'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { Search, Loader2, PackageX, ChevronLeft, ChevronRight } from 'lucide-react'

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<SafeCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [searchCity, setSearchCity] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch {
        // ignore
      }
    }
    loadCategories()
  }, [])

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getListings({
        page,
        limit: 12,
        categoryId: selectedCategory || undefined,
        condition: (selectedCondition as ListingCondition) || undefined,
        city: searchCity || undefined,
      })
      setListings(res.listings)
      setTotalPages(res.pagination.totalPages)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [page, selectedCategory, selectedCondition, searchCity])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Explore Marketplace</h1>
          <p className="text-sm font-medium text-stone-600">
            Browse active listings across Ethiopia by category, condition, or location.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-stone-50/50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-stone-50/50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">All Conditions</option>
                <option value="BRAND_NEW">Brand New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="LIGHTLY_USED">Lightly Used</option>
                <option value="FAIR">Fair Condition</option>
                <option value="HEAVILY_USED">Heavily Used</option>
              </select>
            </div>

            {/* City Search */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">City Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  value={searchCity}
                  onChange={(e) => {
                    setSearchCity(e.target.value)
                    setPage(1)
                  }}
                  className="w-full bg-stone-50/50 focus:bg-white text-stone-900 font-medium rounded-xl pl-9 pr-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-sm font-semibold text-stone-600">Loading marketplace items...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 px-4 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No listings found</h3>
            <p className="text-xs text-stone-500 font-medium">
              Try adjusting your category, condition, or location filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-stone-200">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-sm disabled:opacity-40 hover:bg-stone-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-stone-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-sm disabled:opacity-40 hover:bg-stone-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
