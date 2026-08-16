import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { getMyFavorites } from '../../services/favorite.service'
import { getRecentlyViewed } from '../../services/recentlyViewed.service'
import { getUserConversations } from '../../services/conversation.service'
import { getMySellerProfile } from '../../services/seller.service'
import { RecentlyViewed } from '../../components/recentlyViewed/RecentlyViewed'
import { RecommendedForYou } from '../../components/recommendations/RecommendedForYou'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import {
  Heart,
  History,
  Package,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Edit,
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthContext()

  const [favCount, setFavCount] = useState<number>(0)
  const [recentCount, setRecentCount] = useState<number>(0)
  const [messagesCount, setMessagesCount] = useState<number>(0)
  const [listingsCount, setListingsCount] = useState<number>(0)

  useEffect(() => {
    async function loadStats() {
      try {
        const [favs, recents, convs, profile] = await Promise.allSettled([
          getMyFavorites(1, 1),
          getRecentlyViewed(true, 20),
          getUserConversations(),
          getMySellerProfile(),
        ])

        if (favs.status === 'fulfilled') {
          setFavCount(favs.value.pagination.totalItems)
        }
        if (recents.status === 'fulfilled') {
          setRecentCount(recents.value.length)
        }
        if (convs.status === 'fulfilled') {
          setMessagesCount(convs.value.length)
        }
        if (profile.status === 'fulfilled') {
          setListingsCount(profile.value.activeListings + profile.value.soldListings)
        }
      } catch {
        // Fallbacks stay at 0
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-amber-700 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-amber-300">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Welcome, {user?.fullName}
                </h1>
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <p className="text-xs text-amber-100 font-medium">
                {user?.email || user?.phone} • Vintage Marketplace Buyer & Seller
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {user?.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-white">
                    <ShieldCheck className="w-3 h-3" /> Email Verified
                  </span>
                )}
                {user?.isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-white">
                    <ShieldCheck className="w-3 h-3" /> Phone Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <Link
              to="/seller/profile/edit"
              className="px-4 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs hover:bg-amber-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Edit className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit Profile</span>
            </Link>
            <Link
              to={`/seller/${user?.id}`}
              className="px-4 py-2.5 rounded-xl bg-amber-800/60 hover:bg-amber-800 text-white font-bold text-xs transition-colors border border-amber-500/40"
            >
              View Public Page
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            to="/favorites"
            className="group bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md hover:border-red-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 fill-red-500" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-red-500 transition-colors" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900">{favCount}</p>
              <p className="text-xs font-semibold text-stone-500">My Favorites</p>
            </div>
          </Link>

          <Link
            to="/browse"
            className="group bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900">{recentCount}</p>
              <p className="text-xs font-semibold text-stone-500">Recently Viewed</p>
            </div>
          </Link>

          <Link
            to="/messages"
            className="group bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900">{messagesCount}</p>
              <p className="text-xs font-semibold text-stone-500">Messages</p>
            </div>
          </Link>

          <Link
            to="/my-listings"
            className="group bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900">{listingsCount}</p>
              <p className="text-xs font-semibold text-stone-500">My Listings</p>
            </div>
          </Link>
        </div>

        {/* Recommendations */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
          <RecommendedForYou limit={8} maxItems={8} viewMoreHref="/browse" />
        </div>

        {/* Recently Viewed Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
          <RecentlyViewed limit={8} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
