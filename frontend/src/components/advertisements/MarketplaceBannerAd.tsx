/**
 * MarketplaceBannerAd — Premium homepage/marketplace hero banner (MARKETPLACE_BANNER).
 *
 * Full-bleed Cloudinary hero with gradient overlay, carousel rotation,
 * and "Advertise on Vintage Marketplace" empty state.
 */

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, SponsoredBadge, buildCloudinaryUrl, getFallbackAdImageUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import { useAdClick, useAdCtaLabel } from '../../hooks/useAdClick'

interface MarketplaceBannerAdProps {
  ads: Advertisement[]
  isLoading?: boolean
  className?: string
}

function BannerHeroSlide({ ad, isActive }: { ad: Advertisement; isActive: boolean }) {
  const [imgSrc, setImgSrc] = useState<string>(() => buildCloudinaryUrl(ad, 1400))
  const handleClick = useAdClick(ad)
  const ctaLabel = useAdCtaLabel(ad)

  const handleImageError = () => {
    const fallback = getFallbackAdImageUrl('MARKETPLACE_BANNER')
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
    }
  }

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Verified Partner'

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-stone-800/60 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored: ${ad.title}`}
    >
      {/* Background image — compact height */}
      <div className="relative w-full h-32 sm:h-28 md:h-32 bg-stone-950 overflow-hidden">
        <img
          src={imgSrc}
          alt={ad.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={handleImageError}
          loading={isActive ? 'eager' : 'lazy'}
        />

        {/* Gradient overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-stone-950/30 sm:from-stone-950/90 sm:via-stone-950/55 sm:to-transparent" />

        {/* Content overlay — compact single-row / two-row layout */}
        <div className="absolute inset-0 flex items-center justify-between p-4 sm:p-5 md:px-6 gap-4">
          <div className="max-w-xl space-y-1 sm:space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <SponsoredBadge light />
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 bg-stone-900/80 backdrop-blur-md border border-amber-400/20">
                <span className="truncate max-w-[150px]">{advertiserName}</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight line-clamp-1 group-hover:text-amber-200 transition-colors">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-xs text-stone-300 line-clamp-1 leading-normal font-medium hidden sm:block">
                {ad.description}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={(e) => handleClick(e)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-sm focus:outline-none"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MarketplaceBannerAd({ ads, isLoading, className = '' }: MarketplaceBannerAdProps) {
  if (isLoading) {
    return <AdvertisementSkeleton placement="MARKETPLACE_BANNER" className={className} />
  }

  if (ads.length === 0) {
    return (
      <div className={className}>
        <AdvertiseHereCTA variant="banner" />
      </div>
    )
  }

  return (
    <div className={className}>
      <AdCarousel
        ads={ads}
        variant="banner"
        dotsLight
        preloadWidth={1400}
        renderSlide={(ad, isActive) => <BannerHeroSlide ad={ad} isActive={isActive} />}
      />
    </div>
  )
}
