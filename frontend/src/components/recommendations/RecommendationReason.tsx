import { Sparkles, TrendingUp } from 'lucide-react'

interface RecommendationReasonProps {
  reason: string
  isPersonalized?: boolean
  className?: string
}

/**
 * Small inline badge explaining why a listing was recommended.
 * Example: "Because you browse Electronics"
 */
export function RecommendationReason({
  reason,
  isPersonalized = true,
  className = '',
}: RecommendationReasonProps) {
  if (!reason) return null

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        isPersonalized
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-stone-100 text-stone-500 border border-stone-200'
      } ${className}`}
    >
      {isPersonalized ? (
        <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
      ) : (
        <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" />
      )}
      <span className="truncate max-w-[140px]">{reason}</span>
    </span>
  )
}
