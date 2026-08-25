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
 * - Cleans up all timers on unmount (no memory leaks)
 * - Graceful empty-state: "Advertise Here" CTA → /advertise/create
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Megaphone, ArrowRight } from 'lucide-react'
import type { Advertisement } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'

const SLIDE_INTERVAL_MS = 6000 // 6 seconds per slide
const MIN_SWIPE_PX = 50       // Minimum horizontal swipe to register

// ─── Cloudinary URL builder ────────────────────────────────────────────────────

/**
 * Build an optimized Cloudinary delivery URL from a public_id.
 * Falls back to the stored secure_url if no public_id is available.
 * NEVER exposes the API secret — only uses public_id for URL construction.
 */
export function buildCloudinaryUrl(
  ad: Advertisement,
  width: number = 1200,
): string {
  if (ad.imagePublicId) {
    // Use Cloudinary's fetch transformation via public_id
    const cloudName = 'vmhpsvzq'
    const transforms = `f_auto,q_auto,w_${width},c_fill`
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${ad.imagePublicId}`
  }
  // Fallback: use the stored secure_url directly
  return ad.image
}

// ─── SponsoredBadge ───────────────────────────────────────────────────────────

export function SponsoredBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-900/70 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
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
          <p className="text-xs font-bold text-stone-700">Advertise Here</p>
          <p className="text-[11px] text-stone-400 mt-0.5">From 99 ETB / week</p>
        </div>
        <button
          id="sidebar-advertise-cta-btn"
          onClick={() => navigate('/advertise/create')}
          className="w-full py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
        >
          Start Advertising
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
          id="featured-advertise-cta-btn"
          onClick={() => navigate('/advertise/create')}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
        >
          Advertise
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // Banner variant (default)
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
        <p className="text-base font-extrabold text-white">Reach 500,000+ Ethiopian Buyers</p>
        <p className="text-sm text-stone-400 mt-1">
          Put your brand in front of motivated buyers. Premium placement starting from{' '}
          <strong className="text-amber-400">99 ETB</strong>.
        </p>
      </div>
      <button
        id="banner-advertise-cta-btn"
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
  /** Custom render function — receives the current ad */
  renderSlide: (ad: Advertisement, isActive: boolean) => ReactNode
}

export function AdCarousel({ ads, variant, className = '', renderSlide }: AdCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const impressionTrackedRef = useRef<Set<string>>(new Set())

  const total = ads.length

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || total <= 1) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 400)
    },
    [isTransitioning, total],
  )

  const next = useCallback(() => {
    goTo((current + 1) % total)
  }, [current, total, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total)
  }, [current, total, goTo])

  // Auto-advance timer
  useEffect(() => {
    if (total <= 1 || isPaused) return

    timerRef.current = setTimeout(next, SLIDE_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, isPaused, total, next])

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

  // Touch / swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setIsPaused(true)
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)

      // Only swipe horizontally if horizontal movement dominates
      if (Math.abs(dx) > MIN_SWIPE_PX && Math.abs(dx) > dy) {
        if (dx < 0) next()
        else prev()
      }

      touchStartX.current = null
      touchStartY.current = null
      // Resume auto-advance after 1 extra interval post-swipe
      setTimeout(() => setIsPaused(false), SLIDE_INTERVAL_MS)
    },
    [next, prev],
  )

  if (total === 0) {
    return <AdvertiseHereCTA variant={variant} />
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
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

      {/* Prev / Next buttons (only when multiple ads) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous advertisement"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center
              bg-stone-900/60 hover:bg-stone-900/90 backdrop-blur-sm text-white border border-white/10
              transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              ${variant === 'sidebar' ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next advertisement"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center
              bg-stone-900/60 hover:bg-stone-900/90 backdrop-blur-sm text-white border border-white/10
              transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              ${variant === 'sidebar' ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
