import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSellerProfile, getSellerListings } from '../../services/seller.service'
import { getSellerReviews } from '../../services/review.service'
import type { PublicSellerProfile } from '../../types/seller'
import type { Listing } from '../../types/listing'
import type { ReviewItem, RatingSummary } from '../../types/review'
import { ListingCard } from '../../components/listings/ListingCard'
import { RatingStars } from '../../components/reviews/RatingStars'
import { ReviewList } from '../../components/reviews/ReviewList'
import { ReviewFormModal } from '../../components/reviews/ReviewFormModal'
import { ReportModal } from '../../components/reports/ReportModal'
import { VerificationBadge } from '../../components/verification/VerificationBadge'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useAuthContext } from '../../context/AuthContext'
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils'
import {
  MapPin,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
  Edit,
  PackageX,
  Tag,
  Star,
  Flag,
  MessageSquarePlus,
} from 'lucide-react'
import toast from 'react-hot-toast'

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs">
        <div className="w-24 h-24 rounded-2xl bg-stone-200 flex-shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-stone-200 rounded-lg w-48" />
          <div className="h-4 bg-stone-200 rounded-lg w-64" />
          <div className="h-4 bg-stone-200 rounded-lg w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
            <div className="aspect-[4/3] bg-stone-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SellerProfilePage() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const { user, isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<PublicSellerProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isReportSellerOpen, setIsReportSellerOpen] = useState(false)
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null)

  const isOwnProfile = user?.id === sellerId

  const loadData = async () => {
    if (!sellerId) return
    setIsLoading(true)
    try {
      const [prof, listingsRes, reviewsRes] = await Promise.all([
        getSellerProfile(sellerId!),
        getSellerListings(sellerId!, { page, limit: 12 }),
        getSellerReviews(sellerId!, reviewPage, 10),
      ])
      setProfile(prof)
      setListings(listingsRes.listings)
      setTotalPages(listingsRes.pagination.totalPages)
      setTotalItems(listingsRes.pagination.totalItems ?? listingsRes.pagination.total ?? 0)
      setReviews(reviewsRes.reviews)
      setRatingSummary(reviewsRes.summary || null)
      setReviewTotalPages(reviewsRes.pagination.totalPages)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Seller not found.')
      navigate('/browse')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [sellerId, page, reviewPage])

  const memberSinceFormatted = profile
    ? new Date(profile.memberSince).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12">
          <ProfileSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  if (!profile) return null

  const avatarInitial = profile.displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* ── Seller Profile Card ─────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.profileImage ? (
                <img
                  src={resolveImageUrl(profile.profileImage)}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-200 shadow-md"
                  onError={(e) => handleImageError(e)}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-3xl shadow-md border-2 border-amber-300">
                  {avatarInitial}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-stone-900 leading-tight">
                      {profile.displayName}
                    </h1>
                    {profile.isVerified && <VerificationBadge label="Verified Seller" />}
                  </div>

                  {/* Rating Stars preview */}
                  {ratingSummary && ratingSummary.totalReviews > 0 ? (
                    <div className="flex items-center gap-2">
                      <RatingStars rating={ratingSummary.avgRating} size="sm" />
                      <span className="text-xs font-bold text-stone-900">
                        {ratingSummary.avgRating.toFixed(1)} ★
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        ({ratingSummary.totalReviews} review{ratingSummary.totalReviews !== 1 ? 's' : ''})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400 font-medium">No reviews yet</span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start">
                  {isOwnProfile ? (
                    <Link
                      to="/seller/profile/edit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      {listings.length > 0 && isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => setIsReviewModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-2xs"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          Rate Seller
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsReportSellerOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 font-bold text-xs transition-colors"
                        title="Report this seller"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Report</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Location */}
              {(profile.city || profile.subCity) && (
                <div className="flex items-center gap-1.5 text-sm text-stone-600 font-medium">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    {[profile.subCity, profile.city].filter(Boolean).join(', ')}
                    {profile.neighborhood ? ` · ${profile.neighborhood}` : ''}
                  </span>
                </div>
              )}

              {/* Member since */}
              <div className="flex items-center gap-1.5 text-sm text-stone-500 font-medium">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>Member since {memberSinceFormatted}</span>
              </div>

              {/* Verification badges */}
              {(profile.isEmailVerified || profile.isPhoneVerified || profile.isFaydaVerified) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.isEmailVerified && <VerificationBadge label="Email Verified" />}
                  {profile.isPhoneVerified && <VerificationBadge label="Phone Verified" />}
                  {profile.isFaydaVerified && <VerificationBadge label="Fayda ID Verified" />}
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-stone-600 leading-relaxed max-w-xl border-t border-stone-100 pt-3 mt-3 italic">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Tag className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-stone-900 leading-tight">
                  {profile.activeListings}
                </p>
                <p className="text-xs font-semibold text-stone-500">Active Listings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Package className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-stone-900 leading-tight">
                  {profile.soldListings}
                </p>
                <p className="text-xs font-semibold text-stone-500">Items Sold</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Star className="w-4.5 h-4.5 text-amber-600 fill-amber-500" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-stone-900 leading-tight">
                  {ratingSummary?.avgRating ? `${ratingSummary.avgRating.toFixed(1)} ★` : '—'}
                </p>
                <p className="text-xs font-semibold text-stone-500">Seller Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Listings Section ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-stone-900">
              {isOwnProfile ? 'Your Active Listings' : `${profile.displayName}'s Listings`}
            </h2>
            {totalItems > 0 && (
              <span className="text-sm font-semibold text-stone-500">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {listings.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No active listings yet</h3>
              {isOwnProfile ? (
                <>
                  <p className="text-sm text-stone-500 font-medium">
                    Start selling your used items on Vintage Marketplace.
                  </p>
                  <Link
                    to="/sell"
                    className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors shadow-2xs"
                  >
                    Sell an Item
                  </Link>
                </>
              ) : (
                <p className="text-sm text-stone-500 font-medium">
                  This seller hasn't posted any active listings yet.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-stone-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Ratings & Reviews Section ───────────────────────────────────────── */}
        <div className="space-y-6 pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Buyer Reviews & Ratings
              </h2>
              <p className="text-xs text-stone-500">
                Feedback from buyers on product condition and communication
              </p>
            </div>
            {!isOwnProfile && listings.length > 0 && isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                Write a Review
              </button>
            )}
          </div>

          <ReviewList
            reviews={reviews}
            summary={ratingSummary}
            currentPage={reviewPage}
            totalPages={reviewTotalPages}
            onPageChange={setReviewPage}
            onReportReview={(reviewId) => setReportingReviewId(reviewId)}
          />
        </div>
      </main>

      <Footer />

      {/* Review Submission Modal */}
      {isReviewModalOpen && sellerId && (
        <ReviewFormModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          sellerId={sellerId}
          sellerName={profile.displayName}
          listingId={listings[0]?.id || ''}
          listingTitle={listings[0]?.title || 'Recent Purchase'}
          onReviewSubmitted={() => {
            loadData()
          }}
        />
      )}

      {/* Report Seller Modal */}
      {isReportSellerOpen && sellerId && (
        <ReportModal
          isOpen={isReportSellerOpen}
          onClose={() => setIsReportSellerOpen(false)}
          targetType="USER"
          targetId={sellerId}
          targetTitle={profile.displayName}
        />
      )}

      {/* Report Review Modal */}
      {reportingReviewId && (
        <ReportModal
          isOpen={!!reportingReviewId}
          onClose={() => setReportingReviewId(null)}
          targetType="REVIEW"
          targetId={reportingReviewId}
          targetTitle="Buyer Review"
        />
      )}
    </div>
  )
}
