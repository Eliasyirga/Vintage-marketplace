/**
 * SidebarAdvertisement — Compact vertical ad unit (MARKETPLACE_SIDEBAR slot).
 *
 * On mobile, parent layout moves this into the main flow as a compact card.
 */

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, SponsoredBadge, buildCloudinaryUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import { useAdClick, useAdCtaLabel } from '../../hooks/useAdClick'

interface SidebarAdvertisementProps {
  ads: Advertisement[]
  isLoading?: boolean
  className?: string
}

function SidebarSlide({ ad, isActive }: { ad: Advertisement; isActive: boolean }) {
  const [imageError, setImageError] = useState(false)
  const handleClick = useAdClick(ad)
  const ctaLabel = useAdCtaLabel(ad)
  const imageUrl = buildCloudinaryUrl(ad, 400)

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Featured Partner'

  return (
    <div
      className="rounded-2xl bg-white border border-stone-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored: ${ad.title}`}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <SponsoredBadge />
        <span className="text-[11px] font-bold text-stone-500 truncate max-w-[100px]">
          {advertiserName}
        </span>
      </div>

      <div className="w-full aspect-[4/3] sm:aspect-square overflow-hidden bg-stone-100 relative">
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

      <div className="p-3 space-y-2">
        <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
          {ad.title}
        </h4>
        {ad.description && (
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{ad.description}</p>
        )}
        <button
          type="button"
          onClick={(e) => handleClick(e)}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {ctaLabel}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export function SidebarAdvertisement({ ads, isLoading, className = '' }: SidebarAdvertisementProps) {
  if (isLoading) {
    return <AdvertisementSkeleton placement="MARKETPLACE_SIDEBAR" className={className} />
  }

  if (ads.length === 0) {
    return (
      <div className={className}>
        <AdvertiseHereCTA variant="sidebar" />
      </div>
    )
  }

  return (
    <div className={className}>
      <AdCarousel
        ads={ads}
        variant="sidebar"
        preloadWidth={400}
        renderSlide={(ad, isActive) => <SidebarSlide ad={ad} isActive={isActive} />}
      />
    </div>
  )
}
