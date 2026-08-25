import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_INTERVAL_MS = 6000
const MIN_SWIPE_PX = 50

interface UseAdvertisementCarouselOptions {
  total: number
  intervalMs?: number
  onSlideChange?: (index: number) => void
}

/**
 * Shared carousel state: auto-advance, pause on hover/touch, swipe gestures.
 * Used by AdCarousel — extracted for testability and reuse.
 */
export function useAdvertisementCarousel({
  total,
  intervalMs = DEFAULT_INTERVAL_MS,
  onSlideChange,
}: UseAdvertisementCarouselOptions) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => {
      if (total <= 0) return
      const normalized = ((index % total) + total) % total
      if (isTransitioning && normalized === current) return
      setIsTransitioning(true)
      setCurrent(normalized)
      onSlideChange?.(normalized)
      setTimeout(() => setIsTransitioning(false), 400)
    },
    [isTransitioning, total, current, onSlideChange],
  )

  const next = useCallback(() => {
    if (total <= 1) return
    goTo(current + 1)
  }, [current, total, goTo])

  const prev = useCallback(() => {
    if (total <= 1) return
    goTo(current - 1)
  }, [current, total, goTo])

  useEffect(() => {
    if (total <= 1 || isPaused) return
    timerRef.current = setTimeout(next, intervalMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, isPaused, total, next, intervalMs])

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

      if (Math.abs(dx) > MIN_SWIPE_PX && Math.abs(dx) > dy) {
        if (dx < 0) next()
        else prev()
      }

      touchStartX.current = null
      touchStartY.current = null
      setTimeout(() => setIsPaused(false), intervalMs)
    },
    [next, prev, intervalMs],
  )

  return {
    current,
    isPaused,
    setIsPaused,
    goTo,
    next,
    prev,
    handleTouchStart,
    handleTouchEnd,
  }
}
