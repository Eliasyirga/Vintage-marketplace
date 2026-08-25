import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'
import { getListingLimits, type ListingLimitInfo } from '../../services/listing.service'

interface ListingLimitBannerProps {
  /** If true, also disables/greys the child content when at limit */
  blockOnLimit?: boolean
  /** Called whenever limit info resolves */
  onLimitResolved?: (info: ListingLimitInfo) => void
}

const TIER_LABELS: Record<string, string> = {
  FREE: 'Basic',
  PREMIUM: 'Premium',
  BUSINESS: 'Business',
  ADMIN: 'Admin',
}

export function ListingLimitBanner({ onLimitResolved }: ListingLimitBannerProps) {
  const [limitInfo, setLimitInfo] = useState<ListingLimitInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getListingLimits()
      .then((info) => {
        if (cancelled) return
        setLimitInfo(info)
        onLimitResolved?.(info)
      })
      .catch(() => {
        // Silently fail — backend still enforces the rule
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading || !limitInfo) return null

  const { tier, limit, currentCount, remaining, canCreate } = limitInfo
  const pct = Math.min(100, Math.round((currentCount / limit) * 100))
  const tierLabel = TIER_LABELS[tier] ?? tier
  const isUnlimited = limit >= 9999

  if (isUnlimited) {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500 bg-stone-100 border border-stone-200 rounded-lg px-4 py-2.5 mb-6">
        <CheckCircle size={15} className="text-amber-500 shrink-0" />
        <span>
          <strong className="text-stone-700">{tierLabel} Account</strong> — Unlimited active listings
          <span className="ml-2 text-stone-400">({currentCount} active)</span>
        </span>
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-800 text-sm">Listing limit reached</p>
            <p className="text-red-700 text-xs mt-0.5">
              You have reached the maximum number of active listings allowed for your{' '}
              <strong>{tierLabel}</strong> account ({currentCount}/{limit}).
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-red-600 font-medium">
            <span>Active Listings</span>
            <span>{currentCount} / {limit}</span>
          </div>
          <div className="h-2 rounded-full bg-red-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <p className="text-xs text-red-600 flex-1 min-w-0">
            Archive or sell an existing listing to free up a slot.
          </p>
          {(tier === 'FREE' || tier === 'PREMIUM') && (
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shrink-0"
            >
              <TrendingUp size={13} />
              Upgrade Account
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Near-limit warning (>= 80%)
  if (pct >= 80) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              Approaching listing limit — {remaining} slot{remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
          {(tier === 'FREE' || tier === 'PREMIUM') && (
            <Link
              to="/pricing"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0"
            >
              Upgrade
            </Link>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-amber-700 font-medium">
            <span>Active Listings ({tierLabel})</span>
            <span>{currentCount} / {limit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Default: show a subtle counter only
  return (
    <div className="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 mb-6">
      <CheckCircle size={14} className="text-green-500 shrink-0" />
      <span>
        <strong className="text-stone-700">{tierLabel} Account</strong> — Active Listings:&nbsp;
        <span className="font-semibold text-stone-800">{currentCount}</span>
        <span className="text-stone-400"> / {limit}</span>
        <span className="ml-2 text-green-600 text-xs">({remaining} remaining)</span>
      </span>
    </div>
  )
}
