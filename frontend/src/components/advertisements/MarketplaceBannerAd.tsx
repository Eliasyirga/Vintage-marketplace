/**
 * MarketplaceBannerAd — Full-width sponsored banner (MARKETPLACE_BANNER slot).
 *
 * - Accepts an array of active advertisements (carousel when multiple)
 * - Uses Cloudinary optimized images (f_auto, q_auto)
 * - Smooth auto-advancing carousel with 6-second intervals
 * - Pause on hover, swipe on mobile
 * - Impression tracking via IntersectionObserver
 * - Click tracking through backend endpoint
 * - Empty slot → premium "Advertise Here" CTA
 * - "Advertise on Vintage Marketplace" end-card appended after last real slide
 */

import { useCallback, useState } from 'react'
import { ExternalLink, Store } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, CarouselDots, SponsoredBadge, buildCloudinaryUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import * as adService from '../../services/advertisement.service'

interface MarketplaceBannerAdProps {
  ads: Advertisement[]
  isLoading?: boolean
  sessionId?: string
}

// ── Individual Banner Slide ────────────────────────────────────────────────────

function BannerSlide({ ad }: { ad: Advertisement }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = buildCloudinaryUrl(ad, 1400)

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
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-700/60 hover:border-amber-500/40 shadow-lg cursor-pointer transition-all duration-300"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored advertisement: ${ad.title} — opens in new tab`}
    >
      {/* Ambient glow */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 p-5 sm:p-6 lg:p-8">
        {/* Image */}
        <div className="w-full md:w-72 lg:w-80 aspect-[16/8] shrink-0 rounded-2xl overflow-hidden bg-stone-800 border border-stone-700/40 relative">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-600 text-xs font-medium">
              Image unavailable
            </div>
          )}
          <div className="absolute top-2 left-2">
            <SponsoredBadge />
          </div>
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0 space-y-2.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <Store className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{advertiserName}</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white group-hover:text-amber-200 transition-colors line-clamp-2 leading-tight">
            {ad.title}
          </h3>

          {ad.description && (
            <p className="text-sm text-stone-300 line-clamp-2 leading-relaxed">
              {ad.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0 w-full md:w-auto flex items-center justify-center md:justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClick() }}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Visit Site
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function MarketplaceBannerAd({ ads, isLoading }: MarketplaceBannerAdProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (isLoading) {
    return <AdvertisementSkeleton placement="MARKETPLACE_BANNER" />
  }

  if (ads.length === 0) {
    return <AdvertiseHereCTA variant="banner" />
  }

  return (
    <div className="relative">
      <AdCarousel
        ads={ads}
        variant="banner"
        renderSlide={(ad) => <BannerSlide ad={ad} />}
      >
        {/* Dots + Advertise CTA row — rendered outside carousel slides */}
      </AdCarousel>

      {/* Dots & "Advertise" link below */}
      {ads.length > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
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
