import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  Loader2,
  CreditCard,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import * as paymentService from '../../services/payment.service'
import type { Payment } from '../../types/monetization'

const STATUS_BADGES: Record<string, { label: string; className: string; icon: any }> = {
  SUCCESS: {
    label: 'Paid / Active',
    className: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    icon: CheckCircle2,
  },
  PENDING: {
    label: 'Pending Confirmation',
    className: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
    icon: Loader2,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-rose-950/60 text-rose-400 border-rose-800/40',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-stone-800 text-stone-400 border-stone-700',
    icon: RotateCcw,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-stone-800 text-stone-400 border-stone-700',
    icon: XCircle,
  },
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentService
      .getMyPaymentHistory()
      .then((data) => setPayments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb & Header */}
        <div className="space-y-3 border-b border-stone-800 pb-6">
          <Link
            to="/seller/monetization"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Monetization Hub</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Payment & Billing History</h1>
              <p className="text-stone-400 text-sm mt-1">
                Official receipts and verification records for promotions, subscriptions, and
                transactions.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 p-8 rounded-3xl bg-stone-900/40 border border-stone-800 text-center space-y-3">
              <CreditCard className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No payment transactions yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                When you promote a product or subscribe to premium features, your invoices and
                receipts will be listed here.
              </p>
              <Link
                to="/pricing"
                className="inline-block mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs rounded-xl transition"
              >
                Browse Plans & Promotions
              </Link>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-300">
                  <thead className="bg-stone-950 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {payments.map((p) => {
                      const badge = STATUS_BADGES[p.status] || STATUS_BADGES.PENDING
                      const Icon = badge.icon
                      const dateStr = new Date(p.paidAt || p.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        },
                      )

                      return (
                        <tr key={p.id} className="hover:bg-stone-850/50 transition">
                          <td className="px-6 py-4 text-xs font-mono text-stone-400 whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-white block capitalize">
                              {p.purpose.replace(/_/g, ' ').toLowerCase()}
                            </span>
                            {p.metadata?.planName && (
                              <span className="text-xs text-stone-400">
                                {p.metadata.planName}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono bg-stone-950 px-2 py-1 rounded border border-stone-800">
                              {p.provider}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-stone-400 select-all">
                            {p.reference}
                          </td>
                          <td className="px-6 py-4 font-bold text-amber-400 whitespace-nowrap">
                            {p.amount.toLocaleString()} {p.currency}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
