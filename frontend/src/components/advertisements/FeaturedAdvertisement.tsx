/**
 * FeaturedAdvertisement — In-feed sponsored card (MARKETPLACE_FEATURED slot).
 *
 * Compact horizontal banner between listing rows with carousel rotation.
 */

import { useState } from 'react'
import { ArrowRight, Store } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, SponsoredBadge, buildCloudinaryUrl, getFallbackAdImageUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import { useAdClick, useAdCtaLabel } from '../../hooks/useAdClick'

interface FeaturedAdvertisementProps {
  ads: Advertisement[]
  isLoading?: boolean
  className?: string
}

function FeaturedSlide({ ad, isActive }: { ad: Advertisement; isActive: boolean }) {
  const [imgSrc, setImgSrc] = useState<string>(() => buildCloudinaryUrl(ad, 800))
  const handleClick = useAdClick(ad)
  const ctaLabel = useAdCtaLabel(ad)

  const handleImageError = () => {
    const fallback = getFallbackAdImageUrl('MARKETPLACE_FEATURED')
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
    }
  }

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Featured Partner'

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored: ${ad.title}`}
    >
      <div className="flex flex-col sm:flex-row gap-0">
        <div className="w-full sm:w-32 md:w-36 aspect-[16/9] sm:aspect-auto sm:h-24 shrink-0 overflow-hidden bg-stone-100 relative">
          <img
            src={imgSrc}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
            loading={isActive ? 'eager' : 'lazy'}
          />
        </div>

        <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <SponsoredBadge />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                  Featured
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 truncate max-w-[140px]">
                <Store className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">{advertiserName}</span>
              </div>
            </div>

            <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1 leading-snug">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-[11px] text-stone-500 line-clamp-1 leading-normal font-medium">
                {ad.description}
              </p>
            )}
          </div>

          <div className="pt-2 mt-1 border-t border-stone-100 flex items-center justify-end">
            <button
              type="button"
              onClick={(e) => handleClick(e)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors shadow-2xs focus:outline-none"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3 h-3" />
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
