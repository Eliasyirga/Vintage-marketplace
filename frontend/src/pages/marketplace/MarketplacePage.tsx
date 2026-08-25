import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getListings } from '../../services/listing.service'
import { getCategories } from '../../services/category.service'
import type { Listing, SafeCategory, ListingCondition, SortOption } from '../../types/listing'
import { ListingCard } from '../../components/listings/ListingCard'
import { RecentlyViewed } from '../../components/recentlyViewed/RecentlyViewed'
import { FeaturedSection } from '../../components/monetization/FeaturedSection'
import { AdvertisementSlot } from '../../components/advertisements/AdvertisementSlot'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useDebounce } from '../../hooks/useDebounce'
import { useAuthContext } from '../../context/AuthContext'
import { trackSearchQuery, trackCategoryInteraction } from '../../services/recommendation.service'
import { RecommendedForYou } from '../../components/recommendations/RecommendedForYou'
import {
  Search,
  SlidersHorizontal,
  X,
  PackageX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpDown,
  Tag,
  MapPin,
  Sparkles,
} from 'lucide-react'

const ETHIOPIAN_CITIES = [
  'Addis Ababa',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Hawassa',
  'Bahir Dar',
  'Dessie',
  'Jimma',
  'Jijiga',
  'Shashamane',
  'Bishoftu',
  'Arba Minch',
  'Harar',
]

const ADDIS_SUB_CITIES = [
  'Addis Ketema',
  'Akaky Kaliti',
  'Arada',
  'Bole',
  'Gullele',
  'Kirkos',
  'Kolfe Keranio',
  'Lideta',
  'Nifas Silk-Lafto',
  'Yeka',
  'Lemi Kura',
]

