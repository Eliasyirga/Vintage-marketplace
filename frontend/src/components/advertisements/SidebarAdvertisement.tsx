/**
 * SidebarAdvertisement — Compact vertical ad unit for desktop sidebars (MARKETPLACE_SIDEBAR slot).
 *
 * - Accepts array of active ads for carousel rotation
 * - Cloudinary-optimized square image
 * - Impression / click tracking
 * - Empty state: subtle "Advertise Here" card
 * - On mobile, collapses gracefully (hidden via parent layout)
 */

import { useCallback, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import { AdCarousel, AdvertiseHereCTA, CarouselDots, SponsoredBadge, buildCloudinaryUrl } from './AdCarousel'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import * as adService from '../../services/advertisement.service'

interface SidebarAdvertisementProps {
  ads: Advertisement[]
  isLoading?: boolean
}

// ── Individual Sidebar Slide ──────────────────────────────────────────────────

function SidebarSlide({ ad }: { ad: Advertisement }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = buildCloudinaryUrl(ad, 400)

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
    <div className="rounded-2xl bg-white border border-stone-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Sponsored: ${ad.title} — opens in new tab`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <SponsoredBadge />
        <span className="text-[11px] font-bold text-stone-500 truncate max-w-[100px]">
          {advertiserName}
        </span>
      </div>

      {/* Square image */}
      <div className="w-full aspect-square overflow-hidden bg-stone-100 relative">
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
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-300 flex items-center justify-center">
          <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" />
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
          {ad.title}
        </h4>
        {ad.description && (
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClick() }}
          aria-label={`Visit ${ad.title} — opens in new tab`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
        >
          Visit Site
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SidebarAdvertisement({ ads, isLoading }: SidebarAdvertisementProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (isLoading) {
    return <AdvertisementSkeleton placement="MARKETPLACE_SIDEBAR" />
  }

  if (ads.length === 0) {
    return <AdvertiseHereCTA variant="sidebar" />
  }

  return (
    <div className="space-y-2">
      <AdCarousel
        ads={ads}
        variant="sidebar"
        renderSlide={(ad) => <SidebarSlide ad={ad} />}
      />

      {/* Dots below sidebar card */}
      {ads.length > 1 && (
        <div className="flex justify-center">
          <CarouselDots
            total={ads.length}
            active={currentIndex}
            onSelect={setCurrentIndex}
          />
        </div>
      )}
    </div>
  )
}
