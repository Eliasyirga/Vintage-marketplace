import { useEffect, useRef } from 'react'
import type { AdPlacement, Advertisement } from '../../types/monetization'
import { useAdvertisementSlots } from '../../hooks/useAdvertisementSlots'
import { AdvertisementCard } from './AdvertisementCard'
import { AdvertisementCTA } from './AdvertisementCTA'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'
import * as adService from '../../services/advertisement.service'

interface AdvertisementSlotProps {
  placement: AdPlacement
  /** Optional pre-fetched ad override */
  ad?: Advertisement | null
  className?: string
}

export function AdvertisementSlot({ placement, ad: overrideAd, className = '' }: AdvertisementSlotProps) {
  const { getSlot, isLoading } = useAdvertisementSlots()
  const ad = overrideAd !== undefined ? overrideAd : getSlot(placement)
  const slotRef = useRef<HTMLDivElement>(null)
  const impressionRecorded = useRef<string | null>(null)

  useEffect(() => {
    if (!ad || impressionRecorded.current === ad.id) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && impressionRecorded.current !== ad.id) {
          impressionRecorded.current = ad.id
          adService.recordAdImpression(ad.id)
        }
      },
      { threshold: 0.3 }, // at least 30% visible in viewport
    )

    if (slotRef.current) {
      observer.observe(slotRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ad])

  if (isLoading && ad === undefined) {
    return <AdvertisementSkeleton placement={placement} className={className} />
  }

  return (
    <div ref={slotRef} className={`w-full ${className}`}>
      {ad ? (
        <AdvertisementCard ad={ad} placement={placement} />
      ) : (
        <AdvertisementCTA placement={placement} />
      )}
    </div>
  )
}
