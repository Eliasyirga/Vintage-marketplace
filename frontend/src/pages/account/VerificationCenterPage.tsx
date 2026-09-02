import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  BadgeCheck,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as verificationService from '../../services/verification.service'

interface VerificationItem {
  id: string
  title: string
  description: string
  icon: typeof Mail
  status: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'COMING_SOON'
  badgeLabel: string
}

export default function VerificationCenterPage() {
  const { user } = useAuth()
  const [isFaydaLoading, setIsFaydaLoading] = useState(false)

  const handleStartFayda = async () => {
    try {
      setIsFaydaLoading(true)
      let { redirectUrl } = await verificationService.initiateFaydaVerification()
      if (!window.location.hostname.includes('localhost') && redirectUrl.includes('localhost:5000')) {
        redirectUrl = redirectUrl.replace('http://localhost:5000', 'https://vintage-marketplace-6.onrender.com')
      }
      // Redirect to official Fayda OIDC authorization endpoint
      window.location.href = redirectUrl
    } catch (err: any) {
      setIsFaydaLoading(false)
      const msg = err.response?.data?.message || err.message || 'Failed to initiate Fayda verification.'
      toast.error(msg)
    }
  }

  const verifications: VerificationItem[] = [
    {
      id: 'email',
      title: 'Email Address Verification',
      description: 'Confirms your email for order receipts, security alerts, and dispute resolutions.',
      icon: Mail,
      status: user?.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED',
      badgeLabel: user?.isEmailVerified ? 'Verified' : 'Unverified',
    },
    {
      id: 'phone',
      title: 'Ethiopian Phone Verification',
      description: 'Enables SMS transaction alerts and meet-in-person purchase communications. SMS verification is being integrated with Ethiopian carriers and will be available soon.',
      icon: Phone,
      status: 'COMING_SOON',
      badgeLabel: 'Coming Soon',
    },
    {
      id: 'fayda',
      title: 'Fayda / National ID Verification',
      description: 'Verifies your official Ethiopian national identity to grant the Gold Verified Seller badge.',
      icon: Shield,
      status: user?.isFaydaVerified ? 'VERIFIED' : 'UNVERIFIED',
      badgeLabel: user?.isFaydaVerified ? 'Fayda Verified' : 'Action Required',
    },
  ]

  // Only count actual verifications (not COMING_SOON) toward score
  const verifiedCount = verifications.filter((v) => v.status === 'VERIFIED').length
  const totalActive = verifications.filter((v) => v.status !== 'COMING_SOON').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Identity & Verification Center</h1>
        <p className="text-sm text-stone-500 mt-1">
          Verify your identity to increase buyer trust, unlock instant payouts, and earn seller badges.
        </p>
      </div>

      {/* Verification Level Progress */}
      <div className="p-6 bg-gradient-to-br from-stone-900 to-amber-950 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-lg shadow-md">
              <BadgeCheck className="w-7 h-7 text-stone-950" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Verification Score: {verifiedCount} / {totalActive} Completed
              </h3>
              <p className="text-xs text-amber-200/80">
                {verifiedCount >= totalActive
                  ? 'Excellent! You have the highest trust rating on the platform.'
                  : 'Complete more verifications to unlock verified badge on your listings.'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${totalActive > 0 ? (verifiedCount / totalActive) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Verification List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verifications.map((item) => {
          const Icon = item.icon
          const isVerified = item.status === 'VERIFIED'
          const isComingSoon = item.status === 'COMING_SOON'

          return (
            <div
              key={item.id}
              className={`p-6 bg-white rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 ${
                isComingSoon ? 'border-stone-200 opacity-80' : 'border-stone-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-600'
                        : isComingSoon
                          ? 'bg-stone-100 text-stone-400'
                          : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                        isVerified
                          ? 'text-emerald-600'
                          : isComingSoon
                            ? 'text-stone-400'
                            : 'text-amber-600'
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.badgeLabel}</span>
                        </>
                      ) : isComingSoon ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.badgeLabel}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{item.badgeLabel}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                {isVerified ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Security Active
                  </span>
                ) : isComingSoon ? (
                  <span className="text-xs font-semibold text-stone-400 italic">
                    We'll notify you when available
                  </span>
                ) : item.id === 'fayda' ? (
                  <button
                    onClick={handleStartFayda}
                    disabled={isFaydaLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50"
                  >
                    {isFaydaLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting to Fayda...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify with Fayda Digital ID</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => toast.success('Verification request submitted for processing.')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    <span>Start Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
