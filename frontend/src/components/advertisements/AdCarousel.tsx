/**
 * AdCarousel — Professional multi-advertisement carousel component.
 *
 * Features:
 * - Auto-advances every 6 seconds (pauses on hover / touch interaction)
 * - Smooth CSS slide transition — no external library required
 * - Previous / Next buttons with aria-labels (accessible)
 * - Dot indicators (clickable, keyboard-accessible)
 * - Mobile swipe gesture support (touchstart/touchend)
 * - Impression tracking per visible slide via IntersectionObserver
 * - Preloads the next slide image for smooth transitions
 * - Cleans up all timers on unmount (no memory leaks)
 * - Graceful empty-state: "Advertise Here" CTA → /advertise/create
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Megaphone, ArrowRight } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'
import { useAdvertisementCarousel } from '../../hooks/useAdvertisementCarousel'
import { buildCloudinaryUrl, getFallbackAdImageUrl } from '../../utils/advertisementUtils'

export { buildCloudinaryUrl, getFallbackAdImageUrl } from '../../utils/advertisementUtils'

const SLIDE_INTERVAL_MS = 6000

// ─── SponsoredBadge ───────────────────────────────────────────────────────────

export function SponsoredBadge({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${
        light
          ? 'bg-stone-900/70 backdrop-blur-sm text-white border-white/10'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
          light ? 'bg-amber-400' : 'bg-amber-500'
        }`}
      />
      Sponsored
    </span>
  )
}

// ─── CarouselDots ─────────────────────────────────────────────────────────────

interface CarouselDotsProps {
  total: number
  active: number
  onSelect: (index: number) => void
  light?: boolean
}

export function CarouselDots({ total, active, onSelect, light = false }: CarouselDotsProps) {
  if (total <= 1) return null
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Advertisement slides">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Go to advertisement ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            i === active
              ? light
                ? 'w-5 h-2 bg-white shadow'
                : 'w-5 h-2 bg-amber-500 shadow'
              : light
                ? 'w-2 h-2 bg-white/40 hover:bg-white/70'
                : 'w-2 h-2 bg-stone-300 hover:bg-amber-300'
          }`}
        />
      ))}
    </div>
  )
}

// ─── AdvertiseHereCTA ────────────────────────────────────────────────────────

interface AdvertiseHereCTAProps {
  variant?: 'banner' | 'featured' | 'sidebar'
}

export function AdvertiseHereCTA({ variant = 'banner' }: AdvertiseHereCTAProps) {
  const navigate = useNavigate()

  if (variant === 'sidebar') {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-4 text-center space-y-3"
        role="complementary"
        aria-label="Sidebar advertising slot available"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
          <Megaphone className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-stone-700">Advertise your product here</p>
          <p className="text-[11px] text-stone-400 mt-0.5">From 99 ETB / week</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/advertise/create')}
          className="w-full py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
        >
          Advertise Now
        </button>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-5 flex items-center gap-4"
        role="complementary"
        aria-label="Featured advertising slot available"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-stone-800">Your Ad Could Be Here</p>
          <p className="text-xs text-stone-500 mt-0.5">Reach thousands of active buyers</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/advertise/create')}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
        >
          Advertise Now
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border border-stone-700/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
      role="complementary"
      aria-label="Banner advertising slot available"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Megaphone className="w-6 h-6 text-amber-400" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-base font-extrabold text-white">Advertise on Vintage Marketplace</p>
        <p className="text-sm text-stone-400 mt-1">
          Put your brand in front of motivated buyers. Premium placement starting from{' '}
          <strong className="text-amber-400">99 ETB</strong>.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/advertise/create')}
        className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30"
      >
        Advertise Your Product
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Main AdCarousel ──────────────────────────────────────────────────────────

export type CarouselVariant = 'banner' | 'featured' | 'sidebar'

interface AdCarouselProps {
  ads: Advertisement[]
  variant: CarouselVariant
  className?: string
  showDots?: boolean
  dotsLight?: boolean
  preloadWidth?: number
  onSlideChange?: (index: number) => void
  renderSlide: (ad: Advertisement, isActive: boolean) => ReactNode
}

export function AdCarousel({
  ads,
  variant,
  className = '',
  showDots = true,
  dotsLight = false,
  preloadWidth = 1200,
  onSlideChange,
  renderSlide,
}: AdCarouselProps) {
  const total = ads.length
  const containerRef = useRef<HTMLDivElement>(null)
  const impressionTrackedRef = useRef<Set<string>>(new Set())

  const { current, setIsPaused, goTo, next, prev, handleTouchStart, handleTouchEnd } =
    useAdvertisementCarousel({
      total,
      intervalMs: SLIDE_INTERVAL_MS,
      onSlideChange,
    })

  // Preload next slide image
  useEffect(() => {
    if (total <= 1) return
    const nextIndex = (current + 1) % total
    const nextAd = ads[nextIndex]
    if (!nextAd) return
    const img = new Image()
    img.src = buildCloudinaryUrl(nextAd, preloadWidth)
  }, [current, ads, total, preloadWidth])

  // Impression tracking via IntersectionObserver
  useEffect(() => {
    const ad = ads[current]
    if (!ad || impressionTrackedRef.current.has(ad.id)) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !impressionTrackedRef.current.has(ad.id)) {
          impressionTrackedRef.current.add(ad.id)
          adService.recordAdImpression(ad.id).catch(() => {})
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [current, ads])

  if (total === 0) {
    return <AdvertiseHereCTA variant={variant} />
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-400 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {ads.map((ad, i) => (
            <div key={ad.id} className="w-full shrink-0" aria-hidden={i !== current}>
              {renderSlide(ad, i === current)}
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              aria-label="Previous advertisement"
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center
                bg-stone-900/60 hover:bg-stone-900/90 backdrop-blur-sm text-white border border-white/10
                transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                ${variant === 'sidebar' ? 'hidden sm:flex' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              aria-label="Next advertisement"
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center
                bg-stone-900/60 hover:bg-stone-900/90 backdrop-blur-sm text-white border border-white/10
                transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                ${variant === 'sidebar' ? 'hidden sm:flex' : ''}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {showDots && total > 1 && (
        <div
          className={`flex items-center justify-between mt-3 px-1 ${
            variant === 'sidebar' ? 'justify-center' : ''
          }`}
        >
          <CarouselDots total={total} active={current} onSelect={goTo} light={dotsLight} />
          {variant !== 'sidebar' && (
            <span className="text-[11px] text-stone-400 font-medium">
              {current + 1} / {total}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
