import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Smartphone,
  Armchair,
  Home,
  Car,
  Shirt,
  BookOpen,
  Dumbbell,
  Wrench,
  Package,
  ArrowRight,
  Search,
  Sparkles,
  Loader2,
  Tag,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { getCategories } from '../services/category.service'
import type { SafeCategory } from '../types/listing'

const iconMap: Record<string, LucideIcon> = {
  electronics: Smartphone,
  furniture: Armchair,
  'home-kitchen': Home,
  home: Home,
  vehicles: Car,
  fashion: Shirt,
  clothing: Shirt,
  books: BookOpen,
  sports: Dumbbell,
  tools: Wrench,
  other: Package,
}

const colorMap: Record<string, { icon: string; bg: string; border: string; glow: string }> = {
  electronics: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-300',
    glow: 'hover:shadow-blue-500/10',
  },
  furniture: {
    icon: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-300',
    glow: 'hover:shadow-amber-500/10',
  },
  'home-kitchen': {
    icon: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'hover:border-rose-300',
    glow: 'hover:shadow-rose-500/10',
  },
  home: {
    icon: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'hover:border-rose-300',
    glow: 'hover:shadow-rose-500/10',
  },
  vehicles: {
    icon: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'hover:border-slate-300',
    glow: 'hover:shadow-slate-500/10',
  },
  fashion: {
    icon: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'hover:border-pink-300',
    glow: 'hover:shadow-pink-500/10',
  },
  clothing: {
    icon: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'hover:border-pink-300',
    glow: 'hover:shadow-pink-500/10',
  },
  books: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-300',
    glow: 'hover:shadow-emerald-500/10',
  },
  sports: {
    icon: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'hover:border-orange-300',
    glow: 'hover:shadow-orange-500/10',
  },
  tools: {
    icon: 'text-stone-600',
    bg: 'bg-stone-100',
    border: 'hover:border-stone-300',
    glow: 'hover:shadow-stone-500/10',
  },
  other: {
    icon: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'hover:border-violet-300',
    glow: 'hover:shadow-violet-500/10',
  },
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<SafeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        console.warn('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase().trim()
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)),
    )
  }, [categories, searchQuery])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 shadow-2xs">
            <Tag className="w-3.5 h-3.5" />
            Marketplace Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            Explore All <span className="text-amber-600">Categories</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Browse through thousands of pre-loved items, vintage collections, electronics, furniture,
            and fashion available from verified sellers across Ethiopia.
          </p>

          {/* Search filter input */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter categories (e.g. Phones, Furniture, Vehicles)..."
              className="w-full bg-white border border-stone-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-all font-medium"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-xs font-bold text-stone-500">Loading marketplace categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No categories found</h3>
            <p className="text-xs text-stone-500">
              No categories matched "{searchQuery}". Try a different keyword or explore all listings.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 inline-block px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {filteredCategories.map((cat) => {
              const slug = cat.slug.toLowerCase()
              const Icon = iconMap[slug] || Package
              const color = colorMap[slug] || colorMap.other

              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?categoryId=${cat.id}`}
                  className={`group bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-stone-200 ${color.border} shadow-2xs hover:shadow-xl ${color.glow} transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 flex flex-col justify-between`}
                >
                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${color.bg} ${color.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xs`}
                      >
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Browse</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-500 font-medium leading-relaxed mt-0.5 sm:mt-1 line-clamp-2">
                        {cat.description ||
                          `Explore authentic used & vintage ${cat.name.toLowerCase()} listings in Ethiopia.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-stone-500">
                    <span className="group-hover:text-stone-800 transition-colors truncate">
                      View items
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Sell CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-500/20">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Have Something to Sell?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Post an item in any category for free
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed font-medium">
              Join thousands of sellers in Addis Ababa and across Ethiopia. It takes less than 2 minutes to publish your listing.
            </p>
          </div>

          <Link
            to="/sell"
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Selling Now</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
