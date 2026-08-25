import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as paymentService from '../../services/payment.service'
import { WorkspaceHeader } from '../../components/layout/WorkspaceHeader'

export default function MockCheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reference = searchParams.get('ref') || ''
  const amount = searchParams.get('amount') || '0'
  const providerRef = searchParams.get('providerRef') || ''

  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE')

  const handleSimulate = async (actionStatus: 'SUCCESS' | 'FAILED') => {
    if (!reference) {
      toast.error('Invalid payment reference.')
      return
    }

    try {
      setStatus('PROCESSING')

      // Simulate provider callback / confirmation
      const res = await paymentService.simulateMockPayment(reference, actionStatus)

      if (res.payment.status === 'SUCCESS') {
        setStatus('SUCCESS')
        toast.success('Payment verified & entitlements activated successfully!')
      } else {
        setStatus('FAILED')
        toast.error('Payment simulation marked as failed.')
      }
    } catch (err: any) {
      setStatus('FAILED')
      toast.error(err?.response?.data?.message || 'Verification failed.')
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      <WorkspaceHeader
        title="Payment Gateway Sandbox"
        backUrl="/seller/monetization"
        backLabel="Monetization"
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {/* Sandbox Dev Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-400 text-sm">
              Development Sandbox Payment Gateway
            </h4>
            <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
              This is a safe test environment. No real bank accounts or mobile wallets will be
              charged. You can simulate approved or failed transactions to test end-to-end
              monetization flows.
            </p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-5">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-stone-400">
                Transaction Sandbox
              </span>
              <h1 className="text-2xl font-black text-white mt-0.5">Test Checkout</h1>
            </div>
            <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-500">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800/80 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Reference ID:</span>
              <span className="font-mono text-xs text-stone-200 bg-stone-900 px-2 py-1 rounded">
                {reference || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Provider Token:</span>
              <span className="font-mono text-xs text-stone-400 truncate max-w-[200px]">
                {providerRef || 'MOCK-SESSION'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-850">
              <span className="font-semibold text-stone-300">Amount Due:</span>
              <span className="text-xl font-bold text-amber-400">
                {Number(amount).toLocaleString()} ETB
              </span>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          {status === 'IDLE' && (
            <div className="space-y-3">
              <p className="text-xs text-center text-stone-400 font-medium">
                Choose a simulation outcome to execute:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSimulate('SUCCESS')}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Simulate Success</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulate('FAILED')}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 font-semibold rounded-xl transition"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Simulate Failure</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading / Verification state */}
          {status === 'PROCESSING' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
              <p className="font-bold text-white text-base">Verifying Server Signature...</p>
              <p className="text-xs text-stone-400">
                Executing idempotent PostgreSQL transaction & activating entitlements...
              </p>
            </div>
          )}

          {/* Success Result */}
          {status === 'SUCCESS' && (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Confirmed!</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  Your payment was verified by the backend and all paid features/entitlements are now
                  active.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/seller/monetization')}
                  className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl text-sm transition"
                >
                  Go to Monetization Hub
                </button>
                <button
                  onClick={() => navigate('/my-listings')}
                  className="py-2.5 px-5 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl text-sm transition"
                >
                  View My Listings
                </button>
              </div>
            </div>
          )}

          {/* Failed Result */}
          {status === 'FAILED' && (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/40 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Failed</h3>
                <p className="text-xs text-stone-400 mt-1">
                  The payment was declined or simulated as failed. No entitlements were granted.
                </p>
              </div>
              <div className="pt-2 flex gap-3 justify-center">
                <button
                  onClick={() => setStatus('IDLE')}
                  className="py-2.5 px-5 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl text-sm transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="py-2.5 px-5 bg-stone-900 border border-stone-800 hover:bg-stone-850 text-stone-300 font-medium rounded-xl text-sm transition"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
