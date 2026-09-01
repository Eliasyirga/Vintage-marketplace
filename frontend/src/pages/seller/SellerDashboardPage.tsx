import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as accountService from '../../services/account.service'
import type { AccountOverviewData } from '../../services/account.service'
import {
  Store,
  Tag,
  BarChart3,
  Sparkles,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Megaphone,
} from 'lucide-react'

export default function SellerDashboardPage() {
  const [data, setData] = useState<AccountOverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await accountService.getAccountOverview()
        if (res.success && res.data) {
          setData(res.data)
        }
      } catch (err) {
        console.error('Failed to load seller dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-stone-200 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-stone-200 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats


  return (
    <div className="space-y-8">
      {/* ── Seller Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2.5">
            <Store className="w-6 h-6 text-amber-500" />
            <span>Seller Hub & Dashboard</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your inventory, fulfill customer orders, and track your revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm rounded-2xl shadow-md shadow-amber-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Listing</span>
          </Link>
          <Link
            to="/seller/profile/edit"
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-2xl transition-all"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* ── Seller Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500">Total Revenue</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900">
            {stats?.totalEarnedETB?.toLocaleString() || 0}{' '}
            <span className="text-xs font-semibold text-stone-500">ETB</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">From completed orders</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500">Active Listings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.activeListings || 0}</p>
          <Link
            to="/account/listings"
            className="text-[11px] font-semibold text-emerald-600 hover:underline mt-1 block"
          >
            View listings →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500">Orders to Fulfill</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.sellerOrdersPending || 0}</p>
          <Link
            to="/seller/orders"
            className="text-[11px] font-semibold text-blue-600 hover:underline mt-1 block"
          >
            Manage orders →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500">Completed Sales</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.sellerOrdersCompleted || 0}</p>
          <p className="text-[11px] text-stone-500 mt-1">Total items sold</p>
        </div>
      </div>

      {/* ── Quick Action Hub Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/seller/analytics"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Seller Analytics</h4>
              <p className="text-xs text-stone-500">Views, conversion & top listings</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>View Insights</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/seller/monetization"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Boosts & Featured</h4>
              <p className="text-xs text-stone-500">Get 10x more buyer views</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>Promote Listings</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/advertise/my-ads"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Banner Ads</h4>
              <p className="text-xs text-stone-500">Run campaigns on home & category pages</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-rose-600">
            <span>Manage Ads</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* ── Ethiopia Marketplace Safety & Tips ────────────────────────────── */}
      <div className="p-6 bg-stone-900 rounded-3xl text-white space-y-3">
        <h3 className="font-bold text-base text-amber-400">
          Tips for Successful Selling in Ethiopia
        </h3>
        <ul className="text-xs text-stone-300 space-y-2 list-disc list-inside">
          <li>
            <strong className="text-white">High Quality Photos:</strong> Take well-lit photos showing any wear, serial numbers, or authentic tags.
          </li>
          <li>
            <strong className="text-white">Meet in Person Safety:</strong> When meeting buyers in person, choose busy, well-lit public places like major malls or cafes in Bole, Kazanchis, or Piassa.
          </li>
          <li>
            <strong className="text-white">Platform Protection:</strong> For online delivery orders, never deliver until payment is marked as CONFIRMED on your seller dashboard.
          </li>
        </ul>
      </div>
    </div>
  )
}
