import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { useAuthContext } from '../../context/AuthContext'
import {
  Menu,
  Search,
  ChevronRight,
  ArrowUpRight,
  Bell,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
} from 'lucide-react'
import * as adminService from '../../services/admin.service'
import type { GlobalSearchResults } from '../../types/admin'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => {})
  }, [])

  // Keyboard shortcut listener for '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced live backend search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null)
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await adminService.globalSearch(searchQuery.trim())
        setSearchResults(results)
      } catch {
        // quiet fail
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.trim()
    setSearchModalOpen(false)
    setSearchQuery('')
    navigate(`/admin/listings?search=${encodeURIComponent(q)}`)
  }

  const pathSegments = location.pathname.split('/').filter(Boolean)

  const attentionTotal =
    stats?.attentionRequired
      ? Object.values(stats.attentionRequired as Record<string, number>).reduce(
          (a, b) => a + b,
          0,
        )
      : 0

  const hasResults =
    searchResults &&
    (searchResults.users.length > 0 ||
      searchResults.listings.length > 0 ||
      searchResults.orders.length > 0 ||
      searchResults.payments.length > 0 ||
      searchResults.advertisements.length > 0)

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-stone-900 selection:bg-amber-500 selection:text-white font-sans antialiased">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-stone-950/80 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Obsidian Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main View Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Sleek Glassmorphic Top Navbar */}
        <header className="bg-white/85 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail & Page Title */}
            <div className="min-w-0">
              <nav className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600 truncate mb-0.5">
                <Link to="/admin" className="hover:text-amber-600 transition-colors">
                  Operations
                </Link>
                {pathSegments.slice(1).map((seg, idx) => (
                  <span key={seg} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-stone-300" />
                    <span className={idx === pathSegments.length - 2 ? 'text-amber-700 font-extrabold capitalize' : 'capitalize'}>
                      {seg.replace(/-/g, ' ')}
                    </span>
                  </span>
                ))}
              </nav>
              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight truncate flex items-center gap-2">
                <span>{title}</span>
              </h1>
              {subtitle && <p className="text-xs text-stone-600 font-medium truncate hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          {/* Top Actions & Profile Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100/90 hover:bg-stone-200/90 text-stone-600 hover:text-stone-900 text-xs font-semibold border border-stone-200 transition-all shadow-2xs group"
            >
              <Search className="w-3.5 h-3.5 text-stone-600 group-hover:text-amber-600 transition-colors" />
              <span className="hidden md:inline">Quick search</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border border-stone-300 shadow-2xs text-stone-700">
                /
              </kbd>
            </button>

            {/* Notifications Pill */}
            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="Platform Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {attentionTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-950 font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {attentionTotal}
                </span>
              )}
            </Link>

            {/* Operator Card */}
            <div className="flex items-center gap-2.5 bg-white border border-stone-200/90 pl-1.5 pr-3 py-1 rounded-2xl shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-black text-xs flex items-center justify-center shadow-xs">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-black text-stone-900 block leading-tight">
                  {user?.fullName}
                </span>
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block">
                  Root Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-start justify-center pt-16 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-stone-100 flex items-center gap-3 shrink-0">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search users, listings, orders, payments, or ads..."
                className="w-full text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-700 px-2 py-1 rounded-lg bg-stone-100 shrink-0"
              >
                ESC
              </button>
            </form>

            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {/* Live search results */}
              {hasResults ? (
                <div className="space-y-4">
                  {/* Users */}
                  {searchResults!.users.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-amber-600" /> Users ({searchResults!.users.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {searchResults!.users.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSearchModalOpen(false)
                              navigate(`/admin/users?search=${encodeURIComponent(u.email || u.fullName)}`)
                            }}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-100 hover:border-amber-300 text-left transition-colors flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-stone-900 text-xs block truncate">{u.fullName}</span>
                              <span className="text-[10px] text-stone-500 font-mono block truncate">{u.email || u.phone}</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 shrink-0">
                              {u.tier}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Listings */}
                  {searchResults!.listings.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-emerald-600" /> Listings ({searchResults!.listings.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {searchResults!.listings.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setSearchModalOpen(false)
                              navigate(`/admin/listings?search=${encodeURIComponent(l.title)}`)
                            }}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-emerald-50/60 border border-stone-100 hover:border-emerald-300 text-left transition-colors flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-stone-900 text-xs block truncate">{l.title}</span>
                              <span className="text-[10px] text-emerald-700 font-bold block">ETB {Number(l.price).toLocaleString()}</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 shrink-0">
                              {l.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {searchResults!.orders.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <ShoppingCart className="w-3 h-3 text-blue-600" /> Orders ({searchResults!.orders.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {searchResults!.orders.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              setSearchModalOpen(false)
                              navigate(`/admin/orders?search=${encodeURIComponent(o.order_number || o.id)}`)
                            }}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-blue-50/60 border border-stone-100 hover:border-blue-300 text-left transition-colors flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-stone-900 text-xs block font-mono">#{o.order_number || o.id.slice(0, 8)}</span>
                              <span className="text-[10px] text-stone-500 font-bold block">ETB {Number(o.total_amount).toLocaleString()}</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 shrink-0">
                              {o.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  {searchResults!.payments.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-purple-600" /> Payments ({searchResults!.payments.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {searchResults!.payments.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSearchModalOpen(false)
                              navigate(`/admin/payments?search=${encodeURIComponent(p.reference)}`)
                            }}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-purple-50/60 border border-stone-100 hover:border-purple-300 text-left transition-colors flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-stone-900 text-xs block font-mono truncate">{p.reference}</span>
                              <span className="text-[10px] text-purple-700 font-bold block">ETB {Number(p.amount).toLocaleString()}</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 shrink-0">
                              {p.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : searchQuery.trim().length >= 2 && !isSearching ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No records matching "{searchQuery}".
                </div>
              ) : (
                <div className="bg-stone-50 p-4 rounded-2xl text-xs font-medium text-stone-500 space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                    Quick Navigation Shortcuts
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setSearchModalOpen(false); navigate('/admin/users') }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-stone-800 font-bold transition-colors"
                    >
                      <span>User Directory</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSearchModalOpen(false); navigate('/admin/listings') }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-stone-800 font-bold transition-colors"
                    >
                      <span>Listing Moderation</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSearchModalOpen(false); navigate('/admin/orders') }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-stone-800 font-bold transition-colors"
                    >
                      <span>Order Ledger</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSearchModalOpen(false); navigate('/admin/payments') }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-stone-800 font-bold transition-colors"
                    >
                      <span>Chapa Settlements</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

