import { AdvertisementSlot } from '../advertisements/AdvertisementSlot'
import type { AdPlacement } from '../../types/monetization'

interface AdvertisementBannerProps {
  placement?: AdPlacement | 'HOME_BANNER' | 'MARKETPLACE_BANNER' | 'CATEGORY_BANNER' | 'SIDEBAR'
  className?: string
}

export function AdvertisementBanner({ placement = 'HOME_TOP', className = '' }: AdvertisementBannerProps) {
  // Map old placement names gracefully to new 3-slot system
  const mappedPlacement: AdPlacement =
    placement === 'MARKETPLACE_BANNER'
      ? 'MARKETPLACE_MIDDLE'
      : placement === 'CATEGORY_BANNER' || placement === 'SIDEBAR'
      ? 'MARKETPLACE_BOTTOM'
      : (placement as AdPlacement) || 'HOME_TOP'

  return <AdvertisementSlot placement={mappedPlacement} className={className} />
}
