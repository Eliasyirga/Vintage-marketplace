/**
 * FeaturedAdvertisement — In-feed sponsored card (MARKETPLACE_FEATURED slot).
 *
 * Compact horizontal banner between listing rows with carousel rotation.
 */

import { useState } from 'react'
import { ArrowRight, Store } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, SponsoredBadge, buildCloudinaryUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import { useAdClick, useAdCtaLabel } from '../../hooks/useAdClick'

interface FeaturedAdvertisementProps {
  ads: Advertisement[]
  isLoading?: boolean
  className?: string
}

function FeaturedSlide({ ad, isActive }: { ad: Advertisement; isActive: boolean }) {
  const [imageError, setImageError] = useState(false)
  const handleClick = useAdClick(ad)
  const ctaLabel = useAdCtaLabel(ad)
  const imageUrl = buildCloudinaryUrl(ad, 800)

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Featured Partner'

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored: ${ad.title}`}
    >
      <div className="flex flex-col sm:flex-row gap-0">
        <div className="w-full sm:w-44 md:w-52 aspect-[16/9] sm:aspect-auto sm:h-auto sm:min-h-[140px] shrink-0 overflow-hidden bg-stone-100 relative">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading={isActive ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
              Image unavailable
            </div>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <SponsoredBadge />
              <div className="flex items-center gap-1 text-xs font-bold text-stone-500 truncate max-w-[160px]">
                <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{advertiserName}</span>
              </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Featured Deal
            </p>

            <h3 className="font-extrabold text-stone-900 text-base sm:text-lg group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={(e) => handleClick(e)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {ctaLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeaturedAdvertisement({ ads, isLoading, className = '' }: FeaturedAdvertisementProps) {
  if (isLoading) {
    return <AdvertisementSkeleton placement="MARKETPLACE_FEATURED" className={className} />
  }

  if (ads.length === 0) {
    return (
      <div className={className}>
        <AdvertiseHereCTA variant="featured" />
      </div>
    )
  }

  return (
    <div className={className}>
      <AdCarousel
        ads={ads}
        variant="featured"
        preloadWidth={800}
        renderSlide={(ad, isActive) => <FeaturedSlide ad={ad} isActive={isActive} />}
      />
    </div>
  )
}
