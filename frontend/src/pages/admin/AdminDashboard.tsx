import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { DashboardStats, TimeseriesDataPoint } from '../../types/admin'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Megaphone,
  ArrowRight,
  RefreshCw,
  Flag,
  Sparkles,
  ArrowUpRight,
  Activity,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeseries, setTimeseries] = useState<TimeseriesDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const [statsData, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getTimeseriesAnalytics(7),
      ])
      setStats(statsData)
      setTimeseries(analyticsData.timeseries || [])
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading && !stats) {
    return (
      <AdminLayout title="Marketplace Operations" subtitle="Loading live metrics...">
        <div className="p-20 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
          <p className="text-xs text-stone-400 font-black uppercase tracking-widest">
            Synchronizing Command Metrics...
          </p>
        </div>
      </AdminLayout>
    )
  }

  const attention = stats?.attentionRequired
  const marketplace = stats?.marketplace
  const today = stats?.today

  return (
    <AdminLayout
      title="Executive Overview"
      subtitle="Real-time marketplace operations, revenue settlements, and trust metrics"
    >
      <div className="space-y-8">
        {/* Hero Banner with Modern Mesh Gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0e12] via-[#1a1714] to-[#261d15] text-white p-6 sm:p-8 shadow-xl border border-stone-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Command Operations Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Vintage Marketplace Ethiopia
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-medium leading-relaxed">
                Live monitoring of verified Bonda listings, buyer checkout purchases, and verified Chapa settlement volumes.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all backdrop-blur-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span>Sync Data</span>
              </button>

              <Link
                to="/admin/analytics"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-black transition-all shadow-lg shadow-amber-500/25"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analytics Suite</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── SECTION 1: REQUIRES ATTENTION (Action Items) ───────────────── */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-900">
                Action Required Queue
              </h3>
            </div>
            <Link
              to="/admin/risk"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors group"
            >
              <span>View Incident Radar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <Link
              to="/admin/listings?status=PENDING_REVIEW"
              className="bg-white hover:bg-amber-50/40 border border-stone-200/90 hover:border-amber-400/80 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold text-stone-500">Pending Listings</span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 mt-2">
                  {attention?.pendingListings || 0}
                </p>
                <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
                  Review & Publish &rarr;
                </span>
              </div>
            </Link>

            <Link
              to="/admin/advertisements"
              className="bg-white hover:bg-amber-50/40 border border-stone-200/90 hover:border-amber-400/80 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold text-stone-500">Pending Ads</span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 mt-2">
                  {attention?.pendingAdvertisements || 0}
                </p>
                <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
                  Paid Slot Review &rarr;
                </span>
              </div>
            </Link>

            <Link
              to="/admin/reports"
              className="bg-white hover:bg-red-50/40 border border-stone-200/90 hover:border-red-400/80 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold text-stone-500">Open Reports</span>
                <div className="w-7 h-7 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Flag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 mt-2">
                  {attention?.openReports || 0}
                </p>
                <span className="text-[10px] font-bold text-red-600 block mt-0.5">
                  Safety Triage &rarr;
                </span>
              </div>
            </Link>

            <Link
              to="/admin/verifications"
              className="bg-white hover:bg-blue-50/40 border border-stone-200/90 hover:border-blue-400/80 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold text-stone-500">Verifications</span>
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 mt-2">
                  {attention?.pendingVerifications || 0}
                </p>
                <span className="text-[10px] font-bold text-blue-600 block mt-0.5">
                  National ID & Fayda &rarr;
                </span>
              </div>
            </Link>

            <Link
              to="/admin/payments?status=FAILED"
              className="bg-white hover:bg-stone-50 border border-stone-200/90 rounded-3xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold text-stone-500">Failed Payments</span>
                <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900 mt-2">
                  {attention?.failedPayments || 0}
                </p>
                <span className="text-[10px] font-bold text-stone-500 block mt-0.5">
                  Chapa Gateway Logs &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* ── SECTION 2: MARKETPLACE OVERVIEW (KPI CARDS) ────────────────── */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">
            Marketplace Financial & Volume Pillars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Total Users
                </span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 tracking-tight">
                {marketplace?.totalUsers?.toLocaleString() || 0}
              </p>
              <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100">
                <span>Active Sellers: <strong>{marketplace?.activeSellers || 0}</strong></span>
                <span className="text-amber-700 font-bold">Biz Stores: {marketplace?.businessAccounts || 0}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Active Listings
                </span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 tracking-tight">
                {marketplace?.totalActiveListings?.toLocaleString() || 0}
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 pt-2 border-t border-stone-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live catalog inventory</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Total Orders
                </span>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 tracking-tight">
                {marketplace?.totalOrders?.toLocaleString() || 0}
              </p>
              <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-emerald-700 font-bold">
                  {stats?.ordersSummary?.completedOrders || 0} Completed
                </span>
                <span className="text-amber-700 font-bold">
                  {stats?.ordersSummary?.pendingOrders || 0} Pending
                </span>
              </div>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Chapa Gross Volume
                </span>
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900 tracking-tight">
                ETB {marketplace?.totalPaymentVolume?.toLocaleString() || 0}
              </p>
              <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1.5 pt-2 border-t border-stone-100">
                <span>{stats?.paymentsSummary?.successfulPayments || 0} Verified Settlements</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: TODAY AT A GLANCE ──────────────────────────────── */}
        <div className="bg-[#0f1117] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Today's Real-Time Pulse
              </h3>
            </div>
            <span className="text-xs font-semibold text-stone-400 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-xs text-stone-400 font-semibold block">New User Signups</span>
              <p className="text-2xl font-black text-white">+{today?.newUsersToday || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-xs text-stone-400 font-semibold block">New Listings Posted</span>
              <p className="text-2xl font-black text-white">+{today?.newListingsToday || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-xs text-stone-400 font-semibold block">Checkout Orders Placed</span>
              <p className="text-2xl font-black text-white">+{today?.newOrdersToday || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-xs text-amber-300/90 font-semibold block">Today's Chapa Volume</span>
              <p className="text-2xl font-black text-amber-400">
                ETB {today?.todayPaymentVolume?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: 7-DAY ACTIVITY TRAJECTORY ────────────────────────── */}
        {timeseries.length > 0 && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-stone-900">7-Day Catalog Trajectory</h3>
                <p className="text-xs text-stone-500 font-medium">Daily listing creations across all categories</p>
              </div>
              <Link
                to="/admin/analytics"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
              >
                <span>Full Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-7 gap-2.5 pt-2">
              {timeseries.map((pt) => (
                <div key={pt.date} className="text-center space-y-2">
                  <div className="h-28 bg-stone-50 rounded-2xl p-2 flex flex-col justify-end border border-stone-100 relative group">
                    <div
                      className="bg-gradient-to-t from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 rounded-xl w-full transition-all duration-300 shadow-xs"
                      style={{ height: `${Math.min(100, Math.max(15, pt.listings * 18))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 block truncate">
                    {pt.date.split('-').slice(1).join('/')}
                  </span>
                  <span className="text-xs font-black text-stone-900 block">
                    {pt.listings} ads
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
