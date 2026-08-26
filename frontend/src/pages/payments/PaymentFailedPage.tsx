import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { XCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reference = searchParams.get('ref') || 'N/A'
  const message =
    searchParams.get('message') || 'The transaction could not be completed or was declined by the provider.'

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-16">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          {/* Failed Badge */}
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-400/40 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <XCircle className="w-10 h-10 text-rose-600" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full mb-2">
              <ShieldAlert className="w-3 h-3" /> Transaction Incomplete
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Payment Failed
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-sm mx-auto">
              {message}
            </p>
          </div>

          {/* Transaction Reference Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2 text-left font-mono">
            <div className="flex justify-between items-center text-stone-500">
              <span>Reference ID:</span>
              <span className="text-stone-900 font-bold bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px] truncate max-w-[180px]">
                {reference}
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-500">
              <span>Status:</span>
              <span className="text-rose-600 font-bold font-sans">DECLINED / UNVERIFIED</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-sm font-bold rounded-2xl shadow-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              to="/marketplace"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Marketplace</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
