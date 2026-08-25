/**
 * MarketplaceBannerAd — Premium homepage/marketplace hero banner (MARKETPLACE_BANNER).
 *
 * Full-bleed Cloudinary hero with gradient overlay, carousel rotation,
 * and "Advertise on Vintage Marketplace" empty state.
 */

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, SponsoredBadge, buildCloudinaryUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import { useAdClick, useAdCtaLabel } from '../../hooks/useAdClick'

interface MarketplaceBannerAdProps {
  ads: Advertisement[]
  isLoading?: boolean
  className?: string
}

function BannerHeroSlide({ ad, isActive }: { ad: Advertisement; isActive: boolean }) {
  const [imageError, setImageError] = useState(false)
  const handleClick = useAdClick(ad)
  const ctaLabel = useAdCtaLabel(ad)

  const desktopUrl = buildCloudinaryUrl(ad, 1400)
  const mobileUrl = buildCloudinaryUrl(ad, 800)

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-stone-800/80 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored advertisement: ${ad.title}`}
    >
      {/* Background image */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/5] bg-stone-900">
        {!imageError ? (
          <picture>
            <source media="(min-width: 768px)" srcSet={desktopUrl} />
            <img
              src={mobileUrl}
              alt={ad.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              onError={() => setImageError(true)}
              loading={isActive ? 'eager' : 'lazy'}
            />
          </picture>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-800 text-stone-500 text-sm">
            Image unavailable
          </div>
        )}

        {/* Gradient overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/50 to-stone-950/20 sm:from-stone-950/80 sm:via-stone-950/40 sm:to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-5 sm:p-8 lg:p-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <SponsoredBadge light />

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight line-clamp-2 group-hover:text-amber-100 transition-colors">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-sm sm:text-base text-stone-200 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            )}

            <button
              type="button"
              onClick={(e) => handleClick(e)}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
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
