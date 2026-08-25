import { Link } from 'react-router-dom'
import { MapPin, Tag, ArrowRight } from 'lucide-react'
import type { ConversationListing } from '../../types/conversation'

interface ListingContextCardProps {
  listing?: ConversationListing | null
}

export function ListingContextCard({ listing }: ListingContextCardProps) {
  if (!listing) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100 text-stone-500 text-xs font-medium">
        <Tag className="w-4 h-4 text-stone-400" />
        <span>Listing unavailable</span>
      </div>
    )
  }

  const isActive = listing.status === 'ACTIVE'

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all group"
    >
      {listing.image ? (
        <img
          src={listing.image}
          alt={listing.title}
          className="w-12 h-12 rounded-lg object-cover border border-stone-200 flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center flex-shrink-0">
          <Tag className="w-5 h-5 text-stone-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-stone-900 truncate leading-tight">{listing.title}</p>
        <p className="text-sm font-extrabold text-amber-600 leading-tight">
          {Number(listing.price).toLocaleString('en-US')} ETB
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {listing.city && (
            <span className="flex items-center gap-0.5 text-[10px] text-stone-500">
              <MapPin className="w-2.5 h-2.5" />
              {listing.city}
            </span>
          )}
          {listing.condition && (
            <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md capitalize">
              {listing.condition.replace('_', ' ').toLowerCase()}
            </span>
          )}
          {!isActive && (
            <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md font-semibold">
              {listing.status === 'SOLD' ? 'Sold' : 'Inactive'}
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
    </Link>
  )
}
