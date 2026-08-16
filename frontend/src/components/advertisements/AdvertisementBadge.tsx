import { Sparkles } from 'lucide-react'

interface AdvertisementBadgeProps {
  className?: string
}

export function AdvertisementBadge({ className = '' }: AdvertisementBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-stone-900/90 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-2xs ${className}`}
    >
      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
      <span>Sponsored</span>
    </span>
  )
}
