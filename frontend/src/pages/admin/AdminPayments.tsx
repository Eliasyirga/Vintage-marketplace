import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { AdminPaymentItem } from '../../types/admin'
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadPayments = (page = 1) => {
    setIsLoading(true)
    adminService
      .getAdminPayments({
        page,
        limit: 20,
        search: search.trim() || undefined,
        purpose: purposeFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((data) => {
        setPayments(data.payments || [])
        setSummary(data.summary || null)
        setPagination(data.pagination || null)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadPayments(1)
  }, [purposeFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadPayments(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled / Success
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        )
    }
  }

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'ORDER_PURCHASE':
        return 'Order Purchase'
      case 'ADVERTISEMENT':
        return 'Ad Placement'
      case 'BUSINESS_SUBSCRIPTION':
        return 'Business Subscription'
      case 'VERIFICATION':
        return 'ID Verification'
      case 'FEATURED_LISTING':
        return 'Featured Listing'
      default:
        return purpose || 'Transaction'
    }
  }

  return (
    <AdminLayout
      title="Chapa Payments Ledger"
      subtitle="Complete settlement registry and real-time transaction ledger (Chapa Gateway)"
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Settlement Volume
              </span>
              <p className="text-2xl sm:text-3xl font-black text-stone-900">
                ETB {summary.totalVolume?.toLocaleString() || 0}
              </p>
              <p className="text-[11px] text-stone-400 font-semibold">Total verified gross</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Successful Payments
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                {summary.successfulCount?.toLocaleString() || 0}
              </p>
              <p className="text-[11px] text-emerald-600/80 font-semibold">Verified via webhook</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Failed Attempts
              </span>
              <p className="text-2xl sm:text-3xl font-black text-red-600">
                {summary.failedCount?.toLocaleString() || 0}
              </p>
              <p className="text-[11px] text-red-600/80 font-semibold">Declined or timed out</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Pending Settlements
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600">
                {summary.pendingCount?.toLocaleString() || 0}
              </p>
              <p className="text-[11px] text-amber-600/80 font-semibold">Awaiting gateway return</p>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search merchant reference or provider ID..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Payment Purposes</option>
                <option value="ORDER_PURCHASE">Order Purchase</option>
                <option value="ADVERTISEMENT">Advertisement</option>
                <option value="BUSINESS_SUBSCRIPTION">Business Subscription</option>
                <option value="VERIFICATION">Verification</option>
                <option value="FEATURED_LISTING">Featured Listing</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success / Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading Payments Ledger...
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No payment transactions found</p>
              <p className="text-xs text-stone-500">
                No Chapa payment records match the current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                    <th className="py-3 px-4">Merchant Reference</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {p.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block truncate max-w-[140px]">
                          {p.user?.full_name || 'Customer'}
                        </span>
                        <span className="text-[11px] text-stone-400 truncate block max-w-[140px]">
                          {p.user?.email || p.user?.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-700">
                          {getPurposeLabel(p.purpose)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-stone-900">
                        {p.currency || 'ETB'} {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          CHAPA
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total transactions)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => loadPayments(pagination.currentPage - 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 font-bold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => loadPayments(pagination.currentPage + 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
