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
      className="group relative overflow-hidden rounded-3xl border border-stone-800/80 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored advertisement: ${ad.title}`}
    >
      {/* Background image */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/5] bg-stone-950 overflow-hidden">
        <img
          src={imgSrc}
          alt={ad.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          onError={handleImageError}
          loading={isActive ? 'eager' : 'lazy'}
        />

        {/* Gradient overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-stone-950/20 sm:from-stone-950/85 sm:via-stone-950/45 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent sm:hidden" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-5 sm:p-8 lg:p-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SponsoredBadge light />
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-amber-300 bg-stone-900/80 backdrop-blur-md border border-amber-400/30 shadow-xs">
                <span>{advertiserName}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight line-clamp-2 group-hover:text-amber-200 transition-colors drop-shadow-sm">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 leading-relaxed max-w-lg font-medium">
                {ad.description}
              </p>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => handleClick(e)}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
