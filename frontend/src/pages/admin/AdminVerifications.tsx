import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  getAdminVerifications,
  approveVerification,
  rejectVerification,
} from '../../services/admin.service'
import type { UserVerificationItem } from '../../types/verification'
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  X,
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
      setVerifications(data.verifications || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.totalItems || 0)
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
      toast.success('Verification approved and badge issued!')
      loadVerifications()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve verification.')
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingId) return
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="Identity & Fayda Verifications"
      subtitle="Oversight of National ID, Fayda OIDC integration, and verified seller status"
    >
      <div className="space-y-6">
        {/* Filters Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="">All Verification Records</option>
            <option value="PENDING">Pending Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <span className="text-xs font-bold text-stone-500">
            Showing {verifications.length} of {totalItems} submissions
          </span>
        </div>

        {/* Verifications Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading Verification Queue...
              </p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-800">No verifications pending</p>
              <p className="text-xs text-stone-400">All identity verification requests have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User Account</th>
                    <th className="py-3 px-4">Verification Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-stone-900 block">
                              {v.user?.full_name || 'User Account'}
                            </span>
                            <span className="text-[11px] text-stone-400 font-mono block">
                              {v.user?.email || v.user?.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md text-[11px] border border-blue-100">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          {v.verificationType === 'NATIONAL_ID' ? 'Fayda National ID' : v.verificationType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(v.status)}</td>
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status === 'PENDING' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(v.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(v.id)
                                  setRejectionReason('')
                                }}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-stone-400 text-xs italic">
                              {v.status === 'VERIFIED' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold disabled:opacity-40 hover:bg-stone-50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="font-bold text-stone-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold disabled:opacity-40 hover:bg-stone-50 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">Reject Verification Request</h3>
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Reason for rejection:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. National ID document is blurry, expired, or does not match account name..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
