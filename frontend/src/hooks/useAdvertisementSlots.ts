import { useState, useEffect, useRef } from 'react'
import type { ActiveAdSlots, Advertisement, AdPlacement } from '../types/monetization'
import * as adService from '../services/advertisement.service'

// Module-level cache shared across all instances
let cachedSlots: ActiveAdSlots | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

const EMPTY_SLOTS: ActiveAdSlots = {
  marketplaceBanner: [],
  marketplaceFeatured: [],
  marketplaceSidebar: [],
}

export function clearSlotCache(): void {
  cachedSlots = null
  cacheTimestamp = 0
}

export function useAdvertisementSlots() {
  const [slots, setSlots] = useState<ActiveAdSlots | null>(cachedSlots)
  const [isLoading, setIsLoading] = useState<boolean>(!cachedSlots)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const fetchSlots = (force = false) => {
    const now = Date.now()

    if (!force && cachedSlots && now - cacheTimestamp < CACHE_TTL_MS) {
      setSlots(cachedSlots)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    adService
      .getActiveSlots()
      .then((data) => {
        if (!isMounted.current) return
        cachedSlots = data
        cacheTimestamp = Date.now()
        setSlots(data)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isMounted.current) return
        console.warn('Failed to load advertisement slots:', err)
        setError('Failed to load ads')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    isMounted.current = true
    fetchSlots()

    return () => {
      isMounted.current = false
    }
  }, [])

  const refreshSlots = () => {
    fetchSlots(true)
  }

  /**
   * Get all active ads for a specific placement slot.
   * Returns an empty array if the slot has no active ads.
   */
  const getSlot = (placement: AdPlacement): Advertisement[] => {
    if (!slots) return []
    if (placement === 'MARKETPLACE_BANNER') return slots.marketplaceBanner
    if (placement === 'MARKETPLACE_FEATURED') return slots.marketplaceFeatured
    if (placement === 'MARKETPLACE_SIDEBAR') return slots.marketplaceSidebar
    return []
  }

  return {
    slots: slots ?? EMPTY_SLOTS,
    getSlot,
    refreshSlots,
    isLoading,
    error,
  }
}
