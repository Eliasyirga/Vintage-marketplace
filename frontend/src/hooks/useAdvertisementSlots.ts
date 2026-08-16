import { useState, useEffect, useRef } from 'react'
import type { ActiveAdSlots, Advertisement, AdPlacement } from '../types/monetization'
import * as adService from '../services/advertisement.service'

let cachedSlots: ActiveAdSlots | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000 // 60 seconds client-side cache

export function useAdvertisementSlots() {
  const [slots, setSlots] = useState<ActiveAdSlots | null>(cachedSlots)
  const [isLoading, setIsLoading] = useState<boolean>(!cachedSlots)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    const now = Date.now()

    if (cachedSlots && now - cacheTimestamp < CACHE_TTL_MS) {
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

    return () => {
      isMounted.current = false
    }
  }, [])

  const getSlot = (placement: AdPlacement): Advertisement | null => {
    if (!slots) return null
    if (placement === 'HOME_TOP') return slots.homeTop
    if (placement === 'MARKETPLACE_MIDDLE') return slots.marketplaceMiddle
    if (placement === 'MARKETPLACE_BOTTOM') return slots.marketplaceBottom
    return null
  }

  return {
    slots,
    getSlot,
    isLoading,
    error,
  }
}
