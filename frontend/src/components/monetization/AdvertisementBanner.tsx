import { AdvertisementSlot } from '../advertisements/AdvertisementSlot'
import type { AdPlacement } from '../../types/monetization'

interface AdvertisementBannerProps {
  placement?: AdPlacement | 'HOME_BANNER' | 'CATEGORY_BANNER' | 'SIDEBAR'
  className?: string
}

export function AdvertisementBanner({
  placement = 'MARKETPLACE_BANNER',
  className = '',
}: AdvertisementBannerProps) {
  // Map legacy placement names gracefully to the 3-slot system
  const mappedPlacement: AdPlacement =
    placement === 'HOME_BANNER'
      ? 'MARKETPLACE_BANNER'
      : placement === 'CATEGORY_BANNER'
      ? 'MARKETPLACE_FEATURED'
      : placement === 'SIDEBAR'
      ? 'MARKETPLACE_SIDEBAR'
      : (placement as AdPlacement) || 'MARKETPLACE_BANNER'

  return <AdvertisementSlot placement={mappedPlacement} className={className} />
}