const CONDITIONS: { value: ListingCondition; label: string }[] = [
  { value: 'BRAND_NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'LIGHTLY_USED', label: 'Lightly Used' },
  { value: 'FAIR', label: 'Fair Condition' },
  { value: 'HEAVILY_USED', label: 'Heavily Used' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_viewed', label: 'Most Viewed' },
]

function ListingSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-2xs animate-pulse flex flex-col justify-between h-full">
      <div>
        <div className="aspect-[4/3] w-full bg-stone-200" />
        <div className="p-2.5 sm:p-3.5 space-y-2">
          <div className="h-3.5 bg-stone-200 rounded-md w-3/4" />
          <div className="h-4 sm:h-5 bg-stone-200 rounded-md w-1/2" />
          <div className="pt-1.5 border-t border-stone-100 flex justify-between gap-1">
            <div className="h-2.5 sm:h-3 bg-stone-200 rounded w-1/3" />
            <div className="h-2.5 sm:h-3 bg-stone-200 rounded w-1/6" />
          </div>
          <div className="pt-1.5 border-t border-stone-100 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-stone-200 flex-shrink-0" />
            <div className="h-2.5 sm:h-3 bg-stone-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthContext()

  // Categories from database
  const [categories, setCategories] = useState<SafeCategory[]>([])

  // State from URL
  const querySearch = searchParams.get('search') || searchParams.get('q') || ''
  const queryCategory = searchParams.get('categoryId') || ''
  const queryCondition = (searchParams.get('condition') as ListingCondition) || ''
  const queryCity = searchParams.get('city') || ''
  const querySubCity = searchParams.get('subCity') || ''
  const queryNeighborhood = searchParams.get('neighborhood') || ''
  const queryMinPrice = searchParams.get('minPrice') || ''
  const queryMaxPrice = searchParams.get('maxPrice') || ''
  const querySort = (searchParams.get('sort') as SortOption) || 'newest'
  const queryPage = parseInt(searchParams.get('page') || '1', 10)

  // Local input state for search & price (debounced)
  const [searchInput, setSearchInput] = useState(querySearch)
  const debouncedSearch = useDebounce(searchInput, 400)

  const [minPriceInput, setMinPriceInput] = useState(queryMinPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(queryMaxPrice)

  // Results state
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Load categories once
  useEffect(() => {
    async function loadCats() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch {
        // ignore
      }
    }
    loadCats()
  }, [])

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== querySearch) {
      updateUrlParam('search', debouncedSearch || null, true)
    }
  }, [debouncedSearch])

  // Sync external URL changes back to search input
  useEffect(() => {
    setSearchInput(querySearch)
  }, [querySearch])

  useEffect(() => {
    setMinPriceInput(queryMinPrice)
  }, [queryMinPrice])

  useEffect(() => {
    setMaxPriceInput(queryMaxPrice)
  }, [queryMaxPrice])

  // Update a single URL query param and optionally reset page
  const updateUrlParam = useCallback(
    (key: string, value: string | null, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          // Clean legacy 'q' if setting 'search'
          if (key === 'search') next.delete('q')

          if (value !== null && value !== '' && value !== undefined) {
            next.set(key, value)
          } else {
            next.delete(key)
          }

          if (resetPage) {
            next.set('page', '1')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Fetch listings whenever URL params change
  const fetchListingsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const minP = queryMinPrice ? parseFloat(queryMinPrice) : undefined
      const maxP = queryMaxPrice ? parseFloat(queryMaxPrice) : undefined

      const res = await getListings({
        page: queryPage,
        limit: 20,
        search: querySearch || undefined,
        categoryId: queryCategory || undefined,
        condition: queryCondition || undefined,
        city: queryCity || undefined,
        subCity: querySubCity || undefined,
        neighborhood: queryNeighborhood || undefined,
        minPrice: !isNaN(minP as number) ? minP : undefined,
        maxPrice: !isNaN(maxP as number) ? maxP : undefined,
        sort: querySort,
      })

      setListings(res.listings)
      setTotalPages(res.pagination.totalPages)
      setTotalItems(res.pagination.totalItems ?? res.pagination.total ?? 0)

      // Track search/category signals after results load (not per keystroke)
      if (isAuthenticated) {
        if (querySearch?.trim()) {
          trackSearchQuery(querySearch).catch(() => {})
        }
        if (queryCategory) {
          trackCategoryInteraction(queryCategory).catch(() => {})
        }
      }
    } catch {
      setListings([])
      setTotalPages(1)
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }, [
    queryPage,
    querySearch,
    queryCategory,
    queryCondition,
    queryCity,
    querySubCity,
    queryNeighborhood,
    queryMinPrice,
    queryMaxPrice,
    querySort,
    isAuthenticated,
  ])

  useEffect(() => {
    fetchListingsData()
  }, [fetchListingsData])

  // Clear all filters
  const handleClearAll = () => {
    setSearchInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setSearchParams(new URLSearchParams({ page: '1', sort: 'newest' }), { replace: true })
    setMobileDrawerOpen(false)
  }

  // Active filter count and list for chips
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []

    if (querySearch) {
      chips.push({
        key: 'search',
        label: `"${querySearch}"`,
        onRemove: () => {
          setSearchInput('')
          updateUrlParam('search', null)
        },
      })
    }

    if (queryCategory) {
      const cat = categories.find((c) => c.id === queryCategory)
      chips.push({
        key: 'category',
        label: cat ? cat.name : 'Category',
        onRemove: () => updateUrlParam('categoryId', null),
      })
    }

    if (queryCondition) {
      const cond = CONDITIONS.find((c) => c.value === queryCondition)
      chips.push({
        key: 'condition',
        label: cond ? cond.label : queryCondition,
        onRemove: () => updateUrlParam('condition', null),
      })
    }

    if (queryCity) {
      chips.push({
        key: 'city',
        label: queryCity,
        onRemove: () => {
          updateUrlParam('city', null)
          updateUrlParam('subCity', null)
        },
      })
    }

    if (querySubCity) {
      chips.push({
        key: 'subCity',
        label: querySubCity,
        onRemove: () => updateUrlParam('subCity', null),
      })
    }

    if (queryNeighborhood) {
      chips.push({
        key: 'neighborhood',
        label: queryNeighborhood,
        onRemove: () => updateUrlParam('neighborhood', null),
      })
    }

    if (queryMinPrice || queryMaxPrice) {
      const minText = queryMinPrice ? `${Number(queryMinPrice).toLocaleString()} ETB` : '0 ETB'
      const maxText = queryMaxPrice ? `${Number(queryMaxPrice).toLocaleString()} ETB` : 'Any'
      chips.push({
        key: 'price',
        label: `${minText} – ${maxText}`,
        onRemove: () => {
          setMinPriceInput('')
          setMaxPriceInput('')
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            next.delete('minPrice')
            next.delete('maxPrice')
            next.set('page', '1')
            return next
          })
        },
      })
    }

    return chips
  }, [
    querySearch,
    queryCategory,
    queryCondition,
    queryCity,
    querySubCity,
    queryNeighborhood,
    queryMinPrice,
    queryMaxPrice,
    categories,
    updateUrlParam,
    setSearchParams,
  ])

  // Handle Price form apply
  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (minPriceInput.trim()) {
        next.set('minPrice', minPriceInput.trim())
      } else {
        next.delete('minPrice')
      }
      if (maxPriceInput.trim()) {
        next.set('maxPrice', maxPriceInput.trim())
      } else {
        next.delete('maxPrice')
      }
      next.set('page', '1')
      return next
    })
  }

  // Filter content component for reuse in Desktop Sidebar & Mobile Drawer
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          Category
        </label>
        <select
          value={queryCategory}
          onChange={(e) => updateUrlParam('categoryId', e.target.value || null)}
          className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
          Price Range (ETB)
        </label>
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700 text-xs font-bold transition-colors"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Condition */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Condition
        </label>
        <select
          value={queryCondition}
          onChange={(e) => updateUrlParam('condition', e.target.value || null)}
          className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
        >
          <option value="">All Conditions</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location (City & Sub-City) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          Location
        </label>

        <div>
          <select
            value={queryCity}
            onChange={(e) => {
              updateUrlParam('city', e.target.value || null)
              if (!e.target.value) {
                updateUrlParam('subCity', null)
              }
            }}
            className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          >
            <option value="">All Cities</option>
            {ETHIOPIAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {queryCity === 'Addis Ababa' && (
          <div>
            <select
              value={querySubCity}
              onChange={(e) => updateUrlParam('subCity', e.target.value || null)}
              className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3.5 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            >
              <option value="">All Sub-Cities</option>
              {ADDIS_SUB_CITIES.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Neighborhood (e.g. Atlas)"
            value={queryNeighborhood}
            onChange={(e) => updateUrlParam('neighborhood', e.target.value || null)}
            className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-3.5 py-2 text-xs border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Top Header & Search Bar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Vintage <span className="text-amber-600">Marketplace</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                Discover quality pre-owned products across Ethiopia from verified local sellers.
              </p>
            </div>

            <Link
              to="/sell"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors shadow-sm self-start md:self-auto"
            >
              Sell an Item
            </Link>
          </div>

          {/* Search Bar & Mobile Filter Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search used products (e.g. Samsung S23, Laptop)..."
                className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-2xl pl-10 sm:pl-12 pr-9 sm:pr-10 py-2.5 sm:py-3.5 text-xs sm:text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    updateUrlParam('search', null)
                  }}
                  className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs sm:text-sm font-bold transition-colors relative flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-600 text-white text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Featured Spotlight Products */}
          <FeaturedSection />
        </div>

        {/* Main Grid: Sidebar (Desktop) + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar (1 col) */}
          <div className="hidden lg:block bg-white border border-stone-200 rounded-3xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 font-black text-stone-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                Filters
              </div>
              {activeFilters.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            <FilterControls />

            {/* Desktop Sidebar Sponsored Placement (MARKETPLACE_SIDEBAR) */}
            <div className="pt-6 mt-6 border-t border-stone-100">
              <AdvertisementSlot placement="MARKETPLACE_SIDEBAR" />
            </div>
          </div>

          {/* Results Area (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar: Result Count & Sort Selector */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-bold text-stone-700">
                {isLoading ? (
                  <span className="text-stone-400">Searching listings...</span>
                ) : (
                  <span>
                    <strong className="text-stone-900 text-base">{totalItems}</strong> item
                    {totalItems !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Sort:
                </span>
                <select
                  value={querySort}
                  onChange={(e) => updateUrlParam('sort', e.target.value as SortOption, false)}
                  className="bg-stone-50 text-stone-900 text-xs font-bold rounded-xl px-3 py-1.5 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-bold text-stone-400">Active Filters:</span>
                {activeFilters.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full shadow-2xs"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="hover:bg-amber-200/60 p-0.5 rounded-full text-amber-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-bold text-stone-500 hover:text-stone-900 ml-1 underline"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Listings Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {[...Array(6)].map((_, i) => (
                  <ListingSkeleton key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              /* Empty Search Results */
              <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-4 max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
                  <PackageX className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-stone-900">No items found</h2>
                <p className="text-xs text-stone-500 font-medium">
                  Try changing your search keywords or removing some filters to see more results.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {listings.slice(0, Math.min(listings.length, 6)).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}

                {/* In-Feed Sponsored Placement (MARKETPLACE_FEATURED) */}
                <div className="col-span-2 sm:col-span-2 md:col-span-3 xl:col-span-3 2xl:col-span-4">
                  <AdvertisementSlot placement="MARKETPLACE_FEATURED" />
                </div>

                {listings.slice(6).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 mt-6">
                <button
                  disabled={queryPage <= 1}
                  onClick={() => updateUrlParam('page', String(Math.max(queryPage - 1, 1)), false)}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-sm disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs font-bold text-stone-600">
                  Page {queryPage} of {totalPages}
                </span>

                <button
                  disabled={queryPage >= totalPages}
                  onClick={() =>
                    updateUrlParam('page', String(Math.min(queryPage + 1, totalPages)), false)
                  }
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-sm disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Catalog Bottom Spotlight (MARKETPLACE_BANNER) */}
            <div className="pt-6">
              <AdvertisementSlot placement="MARKETPLACE_BANNER" />
            </div>

            {/* Recommendations */}
            <div className="pt-10 border-t border-stone-200 mt-10 space-y-10">
              <RecommendedForYou limit={8} maxItems={8} />
              <RecentlyViewed limit={6} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-stone-900/50 backdrop-blur-xs">
          <div
            className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                Marketplace Filters
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterControls />

            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
