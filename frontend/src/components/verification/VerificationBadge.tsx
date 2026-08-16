import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { VerificationStatus, VerificationType } from '../../types/verification'

interface VerificationBadgeProps {
  status?: VerificationStatus
  type?: VerificationType
  label?: string
  showIconOnly?: boolean
  size?: 'sm' | 'md'
}

export function VerificationBadge({
  status = 'VERIFIED',
  type,
  label,
  showIconOnly = false,
  size = 'md',
}: VerificationBadgeProps) {
  if (status === 'UNVERIFIED') return null

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  if (status === 'PENDING') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full ${sizeClasses}`}
        title="Verification pending admin review"
      >
        <Clock className="w-3 h-3" />
        {!showIconOnly && (label || `${type ? type.replace('_', ' ') : ''} Pending`)}
      </span>
    )
  }

  if (status === 'REJECTED') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold bg-red-50 text-red-700 border border-red-200 rounded-full ${sizeClasses}`}
        title="Verification rejected"
      >
        <XCircle className="w-3 h-3" />
        {!showIconOnly && (label || 'Verification Rejected')}
      </span>
    )
  }

  // VERIFIED
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full ${sizeClasses}`}
      title="Verified by Vintage Marketplace"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      {!showIconOnly && (label || (type ? `${type.replace('_', ' ')} Verified` : 'Verified Seller'))}
    </span>
  )
}
