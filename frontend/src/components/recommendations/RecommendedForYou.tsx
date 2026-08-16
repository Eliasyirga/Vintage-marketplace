import { useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { getRecommendations } from '../../services/recommendation.service'
import { RecommendationSection } from './RecommendationSection'
import type { RecommendationItem } from '../../types/recommendation'

interface RecommendedForYouProps {
  limit?: number
  maxItems?: number
  viewMoreHref?: string
  className?: string
}

/**
 * Fetches and displays personalized recommendations.
 * Guests see trending/popular fallback content.
 */
export function RecommendedForYou({
  limit = 12,
  maxItems = 12,
  viewMoreHref = '/browse',
  className = '',
}: RecommendedForYouProps) {
  const { isAuthenticated } = useAuthContext()
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getRecommendations(limit).then((res) => {
      if (!cancelled) {
        setItems(res.items)
        setIsPersonalized(res.isPersonalized)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [limit, isAuthenticated])

  const title = isPersonalized ? 'Recommended for You' : 'Trending on Vintage'
  const subtitle = isPersonalized
    ? 'Based on your activity'
    : 'Popular listings across Ethiopia'

  return (
    <RecommendationSection
      title={title}
      subtitle={subtitle}
      items={items}
      isPersonalized={isPersonalized}
      isLoading={isLoading}
      viewMoreHref={viewMoreHref}
      maxItems={maxItems}
      className={className}
    />
  )
}
