import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import * as paymentService from '../../services/payment.service'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

export default function PaymentProcessingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [resolvedReference, setResolvedReference] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function resolveAndVerify() {
      // 1. Try resolving reference from URL query params (Chapa, Telebirr, and standard formats)
      const paramRef =
        searchParams.get('ref') ||
        searchParams.get('tx_ref') ||
        searchParams.get('trx_ref') ||
        searchParams.get('reference') ||
        searchParams.get('transaction_id') ||
        searchParams.get('trans_id') ||
        searchParams.get('checkout_ref') ||
        searchParams.get('id') ||
        ''

      // 2. Try resolving reference from browser session/local storage
      const storageRef =
        sessionStorage.getItem('pending_payment_ref') ||
        localStorage.getItem('pending_payment_ref') ||
        ''

      let targetRef = paramRef || storageRef

      // 3. If still not found, check the user's latest payment history as an intelligent fallback
      if (!targetRef) {
        try {
          const history = await paymentService.getMyPaymentHistory()
          if (history && history.length > 0) {
            // Check for most recent PENDING payment or latest payment created within last 20 mins
            const latestPending = history.find((p) => p.status === 'PENDING')
            const latest = latestPending || history[0]
            if (latest && latest.reference) {
              targetRef = latest.reference
            }
          }
        } catch (_) {}
      }

      if (!isMounted) return

      if (!targetRef) {
        setErrorMessage('No payment reference found in URL or session.')
        return
      }

      setResolvedReference(targetRef)

      const statusParam = searchParams.get('status') || ''
      if (statusParam === 'cancelled' || statusParam === 'canceled') {
        try {
          sessionStorage.removeItem('pending_payment_ref')
          localStorage.removeItem('pending_payment_ref')
        } catch (_) {}
        navigate(`/payment/cancelled?ref=${encodeURIComponent(targetRef)}`, { replace: true })
        return
      }

      try {
        const result = await paymentService.verifyPayment(targetRef)

        if (!isMounted) return

        // Clean up storage
        try {
          sessionStorage.removeItem('pending_payment_ref')
          localStorage.removeItem('pending_payment_ref')
        } catch (_) {}

        if (result.payment.status === 'SUCCESS') {
          toast.success('Payment verified successfully!')
          const meta = result.payment.metadata || {}
          const purpose = result.payment.purpose || 'ORDER_PURCHASE'
          const orderId = meta.orderId || meta.transactionId || ''
          const adId = meta.advertisementId || ''

          navigate(
            `/payment/success?ref=${encodeURIComponent(targetRef)}&purpose=${encodeURIComponent(
              purpose,
            )}&orderId=${encodeURIComponent(orderId)}&adId=${encodeURIComponent(adId)}`,
            { replace: true },
          )
        } else {
          navigate(
            `/payment/failed?ref=${encodeURIComponent(targetRef)}&message=${encodeURIComponent(
              'Payment was not completed successfully.',
            )}`,
            { replace: true },
          )
        }
      } catch (err: any) {
        if (!isMounted) return
        const msg = err.response?.data?.message || err.message || 'Unable to verify payment status.'
        navigate(
          `/payment/failed?ref=${encodeURIComponent(targetRef)}&message=${encodeURIComponent(msg)}`,
          { replace: true },
        )
      }
    }

    resolveAndVerify()

    return () => {
      isMounted = false
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-16">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          {errorMessage ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Missing Reference</h2>
              <p className="text-xs text-stone-500">{errorMessage}</p>
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition"
              >
                Return to Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto relative shadow-2xs">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Chapa Verification
                </span>
                <h1 className="text-2xl font-black text-stone-900 mt-2">Payment Processing...</h1>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Please hold on while we securely verify your transaction with Chapa and activate your order.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1 text-left font-mono">
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Reference:</span>
                  <span className="text-stone-900 font-bold truncate max-w-[180px]">{resolvedReference || 'Resolving...'}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Security:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-400">
                Do not close or refresh this tab while verification is underway.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
