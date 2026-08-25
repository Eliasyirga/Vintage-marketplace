import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, PlusCircle, ArrowRight, Layers, MapPin, ChevronDown,
  ShieldCheck, TrendingUp, Smartphone, Armchair, Sparkles,
} from 'lucide-react'
import { categories } from '../../data/categories'

const locations = [
  'Addis Ababa', 'Bole', 'Lideta', 'Yeka', 'Kirkos',
  'Arada', 'Kazanchis', 'Nifas Silk', 'CMC', 'Megenagna',
]

const HERO_STATS = [
  { value: '45K+', label: 'Active Listings', accent: 'text-amber-600' },
  { value: '12K+', label: 'Verified Sellers', accent: 'text-emerald-600' },
  { value: '15+', label: 'Cities', accent: 'text-sky-600' },
]

const POPULAR_SEARCHES = ['iPhone', 'Sofa', 'Toyota', 'Laptop', 'Fridge']

const FLOATING_ITEMS = [
  {
    title: 'iPhone 13 Pro',
    price: '42,000 ETB',
    location: 'Bole',
    icon: Smartphone,
    iconBg: 'bg-blue-50 text-blue-600',
    rotation: '-rotate-3',
    offset: 'top-4 right-4 lg:right-8',
    animation: 'hero-float',
  },
  {
    title: 'Vintage Armchair',
    price: '8,500 ETB',
    location: 'Kazanchis',
    icon: Armchair,
    iconBg: 'bg-amber-50 text-amber-700',
    rotation: 'rotate-2',
    offset: 'bottom-8 right-16 lg:right-24',
    animation: 'hero-float-delayed',
  },
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

  const handlePopularSearch = (term: string) => {
    navigate(`/browse?q=${encodeURIComponent(term)}`)
  }

  return (
    <section className="relative overflow-hidden min-h-[88vh] lg:min-h-[92vh] flex flex-col bg-white">
      {/* ── Bright background ── */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50/80"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(251,191,36,0.18)_0%,transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(253,186,116,0.22)_0%,transparent_50%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(254,243,199,0.5)_0%,transparent_60%)]"
        aria-hidden="true"
      />

      {/* Soft ambient orbs */}
      <div
        className="hero-glow-orb absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="hero-glow-orb absolute bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-orange-200/35 blur-3xl pointer-events-none"
        style={{ animationDelay: '2s' }}
        aria-hidden="true"
      />

      {/* ── Main content grid ── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-0 lg:pt-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[60vh] lg:min-h-0">

          {/* Left: copy + CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 lg:space-y-7">

            {/* Pill badge */}
            <div className="hero-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200/80 text-amber-900 text-xs font-bold shadow-sm shadow-amber-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Digitalizing Ethiopia's Second-Hand Economy</span>
            </div>

            {/* Headline */}
            <h1 className="hero-fade-up-delay-1 text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold text-stone-900 tracking-tight leading-[1.08]">
              Buy Better.{' '}
              <br className="hidden sm:block" />
              Sell Smarter.{' '}
              <span className="relative inline-block mt-1">
                <span className="hero-shimmer-text bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500">
                  Make Bonda Digital.
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2"
                  viewBox="0 0 300 8"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 6 Q75 0 150 4 Q225 8 300 2"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p className="hero-fade-up-delay-2 text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Discover quality used products near you — or turn what you no longer need into cash. Trusted by thousands across Ethiopia.
            </p>

            {/* CTAs */}
            <div className="hero-fade-up-delay-3 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 pt-1">
              <Link
                to="/browse"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-200 hover:shadow-amber-300/60 hover:-translate-y-0.5 text-sm"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/sell"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-stone-800 border border-stone-200 hover:border-amber-300 font-bold px-8 py-3.5 rounded-2xl transition-all text-sm shadow-sm hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Sell an Item</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-fade-up-delay-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2">
              {HERO_STATS.map(({ value, label, accent }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-stone-200/80 shadow-md shadow-stone-200/50"
                >
                  <p className={`text-lg sm:text-2xl font-extrabold leading-none ${accent}`}>{value}</p>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 font-semibold uppercase tracking-wide leading-tight max-w-[64px] sm:max-w-[72px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="hero-fade-up-delay-5 flex items-center justify-center lg:justify-start gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-xs font-semibold">Verified & Secure</span>
              </div>
              <span className="text-stone-500 text-xs font-medium hidden sm:inline">· Real reviews · Local meetups</span>
            </div>
          </div>

          {/* Right: floating product cards (desktop only) */}
          <div className="hidden lg:block lg:col-span-5 relative h-[420px]" aria-hidden="true">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Decorative rings */}
              <div className="absolute w-72 h-72 rounded-full border border-amber-200/60 bg-white/60 backdrop-blur-sm shadow-inner shadow-amber-100/50" />
              <div className="absolute w-52 h-52 rounded-full border border-amber-300/40 bg-amber-50/50" />

              {/* Center sparkle badge */}
              <div className="absolute z-10 flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-200">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-stone-700 text-xs font-bold shadow-sm">
                  <TrendingUp className="w-3 h-3 text-amber-600" />
                  <span>Trending near you</span>
                </div>
              </div>

              {/* Floating listing cards */}
              {FLOATING_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={`absolute ${item.offset} ${item.animation} ${item.rotation}`}
                  >
                    <div className="w-52 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xl shadow-stone-200/60">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-stone-900 truncate">{item.title}</p>
                          <p className="text-xs font-extrabold text-amber-600 mt-0.5">{item.price}</p>
                          <p className="text-[10px] text-stone-500 font-medium mt-1 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {item.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Search card ── */}
        <div className="hero-fade-up-delay-5 max-w-4xl mx-auto relative z-10 -mb-8 lg:-mb-10 mt-6 lg:mt-0">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-200/60 overflow-hidden">
            {/* Search header strip */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Find your next deal</span>
            </div>

            <div className="p-2">
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Keyword */}
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search phones, furniture, cars..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-medium"
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-3 relative">
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 pr-8 text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer font-medium"
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
                    className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-xl px-8 py-3 text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer font-medium"
                    aria-label="Filter by Location"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Search button */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-amber-200 text-sm"
                  >
                    <Search className="w-4 h-4 sm:hidden" />
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Popular searches */}
              <div className="flex flex-wrap items-center gap-2 px-1 pt-2 pb-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Popular:</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePopularSearch(term)}
                    className="text-xs font-semibold text-stone-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 hover:border-amber-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave into next section */}
      <div className="relative z-10 mt-auto" aria-hidden="true">
        <svg className="w-full h-12 sm:h-16 text-white" viewBox="0 0 1440 48" preserveAspectRatio="none" fill="currentColor">
          <path d="M0 48V24C240 0 480 0 720 24C960 48 1200 48 1440 24V48H0Z" />
        </svg>
      </div>
    </section>
  )
}
