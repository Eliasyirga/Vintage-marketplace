/**
 * AdvertisementCard — Reusable ad card for placement-specific layouts.
 * Used by AdvertisementSlot as a fallback when individual component routing isn't applied.
 *
 * - Removes Unsplash fallback image (was violating the no-placeholder rule)
 * - Uses Cloudinary-optimized URLs via buildCloudinaryUrl()
 * - Supports all 3 placement variants
 */

import React, { useState, useCallback } from 'react'
import { ExternalLink, Store } from 'lucide-react'
import type { Advertisement, AdPlacement } from '../../types/monetization'
import { AdvertisementBadge } from './AdvertisementBadge'
import { buildCloudinaryUrl, getAdCtaText, getFallbackAdImageUrl } from '../../utils/advertisementUtils'
import * as adService from '../../services/advertisement.service'

interface AdvertisementCardProps {
  ad: Advertisement
  placement: AdPlacement
  className?: string
}

export function AdvertisementCard({ ad, placement, className = '' }: AdvertisementCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(() =>
    buildCloudinaryUrl(
      ad,
      placement === 'MARKETPLACE_SIDEBAR' ? 400 : placement === 'MARKETPLACE_FEATURED' ? 800 : 1200,
    ),
  )

  const handleImageError = () => {
    const fallback = getFallbackAdImageUrl(placement)
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
    }
  }

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Featured Partner'

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const result = await adService.recordAdClick(ad.id)
      const url = result.targetUrl || ad.targetUrl
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
    }
  }, [ad])

  // ── Placement 1: MARKETPLACE_BANNER ──────────────────────────────────────────
  if (placement === 'MARKETPLACE_BANNER') {
    return (
      <div
        role="region"
        aria-label={`Sponsored advertisement: ${ad.title}`}
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800/80 hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 lg:p-7 gap-5 sm:gap-6">
          <div className="w-full md:w-64 lg:w-72 aspect-[16/7] md:aspect-[16/8] shrink-0 rounded-2xl overflow-hidden bg-stone-800 border border-stone-700/50 relative">
            <img
              src={imgSrc}
              alt={ad.title}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2">
              <AdvertisementBadge />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Store className="w-3 h-3 text-amber-400" />
                <span>{advertiserName}</span>
              </div>
              <span className="text-stone-500 text-xs font-semibold">• Verified Sponsor</span>
            </div>

            <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight">
              {ad.title}
            </h3>

            {ad.description && (
              <p className="text-xs sm:text-sm text-stone-300 font-normal line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            )}
          </div>

          <div className="w-full md:w-auto shrink-0 flex items-center justify-center md:justify-end">
            <button
              type="button"
              onClick={handleClick}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-md group-hover:shadow-amber-500/25 group-hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{getAdCtaText(ad.targetUrl)}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Placement 2: MARKETPLACE_FEATURED ────────────────────────────────────────
  if (placement === 'MARKETPLACE_FEATURED') {
    return (
      <div
        role="region"
        aria-label={`Sponsored advertisement: ${ad.title}`}
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/20 to-white border-2 border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer p-5 flex flex-col justify-between ${className}`}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <AdvertisementBadge />
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-600 truncate max-w-[160px]">
              <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{advertiserName}</span>
            </div>
          </div>

          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
            <img
              src={imgSrc}
              alt={ad.title}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="space-y-1">
            <h4 className="font-extrabold text-stone-900 text-sm sm:text-base group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
              {ad.title}
            </h4>
            {ad.description && (
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-medium">
                {ad.description}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={handleClick}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs group-hover:shadow-sm"
          >
            <span>{getAdCtaText(ad.targetUrl)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Placement 3: MARKETPLACE_SIDEBAR ─────────────────────────────────────────
  return (
    <div
      role="region"
      aria-label={`Sponsored advertisement: ${ad.title}`}
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <AdvertisementBadge />
        <span className="text-[11px] font-bold text-stone-500 truncate">{advertiserName}</span>
      </div>

      <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 relative">
        <img
          src={imgSrc}
          alt={ad.title}
          loading="lazy"
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
          {ad.title}
        </h4>
        {ad.description && (
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
      >
        <span>Visit Site</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
