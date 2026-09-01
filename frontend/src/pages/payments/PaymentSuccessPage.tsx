import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, ArrowRight, ShoppingBag, Megaphone, UserCheck, Sparkles } from 'lucide-react'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reference = searchParams.get('ref') || 'N/A'
  const purpose = searchParams.get('purpose') || 'ORDER_PURCHASE'
  const orderId = searchParams.get('orderId') || ''

  const isOrder = purpose === 'ORDER_PURCHASE' || purpose === 'DELIVERY'
  const isAd = purpose === 'ADVERTISEMENT'
  const isSubscription =
    purpose === 'PREMIUM_SUBSCRIPTION' ||
    purpose === 'BUSINESS_SUBSCRIPTION' ||
    purpose === 'FEATURED_LISTING' ||
    purpose === 'LISTING_BOOST' ||
    purpose === 'VERIFICATION'

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-16">
        <div className="max-w-lg w-full bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          {/* Animated Success Badge */}
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-500/40 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3 h-3" /> Chapa Verified
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Payment Successful
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-sm mx-auto">
              Your payment has been successfully verified. All associated services and entitlements are now active.
            </p>
          </div>

          {/* Transaction Metadata Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2 text-left font-mono">
            <div className="flex justify-between items-center text-stone-500">
              <span>Transaction Reference:</span>
              <span className="text-stone-900 font-bold bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px] truncate max-w-[200px]">
                {reference}
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-500">
              <span>Payment Gateway:</span>
              <span className="text-emerald-700 font-bold font-sans">Chapa (Hosted)</span>
            </div>
            <div className="flex justify-between items-center text-stone-500">
              <span>Security Status:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Server-Side
              </span>
            </div>
          </div>

          {/* Purpose-Specific Action CTAs */}
          <div className="space-y-3 pt-2">
            {isOrder && (
              <button
                type="button"
                onClick={() => (orderId ? navigate(`/orders/${orderId}`) : navigate('/account/orders'))}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Order Details</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            )}

            {isAd && (
              <button
                type="button"
                onClick={() => navigate('/advertise/my-ads')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition"
              >
                <Megaphone className="w-4 h-4" />
                <span>View My Advertisement</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            )}

            {isSubscription && (
              <button
                type="button"
                onClick={() => navigate('/seller/monetization')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>View Active Entitlements</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            )}

            <div className="flex items-center justify-center gap-4 pt-1 text-xs">
              <Link
                to="/marketplace"
                className="text-stone-500 hover:text-stone-900 font-bold transition"
              >
                Browse Marketplace
              </Link>
              <span className="text-stone-300">•</span>
              <Link
                to="/account/payments"
                className="text-stone-500 hover:text-stone-900 font-bold transition"
              >
                Payment History
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
