import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, PlusCircle, ArrowRight, Layers, MapPin, ChevronDown, ShieldCheck } from 'lucide-react'
import { categories } from '../../data/categories'

const locations = [
  'Addis Ababa', 'Bole', 'Lideta', 'Yeka', 'Kirkos',
  'Arada', 'Kazanchis', 'Nifas Silk', 'CMC', 'Megenagna',
]

const HERO_STATS = [
  { value: '45K+', label: 'Active Listings' },
  { value: '12K+', label: 'Verified Sellers' },
  { value: '15+', label: 'Cities' },
]

export default function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.append('q', query.trim())
    if (selectedCategory) params.append('category', selectedCategory)
    if (selectedLocation) params.append('location', selectedLocation)
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden">
      {/* ── Background Image with overlay ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
        aria-hidden="true"
      />
      {/* Multi-layer overlay: dark at top for text, fades to amber at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(12,10,9,0.72) 0%, rgba(30,20,10,0.60) 40%, rgba(120,60,10,0.45) 75%, rgba(180,90,15,0.30) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0 lg:pt-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 pb-14 lg:pb-20">

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold shadow-sm">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Digitalizing Ethiopia's Second-Hand Economy</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
            Buy Better.{' '}
            <br className="hidden sm:block" />
            Sell Smarter.{' '}
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-orange-300 drop-shadow-none">
                Make Bonda Digital.
              </span>
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 300 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q75 0 150 4 Q225 8 300 2"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed font-medium">
            Discover quality used products near you — or turn what you no longer need into cash. Trusted by thousands across Ethiopia.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link
              to="/browse"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-amber-900/30 hover:shadow-amber-500/40 text-sm"
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/sell"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/30 font-bold px-8 py-3.5 rounded-xl transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Sell an Item</span>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-0 pt-2">
            {HERO_STATS.map(({ value, label }, i) => (
              <div key={label} className="flex items-center">
                {i > 0 && <div className="w-px h-8 bg-white/20 mx-6 hidden sm:block" />}
                <div className="text-center px-4 sm:px-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-white leading-none drop-shadow">{value}</p>
                  <p className="text-xs text-white/55 font-medium mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white/60 text-xs font-medium">Verified sellers · Secure transactions · Real reviews</span>
          </div>
        </div>

        {/* ── Floating Search Card ── */}
        <div className="max-w-4xl mx-auto relative z-10 -mb-8 lg:-mb-10">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-2xl shadow-stone-900/30 p-2">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Keyword */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search phones, furniture, cars..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all font-medium"
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-3 relative">
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 pr-8 text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-medium"
                  aria-label="Filter by Category"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="sm:col-span-2 relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-xl px-8 py-3 text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer font-medium"
                  aria-label="Filter by Location"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20 text-sm"
                >
                  <Search className="w-4 h-4 sm:hidden" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom fade: photo transitions smoothly into the next section's bg */}
      <div
        className="relative z-10 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, #f8f7f4 100%)' }}
      />
    </section>
  )
}
