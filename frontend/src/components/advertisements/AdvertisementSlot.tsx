import type { AdPlacement, Advertisement } from '../../types/monetization'
import { useAdvertisementSlots } from '../../hooks/useAdvertisementSlots'
import { MarketplaceBannerAd } from './MarketplaceBannerAd'
import { FeaturedAdvertisement } from './FeaturedAdvertisement'
import { SidebarAdvertisement } from './SidebarAdvertisement'
import { AdvertisementSkeleton } from './AdvertisementSkeleton'

interface AdvertisementSlotProps {
  placement: AdPlacement
  /** Optional pre-fetched ads override (array for carousel) */
  ads?: Advertisement[]
  className?: string
  /** Hide gracefully on API error instead of showing empty CTA */
  hideOnError?: boolean
}

/**
 * AdvertisementSlot — routes a placement to the correct carousel component.
 * Fetches all slots once via useAdvertisementSlots (shared 60s cache).
 */
export function AdvertisementSlot({
  placement,
  ads: overrideAds,
  className = '',
  hideOnError = false,
}: AdvertisementSlotProps) {
  const { getSlot, isLoading, error } = useAdvertisementSlots()
  const useSharedFetch = overrideAds === undefined
  const ads = overrideAds ?? getSlot(placement)

  if (error && hideOnError) return null

  if (useSharedFetch && isLoading && ads.length === 0) {
    return <AdvertisementSkeleton placement={placement} className={className} />
  }

  if (placement === 'MARKETPLACE_BANNER') {
    return (
      <MarketplaceBannerAd
        ads={ads}
        isLoading={false}
        className={className}
      />
    )
  }

  if (placement === 'MARKETPLACE_FEATURED') {
    return (
      <FeaturedAdvertisement
        ads={ads}
        isLoading={false}
        className={className}
      />
    )
  }

  if (placement === 'MARKETPLACE_SIDEBAR') {
    return (
      <SidebarAdvertisement
        ads={ads}
        isLoading={false}
        className={className}
      />
    )
  }

  return null
}
