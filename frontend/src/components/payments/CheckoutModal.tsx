import { useState } from 'react'
import { X, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import * as paymentService from '../../services/payment.service'
import type { PaymentPurpose } from '../../types/monetization'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  amount: number
  currency?: string
  purpose: PaymentPurpose
  planId?: string
  listingId?: string
  advertisementId?: string
  transactionId?: string
  verificationType?: 'NATIONAL_ID' | 'FACE' | 'BUSINESS'
  onSuccess?: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  currency = 'ETB',
  purpose,
  planId,
  listingId,
  advertisementId,
  transactionId,
  verificationType,
  onSuccess,
}: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      const res = await paymentService.initializePayment({
        planId,
        purpose,
        provider: 'CHAPA',
        listingId,
        advertisementId,
        transactionId,
        verificationType,
        returnUrl: `${window.location.origin}/payment/processing`,
      })

      onSuccess?.()
      if (res.checkoutUrl) {
        toast.success('Redirecting to secure Chapa payment...')
        window.location.href = res.checkoutUrl
      } else {
        throw new Error('No checkout URL received from payment gateway.')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to initialize payment checkout.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800 bg-stone-900/50">
          <div>
            <span className="text-xs font-semibold tracking-wider text-amber-500 uppercase">
              Secure Checkout
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">{title}</h2>
            {subtitle && <p className="text-sm text-stone-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary Box */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400">Total Payable Amount</p>
              <p className="text-2xl font-bold text-amber-500">
                {amount.toLocaleString()} <span className="text-sm text-stone-300">{currency}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>Server-Verified</span>
            </div>
          </div>

          {/* Payment Method - Chapa Hosted */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-3">
              Payment Method:
            </label>
            <div className="p-4 rounded-xl border border-emerald-700/60 bg-emerald-950/20 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-emerald-600 border border-emerald-500 flex items-center justify-center font-black text-white text-xs tracking-wider shadow-sm">
                  CHAPA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Chapa Secure Payment</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                      Direct Hosted
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Pay via Telebirr, CBE Birr, Awash Bank, or Ethiopian Debit Cards.
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-stone-950 text-xs text-stone-400 border border-stone-800/60">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              All transactions are encrypted and verified server-side with Chapa. Your features or
              entitlements will be activated instantly upon payment confirmation.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-stone-800 bg-stone-900/50">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Continue with Chapa</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

