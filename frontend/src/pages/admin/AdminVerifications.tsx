import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  getAdminVerifications,
  approveVerification,
  rejectVerification,
} from '../../services/admin.service'
import type { UserVerificationItem } from '../../types/verification'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState<UserVerificationItem[]>([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Rejection modal
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadVerifications = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminVerifications({
        status: statusFilter || undefined,
        page,
        limit: 15,
      })
      setVerifications(data.verifications)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
    } catch {
      toast.error('Failed to load verifications.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVerifications()
  }, [statusFilter, page])

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this verification?')) return
    try {
      await approveVerification(id)
      toast.success('Verification approved!')
      loadVerifications()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve verification.')
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingId || !rejectionReason.trim()) {
      toast.error('Please specify a rejection reason.')
      return
    }

    setIsSubmitting(true)
    try {
      await rejectVerification(rejectingId, rejectionReason.trim())
      toast.success('Verification rejected.')
      setRejectingId(null)
      setRejectionReason('')
      loadVerifications()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject verification.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout title="Identity Verifications" subtitle="Review National ID, phone, and seller verification requests">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="VERIFIED">Approved / Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Showing {verifications.length} of {totalItems} items
        </span>
      </div>

      {/* Verifications Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-20 text-xs text-stone-400 font-medium">
            No verification requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Verification Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4">Rejection Reason</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{v.user?.full_name || 'User'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {v.verificationType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : v.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                      {v.rejectionReason || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {v.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(v.id)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(v.id)}
                            className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-bold text-stone-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 font-black">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Verification</span>
            </div>
            <p className="text-xs text-stone-500">
              Please explain why this verification request was rejected. The reason will be stored for audit purposes.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Identity document photo was blurred or mismatched..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null)
                    setRejectionReason('')
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
