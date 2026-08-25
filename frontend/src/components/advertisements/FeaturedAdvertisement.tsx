/**
 * FeaturedAdvertisement — In-feed sponsored card (MARKETPLACE_FEATURED slot).
 *
 * Appears between listing rows in the marketplace grid.
 * Wide, horizontal layout on desktop; stacked on mobile.
 * Supports multi-ad carousel with auto-advance.
 */

import { useCallback, useState } from 'react'
import { ExternalLink, Store } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, CarouselDots, SponsoredBadge, buildCloudinaryUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import * as adService from '../../services/advertisement.service'

interface FeaturedAdvertisementProps {
  ads: Advertisement[]
  isLoading?: boolean
}

// ── Individual Featured Slide ─────────────────────────────────────────────────

function FeaturedSlide({ ad }: { ad: Advertisement }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = buildCloudinaryUrl(ad, 800)

  const handleClick = useCallback(async () => {
    try {
      const result = await adService.recordAdClick(ad.id)
      const url = result.targetUrl || ad.targetUrl
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
    }
  }, [ad])

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Featured Partner'

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-amber-50/10 to-white border-2 border-amber-200/60 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored: ${ad.title} — opens in new tab`}
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Image */}
        <div className="w-full sm:w-48 md:w-56 aspect-[16/9] sm:aspect-square shrink-0 overflow-hidden bg-stone-100 relative">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
              Image unavailable
            </div>
          )}
          {/* Image overlay on hover */}
          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3">
              <SponsoredBadge />
              <div className="flex items-center gap-1 text-xs font-bold text-stone-500 truncate max-w-[160px]">
                <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{advertiserName}</span>
              </div>
            </div>

            {/* Title & description */}
            <h3 className="font-extrabold text-stone-900 text-base sm:text-lg group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="pt-3 mt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClick() }}
              aria-label={`Visit ${ad.title} — opens in new tab`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Learn More
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function FeaturedAdvertisement({ ads, isLoading }: FeaturedAdvertisementProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (isLoading) {
    return <AdvertisementSkeleton placement="MARKETPLACE_FEATURED" />
  }

  if (ads.length === 0) {
    return <AdvertiseHereCTA variant="featured" />
  }

  return (
    <div className="space-y-2">
      <AdCarousel
        ads={ads}
        variant="featured"
        renderSlide={(ad) => <FeaturedSlide ad={ad} />}
      />

      {/* Dots */}
      {ads.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <CarouselDots
            total={ads.length}
            active={currentIndex}
            onSelect={setCurrentIndex}
          />
          <span className="text-[11px] text-stone-400 font-medium">
            {currentIndex + 1} / {ads.length}
          </span>
        </div>
      )}
    </div>
  )
}
