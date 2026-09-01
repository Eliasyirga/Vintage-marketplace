import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, PlusCircle, ArrowRight, MapPin, ChevronDown,
  ShieldCheck, TrendingUp, Smartphone, Armchair, Sparkles,
  CheckCircle2, Laptop, Car, Shirt, Home, Zap, Star
} from 'lucide-react'
import { categories } from '../../data/categories'

const locations = [
  'All Ethiopia',
  'Addis Ababa',
  'Bole',
  'Kazanchis',
  'CMC / Ayat',
  'Megenagna',
  'Lideta',
  'Yeka',
  'Kirkos',
  'Arada / Piassa',
  'Nifas Silk',
  'Hawassa',
  'Bahir Dar',
  'Adama (Nazret)',
  'Dire Dawa',
]

const HERO_STATS = [
  { value: '45,000+', label: 'Active Listings', accent: 'from-amber-600 to-amber-500' },
  { value: '12,000+', label: 'Verified Sellers', accent: 'from-emerald-600 to-teal-500' },
  { value: '15+', label: 'Cities Covered', accent: 'from-blue-600 to-indigo-500' },
  { value: '100%', label: 'Escrow Protected', accent: 'from-orange-600 to-amber-500' },
]

const QUICK_CATEGORIES = [
  { name: 'Phones & Tech', slug: 'electronics', icon: Smartphone, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Furniture', slug: 'furniture', icon: Armchair, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { name: 'Vehicles', slug: 'vehicles', icon: Car, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Fashion & Wear', slug: 'fashion', icon: Shirt, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { name: 'Laptops & PC', slug: 'electronics', icon: Laptop, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { name: 'Home Living', slug: 'home-appliances', icon: Home, color: 'text-rose-700 bg-rose-50 border-rose-200' },
]

const POPULAR_SEARCHES = ['iPhone 15', 'Leather Sofa', 'Toyota Vitz', 'MacBook M2', 'Samsung 4K TV', 'Coffee Table']

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
    if (selectedLocation && selectedLocation !== 'All Ethiopia') params.append('location', selectedLocation)
    navigate(`/browse?${params.toString()}`)
  }

  const handlePopularSearch = (term: string) => {
    navigate(`/browse?q=${encodeURIComponent(term)}`)
  }

  const handleCategoryClick = (slug: string) => {
    navigate(`/browse?category=${slug}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-stone-50/50 to-white pt-6 sm:pt-10 pb-16 lg:pb-24 border-b border-stone-200/60">
      {/* ── Background Subtle Mesh & Dot Matrix ── */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Radiant glow orbs */}
      <div
        className="hero-glow-orb absolute -top-28 -left-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-300/30 via-orange-200/20 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="hero-glow-orb absolute top-40 right-[-10%] w-[34rem] h-[34rem] rounded-full bg-gradient-to-bl from-amber-200/25 via-emerald-100/20 to-transparent blur-3xl pointer-events-none"
        style={{ animationDelay: '3s' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ── Top Grid: Hero Copy & Interactive Showcase ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4 lg:pt-8 pb-10">
          
          {/* Left Column: Copy, Highlights & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
            
            {/* Top Pill / Badge */}
            <div className="hero-fade-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-amber-300/70 shadow-sm shadow-amber-200/40 text-stone-800 text-xs sm:text-sm font-bold hero-badge-pulse">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
              </span>
              <span className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-700 bg-clip-text text-transparent font-extrabold tracking-wide uppercase text-[11px] sm:text-xs">
                Ethiopia's Verified Digital Marketplace
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 text-[10px] font-bold">
                Fayda & Escrow
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="hero-fade-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.08]">
                Buy Authenticated.{' '}
                <br className="hidden sm:block" />
                Sell in Seconds.{' '}
                <span className="relative inline-block mt-1 sm:mt-2">
                  <span className="hero-shimmer-text bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700">
                    Discover Quality Pre-Owned.
                  </span>
                  <svg
                    className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-2.5 sm:h-3 text-amber-500/80"
                    viewBox="0 0 320 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 9C50 3 120 2 160 7C200 12 270 5 318 4"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-fade-up-delay-2 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal pt-2 sm:pt-4">
                The trusted marketplace in Addis Ababa and across Ethiopia. Find phones, vehicles, furniture, electronics & fashion with national ID verified sellers and secure escrow protection.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="hero-fade-up-delay-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                to="/browse"
                className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:via-amber-500 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 text-sm sm:text-base cursor-pointer"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2.5 bg-white/90 hover:bg-amber-50/80 active:bg-amber-100 text-stone-800 border-2 border-stone-200 hover:border-amber-300 font-bold px-8 py-4 rounded-2xl transition-all text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <span>Post a Free Listing</span>
              </Link>
            </div>

            {/* Trust Assurance Strip */}
            <div className="hero-fade-up-delay-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs font-semibold text-stone-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fayda ID Verified Sellers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Chapa Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-600" />
                <span>Instant In-App Chat</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Product Showcase Stage */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
            
            {/* Ambient Background Aura */}
            <div className="absolute w-72 sm:w-88 h-72 sm:h-88 rounded-full bg-gradient-to-tr from-amber-200/50 via-orange-100/40 to-emerald-100/40 blur-2xl pointer-events-none" />
            <div className="absolute w-64 sm:w-72 h-64 sm:h-72 rounded-full border border-amber-200/70 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />

            {/* Central Badge Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-2xl shadow-stone-300/40 text-center max-w-[200px] sm:max-w-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-amber-300/60 mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Verified Deals</p>
              <p className="text-stone-900 font-extrabold text-sm sm:text-base mt-0.5">Direct from Local Sellers</p>
              <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live in Addis Ababa
              </div>
            </div>

            {/* Floating Showcase Card 1: Top Right (Electronics) */}
            <div className="absolute top-2 right-0 sm:-right-2 hero-float-slow z-20">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xl shadow-stone-300/40 w-56 sm:w-64 hover:scale-105 transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        Grade A
                      </span>
                      <div className="flex items-center text-amber-500 text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                        4.9
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-1">iPhone 15 Pro 256GB</p>
                    <p className="text-sm font-extrabold text-amber-600 mt-0.5">82,000 ETB</p>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium mt-1">
                      <MapPin className="w-2.5 h-2.5 text-stone-400" />
                      <span>Bole, Addis Ababa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Showcase Card 2: Bottom Left (Home / Vintage Furniture) */}
            <div className="absolute bottom-3 left-0 sm:-left-4 hero-float-delayed z-20">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xl shadow-stone-300/40 w-56 sm:w-64 hover:scale-105 transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/60 flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Armchair className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Escrow Verified
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-1">Ethiopian Wood Table</p>
                    <p className="text-sm font-extrabold text-amber-600 mt-0.5">11,500 ETB</p>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium mt-1">
                      <MapPin className="w-2.5 h-2.5 text-stone-400" />
                      <span>Kazanchis, Addis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live activity popup badge */}
            <div className="absolute -bottom-4 right-6 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 text-white text-[11px] font-medium shadow-lg backdrop-blur-md border border-stone-700 z-30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Just sold: MacBook Air M2 (Bole)</span>
            </div>

          </div>

        </div>

        {/* ── Elevated Glass Search & Filter Bar ── */}
        <div className="hero-fade-up-delay-5 max-w-5xl mx-auto relative z-20 mt-4 sm:mt-6">
          <div className="bg-white/95 backdrop-blur-xl border border-stone-200 rounded-3xl shadow-2xl shadow-stone-200/70 p-3 sm:p-4">
            
            {/* Search Form Header */}
            <div className="flex items-center justify-between px-2 pb-2.5 mb-1 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">
                  Search 45,000+ Verified Listings
                </span>
              </div>
              <Link to="/browse" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                <span>Advanced filters</span>
                <ChevronDown className="w-3 h-3 -rotate-90" />
              </Link>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              
              {/* Keyword input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for? (e.g. iPhone, Toyota, Sofa...)"
                  className="w-full bg-stone-50/80 hover:bg-stone-50 border border-stone-200/90 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                />
              </div>

              {/* Category dropdown */}
              <div className="sm:col-span-3 relative">
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-stone-50/80 hover:bg-stone-50 border border-stone-200/90 rounded-2xl px-4 py-3.5 pr-9 text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer font-medium"
                  aria-label="Filter by Category"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location dropdown */}
              <div className="sm:col-span-2 relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none bg-stone-50/80 hover:bg-stone-50 border border-stone-200/90 rounded-2xl pl-9 pr-7 py-3.5 text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer font-medium"
                  aria-label="Filter by Location"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Submit button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full min-h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-white font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-amber-300/50 hover:shadow-lg hover:shadow-amber-400/50 cursor-pointer text-sm sm:text-base"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

            </form>

            {/* Quick Category Discovery Pills */}
            <div className="pt-3 pb-1 border-t border-stone-100 mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider flex-shrink-0 mr-1">
                Quick Browse:
              </span>
              {QUICK_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer ${cat.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Popular Search Terms */}
            <div className="flex flex-wrap items-center gap-1.5 px-1 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Trending:
              </span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handlePopularSearch(term)}
                  className="text-xs font-semibold text-stone-600 hover:text-amber-800 bg-stone-100/80 hover:bg-amber-100/70 border border-stone-200 hover:border-amber-300 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── Key Metrics Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto pt-8 sm:pt-12">
          {HERO_STATS.map(({ value, label, accent }) => (
            <div
              key={label}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center justify-center"
            >
              <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
                {value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
