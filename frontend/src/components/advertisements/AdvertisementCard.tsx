import React, { useState } from 'react'
import { ExternalLink, Store } from 'lucide-react'
import type { Advertisement, AdPlacement } from '../../types/monetization'
import { AdvertisementBadge } from './AdvertisementBadge'
import * as adService from '../../services/advertisement.service'

interface AdvertisementCardProps {
  ad: Advertisement
  placement: AdPlacement
  className?: string
}

const FALLBACK_AD_IMAGE =
  'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80'

export function AdvertisementCard({ ad, placement, className = '' }: AdvertisementCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(ad.image || FALLBACK_AD_IMAGE)

  const advertiserName =
    ad.advertiserName ||
    ad.advertiser?.businessProfile?.businessName ||
    ad.advertiser?.fullName ||
    'Featured Partner'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    adService.recordAdClick(ad.id)
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
  }

  // ── Placement 1: HOME_TOP Banner ───────────────────────────────────────────
  if (placement === 'HOME_TOP') {
    return (
      <div
        role="region"
        aria-label={`Sponsored advertisement: ${ad.title}`}
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800/80 hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 lg:p-7 gap-5 sm:gap-6">
          {/* Visual Creative */}
          <div className="w-full md:w-64 lg:w-72 aspect-[16/7] md:aspect-[16/8] shrink-0 rounded-2xl overflow-hidden bg-stone-800 border border-stone-700/50 relative">
            <img
              src={imgSrc}
              alt={ad.title}
              loading="lazy"
              onError={() => setImgSrc(FALLBACK_AD_IMAGE)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2">
              <AdvertisementBadge />
            </div>
          </div>

          {/* Copy & Business details */}
          <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Store className="w-3 h-3 text-amber-400" />
                <span>{advertiserName}</span>
              </div>
              <span className="text-stone-500 text-xs font-semibold">• Bonda Business Partner</span>
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

          {/* Call to action */}
          <div className="w-full md:w-auto shrink-0 flex items-center justify-center md:justify-end">
            <button
              type="button"
              onClick={handleClick}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-md group-hover:shadow-amber-500/25 group-hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Learn More</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Placement 2: MARKETPLACE_MIDDLE (In-feed native banner) ────────────────
  if (placement === 'MARKETPLACE_MIDDLE') {
    return (
      <div
        role="region"
        aria-label={`Sponsored advertisement: ${ad.title}`}
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/20 to-white border-2 border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer p-5 flex flex-col justify-between ${className}`}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <AdvertisementBadge />
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-600 truncate max-w-[160px]">
              <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{advertiserName}</span>
            </div>
          </div>

          {/* Image */}
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
            <img
              src={imgSrc}
              alt={ad.title}
              loading="lazy"
              onError={() => setImgSrc(FALLBACK_AD_IMAGE)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Titles & Desc */}
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

        {/* Action button */}
        <div className="pt-4 mt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={handleClick}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs group-hover:shadow-sm"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Placement 3: MARKETPLACE_BOTTOM (Full-width spotlight) ────────────────
  return (
    <div
      role="region"
      aria-label={`Sponsored advertisement: ${ad.title}`}
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-3xl bg-stone-900 text-white border border-stone-800 hover:border-amber-500/60 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 sm:p-7 gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto text-center sm:text-left">
          {/* Creative thumbnail */}
          <div className="w-full sm:w-36 h-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700/60 relative">
            <img
              src={imgSrc}
              alt={ad.title}
              loading="lazy"
              onError={() => setImgSrc(FALLBACK_AD_IMAGE)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Copy */}
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <AdvertisementBadge />
              <span className="text-xs font-bold text-amber-400 truncate max-w-[200px]">
                {advertiserName}
              </span>
            </div>
            <h4 className="font-extrabold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors line-clamp-1">
              {ad.title}
            </h4>
            {ad.description && (
              <p className="text-xs text-stone-300 line-clamp-2 font-normal">
                {ad.description}
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-sm group-hover:scale-105"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
