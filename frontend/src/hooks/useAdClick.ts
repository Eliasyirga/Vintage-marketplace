import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Advertisement } from '../types/monetization'
import * as adService from '../services/advertisement.service'
import { getAdCtaText, getInternalAdPath, isInternalAdUrl } from '../utils/advertisementUtils'

export function useAdClick(ad: Advertisement) {
  const navigate = useNavigate()

  return useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation()
      try {
        const result = await adService.recordAdClick(ad.id)
        const url = result.targetUrl || ad.targetUrl

        if (isInternalAdUrl(url)) {
          navigate(getInternalAdPath(url))
          return
        }

        window.open(url, '_blank', 'noopener,noreferrer')
      } catch {
        if (isInternalAdUrl(ad.targetUrl)) {
          navigate(getInternalAdPath(ad.targetUrl))
        } else {
          window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
        }
      }
    },
    [ad, navigate],
  )
}

export function useAdCtaLabel(ad: Advertisement): string {
  return getAdCtaText(ad.targetUrl)
}
