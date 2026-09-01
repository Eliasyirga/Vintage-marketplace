import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Rocket,
  Sparkles,
  Crown,
  Building2,
  ShieldCheck,
  BarChart3,
  Receipt,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import * as monetizationService from '../../services/monetization.service'
import type { Entitlement } from '../../types/monetization'

export default function SellerMonetizationPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    monetizationService
      .getMyEntitlements()
      .then((data) => setEntitlements(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hasPremium = entitlements.some((e) => e.type === 'PREMIUM_SELLER' && e.isActive)
  const hasBusiness = entitlements.some((e) => e.type === 'BUSINESS_ACCOUNT' && e.isActive)
  const activeBoosts = entitlements.filter((e) => e.type === 'BOOST' && e.isActive)
  const activeFeatured = entitlements.filter((e) => e.type === 'FEATURED' && e.isActive)

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white">Seller Monetization Hub</h1>
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Growth Tools
              </span>
            </div>
            <p className="text-stone-400 text-sm mt-1">
              Supercharge your listings, subscribe to premium analytics, and track your payment
              receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/account/payments"
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-sm font-medium rounded-xl transition"
            >
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Payment History</span>
            </Link>
            <Link
              to="/seller/analytics"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-sm font-semibold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Seller Analytics</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Current Active Entitlements Overview */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Account Tier</span>
              {hasBusiness ? (
                <Building2 className="w-5 h-5 text-amber-500" />
              ) : hasPremium ? (
                <Crown className="w-5 h-5 text-amber-500" />
              ) : (
                <span className="text-xs text-stone-500 font-mono">BASIC</span>
              )}
            </div>
            <p className="text-xl font-bold text-white mt-2">
              {hasBusiness ? 'Business Pro' : hasPremium ? 'Premium Seller' : 'Free Individual'}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {hasBusiness || hasPremium ? 'Active Subscription' : 'Standard 10 Listing Allowance'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Active Boosts</span>
              <Rocket className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-white mt-2">{activeBoosts.length} Listings</p>
            <p className="text-xs text-stone-400 mt-1">Search & Category multipliers active</p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Featured Spotlights</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-white mt-2">{activeFeatured.length} Listings</p>
            <p className="text-xs text-stone-400 mt-1">Homepage & Carousel placement</p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Verification Status</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white mt-2">
              {entitlements.some((e) => e.type === 'VERIFIED_SELLER') ? 'Verified' : 'Standard'}
            </p>
            <p className="text-xs text-stone-400 mt-1">Official trust badge validation</p>
          </div>
        </div>

        {/* Feature Hub Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Promote Listings */}
          <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Promote Your Listings</h3>
                  <p className="text-xs text-stone-400">Boost ranking or feature on homepage</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-white">Boost Listing</span>
                    <p className="text-xs text-stone-400">From 100 ETB for 3 Days</p>
                  </div>
                  <Link
                    to="/my-listings"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    Select Listing →
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-white">Featured Listing</span>
                    <p className="text-xs text-stone-400">From 100 ETB for 3 Days</p>
                  </div>
                  <Link
                    to="/my-listings"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    Select Listing →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800">
              <Link
                to="/my-listings"
                className="flex items-center justify-center gap-2 w-full py-3 bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold rounded-xl transition"
              >
                <span>Go to My Listings to Promote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Section 2: Subscriptions & Growth */}
          <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Seller Subscriptions</h3>
                  <p className="text-xs text-stone-400">Unlock analytics and business tools</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-white">Premium Seller</span>
                    <p className="text-xs text-stone-400">350 ETB / Month • Advanced Analytics</p>
                  </div>
                  <Link
                    to="/pricing"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    View Plan →
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-white">Business Pro</span>
                    <p className="text-xs text-stone-400">850 ETB / Month • Unlimited Listings</p>
                  </div>
                  <Link
                    to="/pricing"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    View Plan →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800">
              <Link
                to="/pricing"
                className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 text-sm font-semibold rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                <span>Compare Subscription Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </>
    )}
  </main>

      <Footer />
    </div>
  )
}
