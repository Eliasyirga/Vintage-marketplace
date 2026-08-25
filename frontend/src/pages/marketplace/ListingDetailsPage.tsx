import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListingById, updateListingStatus, deleteListing } from '../../services/listing.service'
import { checkFavorite } from '../../services/favorite.service'
import { recordRecentlyViewed } from '../../services/recentlyViewed.service'
import { getSellerReviews } from '../../services/review.service'
import { CONDITION_LABELS, type Listing } from '../../types/listing'
import type { ReviewItem, RatingSummary } from '../../types/review'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useAuthContext } from '../../context/AuthContext'
import { FavoriteButton } from '../../components/favorites/FavoriteButton'
import { ContactSellerModal } from '../../components/messaging/ContactSellerModal'
import { RecentlyViewed } from '../../components/recentlyViewed/RecentlyViewed'
import { ReportModal } from '../../components/reports/ReportModal'
import { RatingStars } from '../../components/reviews/RatingStars'
import { ReviewList } from '../../components/reviews/ReviewList'
import { ReviewFormModal } from '../../components/reviews/ReviewFormModal'
import { SimilarProducts } from '../../components/recommendations/SimilarProducts'
import { checkBuyNowEligibility } from '../../services/order.service'
import {
  MapPin,
  Tag,
  Eye,
  ShieldCheck,
  Edit,
  CheckCircle2,
  Trash2,
  Share2,
  Calendar,
  Loader2,
  ChevronLeft,
  MessageSquare,
  Flag,
  Star,
  MessageSquarePlus,
  ShoppingBag,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const [listing, setListing] = useState<Listing | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  const handleBuyNow = async () => {
    if (!listing) return
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase this item.')
      navigate(`/login?redirect=/checkout/${listing.id}`)
      return
    }
    try {
      setCheckingEligibility(true)
      const result = await checkBuyNowEligibility(listing.id)
      if (result.eligible) {
        navigate(`/checkout/${listing.id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Item is not currently available for purchase.')
    } finally {
      setCheckingEligibility(false)
    }
  }

  const loadReviewsData = async (sellerId: string, page = 1) => {
    try {
      const res = await getSellerReviews(sellerId, page, 6)
      setReviews(res.reviews)
      setRatingSummary(res.summary || null)
      setReviewTotalPages(res.pagination.totalPages)
    } catch {
      // Non-blocking
    }
  }

  useEffect(() => {
    async function loadListing() {
      if (!id) return
      try {
        const data = await getListingById(id)
        setListing(data)

        // Record in recently viewed for both auth & guest
        recordRecentlyViewed(data, isAuthenticated).catch(() => { })

        // Check favorite status if authenticated
        if (isAuthenticated) {
          const isFav = await checkFavorite(id)
          setIsFavorite(isFav)
        }

        // Load seller reviews
        if (data?.seller?.id) {
          loadReviewsData(data.seller.id, 1)
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Listing not found.')
        navigate('/browse')
      } finally {
        setIsLoading(false)
      }
    }
    loadListing()
  }, [id, isAuthenticated, navigate])

  const handleReviewPageChange = (newPage: number) => {
    setReviewPage(newPage)
    if (listing?.seller?.id) {
      loadReviewsData(listing.seller.id, newPage)
    }
  }

  const handleMarkAsSold = async () => {
    if (!id || !window.confirm('Mark this listing as sold?')) return
    try {
      const res = await updateListingStatus(id, 'SOLD')
      setListing(res.listing)
      toast.success('Listing marked as Sold!')
    } catch {
      toast.error('Failed to update listing status.')
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete/archive this listing?')) return
    try {
      await deleteListing(id)
      toast.success('Listing archived.')
      navigate('/my-listings')
    } catch {
      toast.error('Failed to delete listing.')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Listing link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-sm font-bold text-stone-500">Loading listing details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!listing) return null

  const isOwner = user?.id === listing.seller.id
  const images = listing.images && listing.images.length > 0 ? listing.images : []
  const currentImage = images[selectedImageIndex]?.url || '/placeholder.png'
  const conditionInfo = CONDITION_LABELS[listing.condition]
  const formattedPrice = Number(listing.price).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-10 space-y-6 sm:space-y-10">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Marketplace
          </button>

          <div className="flex items-center gap-2">
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                initialIsFavorite={isFavorite}
                listingTitle={listing.title}
                size="sm"
                onToggle={(fav) => setIsFavorite(fav)}
              />
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>

            {!isOwner && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors shadow-xs"
                title="Report this listing"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Owner Management Bar */}
        {isOwner && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Seller Control Panel
              </span>
              <p className="text-sm font-extrabold text-stone-900">
                You are managing this listing ({listing.status})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/listings/${listing.id}/edit`}
                className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Link>

              {listing.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={handleMarkAsSold}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Sold
                </button>
              )}

              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="bg-white border border-stone-200 rounded-3xl p-3 shadow-xs overflow-hidden">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 relative group flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {listing.status === 'SOLD' && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-red-600 text-white text-base font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                        ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img.url} alt={img.altText || `Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Overview & Seller Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Details Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  {listing.category.name}
                </span>

                <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  {listing.viewCount} views
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug">{listing.title}</h1>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                  {formattedPrice} <span className="text-sm font-semibold text-stone-500">ETB</span>
                </div>
              </div>

              <div className="h-px bg-stone-100" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Condition</span>
                  <span className="font-bold text-stone-800 bg-stone-100 px-3 py-1 rounded-lg text-xs border border-stone-200">
                    {conditionInfo?.title || listing.condition}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Location</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {listing.city}
                    {listing.subCity ? `, ${listing.subCity}` : ''}
                    {listing.neighborhood ? ` (${listing.neighborhood})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Listed On</span>
                  <span className="font-bold text-stone-600 flex items-center gap-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Buy Now & Contact Seller Action Box (Desktop / Tablet) */}
              {!isOwner && listing.status === 'ACTIVE' && (
                <div className="pt-3 border-t border-stone-100 hidden sm:flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={checkingEligibility}
                      onClick={handleBuyNow}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all transform active:scale-95"
                    >
                      {checkingEligibility ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      <span>Buy Now</span>
                    </button>

                    <FavoriteButton
                      listingId={listing.id}
                      initialIsFavorite={isFavorite}
                      listingTitle={listing.title}
                      size="md"
                      showText={false}
                      onToggle={(fav) => setIsFavorite(fav)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-stone-500" />
                    <span>Contact Seller</span>
                  </button>
                </div>
              )}
            </div>

            {/* Seller Information Box with Live Ratings */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Seller Information
                </h3>
                <Link
                  to={`/seller/${listing.seller.id}`}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                >
                  View Profile →
                </Link>
              </div>

              <Link
                to={`/seller/${listing.seller.id}`}
                className="flex items-start justify-between group/seller hover:opacity-95 transition-opacity gap-3"
              >
                <div className="flex items-center gap-3">
                  {listing.seller.avatarUrl ? (
                    <img
                      src={listing.seller.avatarUrl}
                      alt={listing.seller.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-stone-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-extrabold text-amber-700 text-lg flex-shrink-0">
                      {listing.seller.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-stone-900 group-hover/seller:text-amber-600 transition-colors">
                      {listing.seller.fullName}
                    </h4>
                    {/* Live Seller Rating Score */}
                    {ratingSummary && ratingSummary.totalReviews > 0 ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RatingStars rating={ratingSummary.avgRating} size="sm" />
                        <span className="text-xs font-extrabold text-stone-800">
                          {ratingSummary.avgRating.toFixed(1)} ★
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          ({ratingSummary.totalReviews})
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 font-medium">Member of Vintage Marketplace</p>
                    )}
                  </div>
                </div>
              </Link>

              <div className="flex flex-wrap gap-2 pt-2">
                {listing.seller.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Email Verified
                  </span>
                )}
                {listing.seller.isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Phone Verified
                  </span>
                )}
                {listing.seller.isFaydaVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Fayda Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-stone-900">Product Description</h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
            {listing.description}
          </p>
        </div>

        {/* ── Product & Seller Reviews Section ─────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Seller Reviews & Reputation
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Authentic feedback from buyers who interacted with {listing.seller.fullName}
              </p>
            </div>

            {!isOwner && isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Rate this Seller</span>
              </button>
            )}
          </div>

          <ReviewList
            reviews={reviews}
            summary={ratingSummary}
            currentPage={reviewPage}
            totalPages={reviewTotalPages}
            onPageChange={handleReviewPageChange}
            onReportReview={(reviewId) => setReportingReviewId(reviewId)}
          />
        </div>

        {/* Similar Products */}
        {listing.status === 'ACTIVE' && (
          <div className="pt-8 border-t border-stone-200">
            <SimilarProducts listingId={listing.id} limit={8} />
          </div>
        )}

        {/* Recently Viewed Section */}
        <div className="pt-6 border-t border-stone-200">
          <RecentlyViewed limit={4} />
        </div>
      </main>

      {/* Sticky Mobile Action Bar */}
      {!isOwner && listing.status === 'ACTIVE' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center gap-2 z-40 shadow-xl">
          <FavoriteButton
            listingId={listing.id}
            initialIsFavorite={isFavorite}
            listingTitle={listing.title}
            size="md"
            onToggle={(fav) => setIsFavorite(fav)}
          />

          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="py-3 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-stone-500" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            disabled={checkingEligibility}
            onClick={handleBuyNow}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/25 active:scale-95 transition-all"
          >
            {checkingEligibility ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span>Buy Now</span>
          </button>
        </div>
      )}

      {/* Contact Seller Modal */}
      <ContactSellerModal
        listing={listing}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Report Listing Modal */}
      {isReportModalOpen && listing && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="LISTING"
          targetId={listing.id}
          targetTitle={listing.title}
        />
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && listing && (
        <ReviewFormModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          sellerId={listing.seller.id}
          sellerName={listing.seller.fullName}
          listingId={listing.id}
          listingTitle={listing.title}
          onReviewSubmitted={() => {
            loadReviewsData(listing.seller.id, 1)
          }}
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

      <Footer />
    </div>
  )
}
