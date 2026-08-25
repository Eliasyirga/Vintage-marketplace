import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Tag,
  TrendingUp,
  Heart,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Store,
  Building,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import * as accountService from '../../services/account.service'
import type { AccountOverviewData } from '../../services/account.service'

export default function AccountOverviewPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState<AccountOverviewData | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function loadData() {
      try {
        const res = await accountService.getAccountOverview()
        if (res.success && res.data) {
          setOverview(res.data)
        }
      } catch (err) {
        console.error('Failed to load account overview:', err)
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
        <div className="h-64 bg-stone-200 rounded-3xl" />
      </div>
    )
  }

  const stats = overview?.stats
  const seller = overview?.sellerProfile
  const business = overview?.businessProfile

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-stone-950 font-extrabold text-2xl flex items-center justify-center shadow-md">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Welcome back, {user?.fullName?.split(' ')[0]}!
                </h1>
                {user?.role === 'ADMIN' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-stone-300 text-sm mt-0.5">
                {user?.email || user?.phone} • One account for Buying & Selling
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {user?.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Email Verified
                  </span>
                )}
                {user?.isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Phone Verified
                  </span>
                )}
                {user?.isFaydaVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3" /> Fayda ID Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Quick CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell an Item</span>
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Action Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/account/orders"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.buyerOrdersTotal || 0}</p>
          <p className="text-xs font-semibold text-stone-700">My Purchases</p>
          <span className="text-[11px] text-amber-700 mt-1 block">
            {stats?.buyerOrdersPending ? `${stats.buyerOrdersPending} pending` : 'All caught up'}
          </span>
        </Link>

        <Link
          to="/account/listings"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.activeListings || 0}</p>
          <p className="text-xs font-semibold text-stone-700">Active Listings</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {stats?.totalListings || 0} total created
          </span>
        </Link>

        <Link
          to="/seller/orders"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.sellerOrdersTotal || 0}</p>
          <p className="text-xs font-semibold text-stone-700">Seller Sales</p>
          <span className="text-[11px] text-blue-700 mt-1 block">
            {stats?.totalEarnedETB ? `${stats.totalEarnedETB.toLocaleString()} ETB earned` : '0 ETB earned'}
          </span>
        </Link>

        <Link
          to="/account/favorites"
          className="p-5 bg-white rounded-3xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.favoritesCount || 0}</p>
          <p className="text-xs font-semibold text-stone-700">Saved Favorites</p>
          <span className="text-[11px] text-rose-700 mt-1 block">View items</span>
        </Link>
      </div>

      {/* ── Seller Hub Feature Banner ─────────────────────────────────────── */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent rounded-3xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              {seller?.exists ? 'Seller Profile Active' : 'Start Selling on Vintage Marketplace'}
            </h3>
            <p className="text-stone-600 text-sm mt-0.5">
              {seller?.exists
                ? `Display Name: ${seller.displayName || user?.fullName} • City: ${seller.city || 'Not set'}`
                : 'Turn your unused items into cash. Create your seller profile in 60 seconds.'}
            </p>
          </div>
        </div>

        <Link
          to={seller?.exists ? '/seller/dashboard' : '/account/seller'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-2xl transition-all shrink-0"
        >
          <span>{seller?.exists ? 'Open Seller Hub' : 'Set Up Seller Profile'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Two-Column Overview (Purchases & Verification) ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Card */}
        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Trust & Verification</span>
            </h3>
            <Link
              to="/account/verification"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-sm font-medium text-stone-700">Email Address</span>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <AlertCircle className="w-4 h-4" /> Unverified
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-sm font-medium text-stone-700">Phone Number</span>
              {user?.isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <AlertCircle className="w-4 h-4" /> Unverified
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <span className="text-sm font-medium text-stone-700">Fayda National ID</span>
              {user?.isFaydaVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              ) : (
                <Link
                  to="/account/verification"
                  className="text-xs font-bold text-amber-600 hover:underline"
                >
                  Verify Now →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Business Account Card */}
        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-500" />
              <span>Business Profile</span>
            </h3>
            <Link
              to="/account/business"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              {business?.exists ? 'Manage' : 'Register'}
            </Link>
          </div>

          {business?.exists ? (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <p className="font-bold text-stone-900 text-sm">{business.businessName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-stone-500">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {business.registrationStatus}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-center space-y-2">
              <p className="text-sm text-stone-600">
                Operating a shop, boutique, or company in Ethiopia?
              </p>
              <Link
                to="/account/business"
                className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800"
              >
                Register Business Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
