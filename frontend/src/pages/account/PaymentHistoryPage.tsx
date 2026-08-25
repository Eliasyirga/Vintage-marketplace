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
import * as paymentService from '../../services/payment.service'
import type { Payment } from '../../types/monetization'

const STATUS_BADGES: Record<string, { label: string; className: string; icon: any }> = {
  SUCCESS: {
    label: 'Paid / Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  PENDING: {
    label: 'Pending Confirmation',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Loader2,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-stone-100 text-stone-700 border-stone-200',
    icon: RotateCcw,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-stone-100 text-stone-700 border-stone-200',
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
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 border-b border-stone-200 pb-4">
        <Link
          to="/seller/monetization"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Monetization Hub</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
              <Receipt className="w-6 h-6 text-amber-600" />
              <span>Payment & Billing History</span>
            </h1>
            <p className="text-stone-500 text-xs font-medium mt-0.5">
              Official receipts and verification records for promotions, subscriptions, and transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div>
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-xs font-bold text-stone-500">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No payment transactions yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              When you promote a product or subscribe to premium features, your invoices and receipts will be listed here.
            </p>
            <Link
              to="/pricing"
              className="inline-block mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Browse Plans & Promotions
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
            {/* Mobile Card List (sm:hidden) */}
            <div className="sm:hidden divide-y divide-stone-100">
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
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-stone-900 block capitalize text-sm">
                          {p.purpose.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400">
                          {dateStr}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-600 font-bold">
                          {p.provider}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 select-all truncate max-w-[120px]">
                          {p.reference}
                        </span>
                      </div>

                      <span className="font-black text-amber-600 text-sm">
                        {p.amount.toLocaleString()} {p.currency}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop & Tablet Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
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
                      <tr key={p.id} className="hover:bg-stone-50/80 transition">
                        <td className="px-5 py-3.5 text-xs font-mono text-stone-500 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-stone-900 block capitalize">
                            {p.purpose.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          {p.metadata?.planName && (
                            <span className="text-[11px] text-stone-400 font-medium">
                              {p.metadata.planName}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {p.provider}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-stone-500 select-all">
                          {p.reference}
                        </td>
                        <td className="px-5 py-3.5 font-extrabold text-amber-700 whitespace-nowrap">
                          {p.amount.toLocaleString()} {p.currency}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
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
    </div>
  )
}
