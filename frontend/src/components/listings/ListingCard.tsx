import { Link } from 'react-router-dom'
import { MapPin, Eye, Edit, Trash2, CheckCircle2, ShieldCheck, Clock, Rocket } from 'lucide-react'
import { CONDITION_LABELS, type Listing } from '../../types/listing'
import { formatRelativeTime } from '../../utils/date'

import { FavoriteButton } from '../favorites/FavoriteButton'

interface ListingCardProps {
  listing: Listing
  isOwner?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (isFav: boolean) => void
  onMarkAsSold?: (listingId: string) => void
  onDelete?: (listingId: string) => void
  onPromote?: (listing: Listing) => void
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  DRAFT: {
    label: 'Draft',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  SOLD: {
    label: 'Sold',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-stone-100 text-stone-600 border-stone-300',
  },
  REMOVED: {
    label: 'Removed',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
}

export function ListingCard({
  listing,
  isOwner = false,
  isFavorite = false,
  onFavoriteToggle,
  onMarkAsSold,
  onDelete,
  onPromote,
}: ListingCardProps) {
  const coverImage = listing.images && listing.images.length > 0
    ? listing.images[0].url
    : '/placeholder.png'

  const formattedPrice = Number(listing.price).toLocaleString('en-US')
  const conditionInfo = CONDITION_LABELS[listing.condition]
  const statusConfig = STATUS_BADGES[listing.status] || STATUS_BADGES.ACTIVE
  const isSellerVerified =
    listing.seller?.isEmailVerified ||
    listing.seller?.isPhoneVerified ||
    listing.seller?.isFaydaVerified ||
    listing.seller?.isFaceVerified
  const relativeTime = formatRelativeTime(listing.publishedAt || listing.createdAt)

  return (
    <div className="group rounded-2xl bg-white border border-stone-200/90 hover:border-amber-400 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <Link to={`/listings/${listing.id}`}>
            <img
              src={coverImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Condition Badge */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-stone-200 shadow-sm pointer-events-none">
            {conditionInfo?.title || listing.condition}
          </span>

          {/* Status Badge (Owner View) OR Favorite Button (Buyer View) */}
          {isOwner ? (
            <span
              className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          ) : (
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton
                listingId={listing.id}
                initialIsFavorite={isFavorite}
                listingTitle={listing.title}
                size="sm"
                onToggle={onFavoriteToggle}
              />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/listings/${listing.id}`}
              className="font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 text-base"
              title={listing.title}
            >
              {listing.title}
            </Link>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-600 tracking-tight">
              {formattedPrice} <span className="text-xs font-semibold text-stone-500">ETB</span>
            </span>
            {relativeTime && (
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {relativeTime}
              </span>
            )}
          </div>

          {/* Location & Views */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="font-medium text-stone-600">
                {listing.city}
                {listing.subCity ? `, ${listing.subCity}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1 text-stone-400 font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>{listing.viewCount}</span>
            </div>
          </div>

          {/* Seller Info (Clickable link to /seller/:sellerId) */}
          {listing.seller && (
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link
                to={`/seller/${listing.seller.id}`}
                className="flex items-center gap-2 group/seller hover:opacity-80 transition-opacity min-w-0"
              >
                {listing.seller.avatarUrl ? (
                  <img
                    src={listing.seller.avatarUrl}
                    alt={listing.seller.fullName}
                    className="w-5 h-5 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {listing.seller.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-stone-700 group-hover/seller:text-amber-600 transition-colors truncate">
                  {listing.seller.fullName}
                </span>
              </Link>

              {isSellerVerified && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full flex-shrink-0"
                  title="Verified Seller"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Owner Action Buttons */}
      {isOwner && (
        <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/listings/${listing.id}/edit`}
              className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
              title="Edit listing"
            >
              <Edit className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit</span>
            </Link>

            {listing.status === 'ACTIVE' && onPromote && (
              <button
                type="button"
                onClick={() => onPromote(listing)}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
                title="Promote / Boost listing"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-600" />
                <span>Promote</span>
              </button>
            )}

            {listing.status === 'ACTIVE' && onMarkAsSold && (
              <button
                type="button"
                onClick={() => onMarkAsSold(listing.id)}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
                title="Mark as Sold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sold</span>
              </button>
            )}
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(listing.id)}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-colors text-xs font-bold shadow-sm"
              title="Delete or Archive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
