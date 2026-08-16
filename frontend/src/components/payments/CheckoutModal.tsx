import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as paymentService from '../../services/payment.service'
import type { PaymentProviderName, PaymentPurpose } from '../../types/monetization'

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
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderName>('MOCK')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      const res = await paymentService.initializePayment({
        planId,
        purpose,
        provider: selectedProvider,
        listingId,
        advertisementId,
        transactionId,
        verificationType,
        returnUrl: window.location.href,
      })

      if (res.mode === 'MOCK_DEV') {
        toast.success('Test payment initialized! Redirecting to sandbox checkout...')
        onSuccess?.()
        onClose()
        // Extract query params from checkoutUrl
        const url = new URL(res.checkoutUrl)
        navigate(`/checkout/mock${url.search}`)
      } else {
        onSuccess?.()
        // Real provider gateway redirect
        window.location.href = res.checkoutUrl
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize payment checkout.')
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

          {/* Payment Method Selector */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-3">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {/* Development Sandbox */}
              <button
                type="button"
                onClick={() => setSelectedProvider('MOCK')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left ${
                  selectedProvider === 'MOCK'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center font-bold text-amber-500 text-sm">
                    DEV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Development Sandbox Payment</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                        Safe Dev Mode
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Instant test simulation with zero real payment credentials required.
                    </p>
                  </div>
                </div>
                {selectedProvider === 'MOCK' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 ml-2" />
                )}
              </button>

              {/* Chapa Gateway */}
              <button
                type="button"
                onClick={() => setSelectedProvider('CHAPA')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left ${
                  selectedProvider === 'CHAPA'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center font-bold text-emerald-400 text-xs">
                    CHAPA
                  </div>
                  <div>
                    <span className="font-semibold text-sm">Chapa (Cards, Banks & Wallets)</span>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Pay via CBE Birr, Telebirr, Awash, or Ethiopian Debit Cards.
                    </p>
                  </div>
                </div>
                {selectedProvider === 'CHAPA' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 ml-2" />
                )}
              </button>

              {/* Telebirr Direct */}
              <button
                type="button"
                onClick={() => setSelectedProvider('TELEBIRR')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition text-left ${
                  selectedProvider === 'TELEBIRR'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-900/40 border border-blue-700/50 flex items-center justify-center font-bold text-blue-400 text-xs">
                    TELEBIRR
                  </div>
                  <div>
                    <span className="font-semibold text-sm">Telebirr Mobile Money</span>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Pay directly via Ethio Telecom Telebirr prompt.
                    </p>
                  </div>
                </div>
                {selectedProvider === 'TELEBIRR' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 ml-2" />
                )}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-stone-950 text-xs text-stone-400 border border-stone-800/60">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              All transactions are encrypted and verified server-side. Entitlements activate
              automatically upon confirmed provider callback.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-800 bg-stone-900/50">
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
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Proceed to Payment</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
