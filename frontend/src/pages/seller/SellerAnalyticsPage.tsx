import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Crown,
  Lock,
  Loader2,
  Sparkles,
} from 'lucide-react'
import * as analyticsService from '../../services/analytics.service'
import type { SellerAnalytics } from '../../types/monetization'

export default function SellerAnalyticsPage() {
  const [data, setData] = useState<SellerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    analyticsService
      .getSellerAnalytics(days)
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">Seller Analytics</h1>
              {data?.isPremium ? (
                <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  PREMIUM METRICS
                </span>
              ) : (
                <span className="text-xs bg-stone-800 text-stone-400 px-2.5 py-0.5 rounded-full font-medium">
                  BASIC TIER
                </span>
              )}
            </div>
            <p className="text-stone-400 text-sm mt-1">
              Real-time insights on your listing traffic, buyer saves, message inquiries, and
              conversions.
            </p>
          </div>

          {/* Time range picker */}
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                days === 7 ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                days === 30 ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : !data ? (
          <div className="py-20 text-center text-stone-400">Failed to load analytics data.</div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Total Views</span>
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white mt-3">
                  {data.totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-stone-400 mt-1">Across all active listings</p>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Favorites & Saves</span>
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white mt-3">
                  {data.totalFavorites.toLocaleString()}
                </p>
                <p className="text-xs text-stone-400 mt-1">Buyer purchase intent signals</p>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Direct Inquiries</span>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white mt-3">
                  {data.totalContacts.toLocaleString()}
                </p>
                <p className="text-xs text-stone-400 mt-1">Buyer chats & phone leads</p>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Inquiry Conversion Rate</span>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-amber-500 mt-3">{data.conversionRate}%</p>
                <p className="text-xs text-stone-400 mt-1">Contacts per 100 views</p>
              </div>
            </div>

            {/* Advanced Section: Locked vs Unlocked */}
            {!data.isPremium ? (
              <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/30 border border-amber-500/30 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-white">Unlock Deep Analytics Trends</h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Upgrade to Premium Seller or Business Pro to access daily view charts,
                    top-performing listings, and buyer search affinity breakdowns.
                  </p>
                </div>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Premium (350 ETB/mo)</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Daily Performance Table / Chart Representation */}
                {data.dailyPerformance && data.dailyPerformance.length > 0 && (
                  <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        Daily Traffic & Interaction Breakdown ({days} Days)
                      </h3>
                      <span className="text-xs text-stone-400 font-mono">
                        {data.dailyPerformance.length} data points
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-stone-300">
                        <thead className="bg-stone-950 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-800">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Views</th>
                            <th className="px-4 py-3">Favorites</th>
                            <th className="px-4 py-3">Inquiries</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/60">
                          {data.dailyPerformance.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-850/50 transition">
                              <td className="px-4 py-3 font-mono text-xs text-stone-400">{row.date}</td>
                              <td className="px-4 py-3 font-semibold text-white">{row.views}</td>
                              <td className="px-4 py-3 text-rose-400">{row.favorites}</td>
                              <td className="px-4 py-3 text-emerald-400">{row.contacts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Listings */}
                {data.topListings && data.topListings.length > 0 && (
                  <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                    <h3 className="text-lg font-bold text-white">Top Performing Products</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {data.topListings.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-stone-950 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-white text-sm">{item.title}</span>
                            <p className="text-xs text-amber-500 font-semibold mt-0.5">
                              {item.price.toLocaleString()} ETB
                            </p>
                          </div>
                          <div className="flex items-center gap-6 text-xs text-stone-300">
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-blue-400" />
                              {item.views} views
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Heart className="w-4 h-4 text-rose-400" />
                              {item.favorites} saves
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-emerald-400" />
                              {item.contacts} leads
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  )
}
