import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { TimeseriesDataPoint, AccountTierBreakdown, SellerAnalyticsResult } from '../../types/admin'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  Award,
} from 'lucide-react'

export default function AdminAnalytics() {
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const [timeseries, setTimeseries] = useState<TimeseriesDataPoint[]>([])
  const [tiers, setTiers] = useState<AccountTierBreakdown | null>(null)
  const [sellerInsights, setSellerInsights] = useState<SellerAnalyticsResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      adminService.getTimeseriesAnalytics(days),
      adminService.getSellerAnalytics(),
    ])
      .then(([data, sellers]) => {
        setTimeseries(data.timeseries || [])
        setTiers(data.tiers || null)
        setSellerInsights(sellers || null)
      })
      .finally(() => setIsLoading(false))
  }, [days])

  // Aggregate timeframe metrics
  const totalVolumeInWindow = timeseries.reduce((sum, pt) => sum + pt.paymentVolume, 0)
  const totalUsersInWindow = timeseries.reduce((sum, pt) => sum + pt.users, 0)
  const totalListingsInWindow = timeseries.reduce((sum, pt) => sum + pt.listings, 0)
  const totalOrdersInWindow = timeseries.reduce((sum, pt) => sum + pt.orders, 0)

  const maxListings = Math.max(...timeseries.map((t) => t.listings), 1)

  return (
    <AdminLayout
      title="Marketplace Analytics"
      subtitle="Historical time-series, volume trends, and account tier distributions"
    >
      <div className="space-y-8">
        {/* Timeframe selector header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              Growth & Financial Performance
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Calculated exclusively from verified database transactions and records (Chapa ETB)
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-2xl self-start sm:self-auto">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === d
                    ? 'bg-white text-stone-900 shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Window Highlights KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>New Registrations</span>
              <Users className="w-4 h-4 text-amber-600" />
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              +{totalUsersInWindow.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400 font-semibold">In selected window</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Listings Created</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              +{totalListingsInWindow.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400 font-semibold">New item inventory</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Orders Placed</span>
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              {totalOrdersInWindow.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400 font-semibold">Checkout purchases</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Chapa Volume</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              ETB {totalVolumeInWindow.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-400 font-semibold">Successful settlements</p>
          </div>
        </div>

        {/* ── Visual Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Time-series Chart */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-stone-900">Listing Inventory Growth</h3>
                <p className="text-xs text-stone-500 font-medium">Daily listing creation volume over time</p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                Daily Trajectory
              </span>
            </div>

            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-stone-400 font-semibold animate-pulse">
                Loading time-series data...
              </div>
            ) : timeseries.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-stone-400 font-semibold">
                No activity recorded in this window.
              </div>
            ) : (
              <div className="h-48 flex items-end gap-1 sm:gap-2 pt-6 border-b border-stone-100">
                {timeseries.map((pt) => {
                  const heightPercent = Math.max(8, (pt.listings / maxListings) * 100)
                  return (
                    <div
                      key={pt.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-20">
                        {pt.date}: {pt.listings} listings
                      </div>
                      <div
                        className="w-full bg-amber-500 hover:bg-amber-400 rounded-t-md transition-all duration-300 shadow-2xs"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Account Tier Breakdown */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-stone-900">Seller Tier Breakdown</h3>
                <PieChart className="w-4 h-4 text-stone-400" />
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Active account tier distribution
              </p>
            </div>

            {tiers && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-700">Basic Sellers (Default)</span>
                    <span className="text-stone-900 font-black">{tiers.basic}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-stone-400 h-full rounded-full"
                      style={{
                        width: `${Math.max(
                          5,
                          (tiers.basic / (tiers.basic + tiers.premium + tiers.business || 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-700">Premium Boosted Sellers</span>
                    <span className="text-amber-800 font-black">{tiers.premium}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${Math.max(
                          5,
                          (tiers.premium / (tiers.basic + tiers.premium + tiers.business || 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-purple-700">Verified Business Stores</span>
                    <span className="text-purple-800 font-black">{tiers.business}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{
                        width: `${Math.max(
                          5,
                          (tiers.business / (tiers.basic + tiers.premium + tiers.business || 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <span>Basic accounts have a 10-listing cap. Businesses enjoy custom limits and badge verified trust.</span>
            </div>
          </div>
        </div>

        {/* ── SECTION: SELLER INSIGHTS & QUOTA UTILIZATION ── */}
        {sellerInsights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Active Sellers */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-stone-900">Top Active Sellers</h3>
                </div>
                <span className="text-xs text-stone-400 font-semibold font-mono">
                  {sellerInsights.totalTrackedSellers} total sellers
                </span>
              </div>

              <div className="space-y-2">
                {sellerInsights.topSellers.slice(0, 5).map((seller) => (
                  <div
                    key={seller.userId}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-stone-900 truncate">{seller.fullName}</span>
                        {seller.isFaydaVerified && (
                          <span title="Fayda Verified"><ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" /></span>
                        )}
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                          {seller.accountType}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 truncate block">{seller.email || seller.phone}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-amber-700 block">{seller.activeListings} active</span>
                      <span className="text-[10px] text-stone-400 block">{seller.soldListings} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Users Near Listing Limit */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-stone-900">Users Near Listing Cap (8-10 / 10)</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Basic Quota Monitor
                </span>
              </div>

              {sellerInsights.usersNearLimit.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400 font-medium">
                  No basic users are currently near their 10-listing cap limit.
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerInsights.usersNearLimit.map((seller) => (
                    <div
                      key={seller.userId}
                      className="p-3 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900 truncate max-w-[180px]">{seller.fullName}</span>
                        <span className="font-black text-amber-800 font-mono">
                          {seller.totalListings} / {seller.quota} ({seller.quotaPercent}%)
                        </span>
                      </div>

                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            seller.totalListings >= 10 ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${seller.quotaPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-stone-500">
                        <span>{10 - seller.totalListings} slots remaining before limit</span>
                        <Link
                          to={`/admin/users?search=${encodeURIComponent(seller.email || seller.fullName)}`}
                          className="font-bold text-amber-700 hover:underline"
                        >
                          View User &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

