import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, PlusCircle, Menu, X, User as UserIcon, LogOut,
  Heart, MessageSquare, Package, Sparkles, Bell, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#user-dropdown-root')) setUserDropdownOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/categories', label: 'Categories' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/advertise', label: 'Advertise' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 backdrop-blur-xl shadow-sm border-b border-stone-200/60'
          : 'bg-white border-b border-stone-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-[15px] font-extrabold text-stone-900 tracking-tight block leading-none">
                Vintage
                <span className="text-amber-600 ml-1">Marketplace</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium tracking-wide">Make Bonda Digital</span>
            </div>
            <div className="sm:hidden">
              <span className="text-[15px] font-extrabold text-stone-900">Vintage</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {navLinks.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className={`px-3 py-2 rounded-lg transition-colors duration-150 ${
                  isActive(to)
                    ? 'text-amber-700 bg-amber-50 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop Search ── */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-xs relative"
          >
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones, cars..."
              className="w-full bg-stone-100 border border-transparent rounded-xl pl-9 pr-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            />
          </form>

          {/* ── Desktop Actions ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Sell Button */}
            <Link
              to="/sell"
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-amber-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell</span>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" id="user-dropdown-root">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen) }}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition-all duration-150"
                  aria-expanded={userDropdownOpen}
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold truncate max-w-[80px]">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-stone-100 bg-gradient-to-br from-amber-50 to-stone-50 rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">{user?.fullName}</p>
                          <p className="text-[10px] text-stone-400 truncate font-medium">{user?.email || user?.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {[
                        { to: '/account/orders', icon: Package, label: 'My Orders', iconClass: 'text-amber-600 font-bold' },
                        { to: '/seller/orders', icon: Package, label: 'Seller Orders', iconClass: 'text-amber-700 font-bold' },
                        { to: `/seller/${user?.id}`, icon: UserIcon, label: 'Public Seller Profile' },
                        { to: '/seller/profile/edit', icon: UserIcon, label: 'Edit Profile' },
                        { to: '/my-listings', icon: Package, label: 'My Listings' },
                        { to: '/seller/monetization', icon: Sparkles, label: 'Growth & Promotions', iconClass: 'text-amber-500' },
                        { to: '/seller/analytics', icon: Sparkles, label: 'Seller Analytics', iconClass: 'text-blue-500' },
                        { to: '/account/payments', icon: Package, label: 'Billing & Receipts', iconClass: 'text-emerald-500' },
                        { to: '/favorites', icon: Heart, label: 'Favorites', iconClass: 'text-red-400' },
                        { to: '/messages', icon: MessageSquare, label: 'Messages', iconClass: 'text-amber-500' },
                      ].map(({ to, icon: Icon, label, iconClass }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Icon className={`w-3.5 h-3.5 ${iconClass || 'text-stone-400'}`} />
                          <span>{label}</span>
                        </Link>
                      ))}
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        type="button"
                        onClick={() => { setUserDropdownOpen(false); logout() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-stone-700 hover:text-stone-900 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile & Tablet Action Buttons ── */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors"
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="md:hidden py-3 border-t border-stone-200">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, cars, furniture..."
                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                autoFocus
              />
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors">
                Go
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 space-y-3">
            <nav className="flex flex-col">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(to) ? 'text-amber-700 bg-amber-50 font-bold' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-stone-200 space-y-2">
              <Link
                to="/sell"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-3 rounded-xl shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell an Item</span>
              </Link>

              {isAuthenticated ? (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{user?.fullName}</p>
                      <p className="text-[10px] text-stone-400 truncate">{user?.email || user?.phone}</p>
                    </div>
                  </div>
                  {[
                    { to: '/account/orders', icon: Package, label: 'My Orders' },
                    { to: '/seller/orders', icon: Package, label: 'Seller Orders' },
                    { to: '/profile', icon: UserIcon, label: 'Profile' },
                    { to: '/my-listings', icon: Package, label: 'My Listings' },
                    { to: '/favorites', icon: Heart, label: 'Favorites' },
                    { to: '/messages', icon: Bell, label: 'Messages' },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-xl"
                    >
                      <Icon className="w-4 h-4 text-stone-400" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); logout() }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-sm font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
