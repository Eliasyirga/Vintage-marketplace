import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { useAuthContext } from '../../context/AuthContext'
import {
  Menu,
  Search,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import * as adminService from '../../services/admin.service'

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

            {/* Action Items Pill */}
            {attentionTotal > 0 && (
              <Link
                to="/admin/risk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold hover:bg-amber-500/25 transition-all shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-extrabold">{attentionTotal}</span>
                <span className="hidden sm:inline">Tasks</span>
              </Link>
            )}

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
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-stone-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings, user accounts, orders, or payment references..."
                className="w-full text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-700 px-2 py-1 rounded-lg bg-stone-100"
              >
                ESC
              </button>
            </form>

            <div className="p-4 bg-stone-50 text-xs font-medium text-stone-500 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                Command Shortcuts
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
          </div>
        </div>
      )}
    </div>
  )
}
