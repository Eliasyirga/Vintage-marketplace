import { useEffect, useState } from 'react'
import { RecommendationSection } from './RecommendationSection'
import { getSimilarListings } from '../../services/recommendation.service'
import type { RecommendationItem } from '../../types/recommendation'

interface SimilarProductsProps {
  listingId: string
  limit?: number
  className?: string
}

/**
 * Displays listings similar to the given product.
 * Used at the bottom of the Listing Details page.
 */
export function SimilarProducts({ listingId, limit = 8, className = '' }: SimilarProductsProps) {
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getSimilarListings(listingId, limit).then((res) => {
      if (!cancelled) {
        setItems(res.items)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [listingId, limit])

  if (!isLoading && items.length === 0) return null

  return (
    <RecommendationSection
      title="You May Also Like"
      subtitle="Similar products you might be interested in"
      items={items}
      isPersonalized={false}
      isLoading={isLoading}
      className={className}
    />
  )
}
