import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  getAdminReports,
  updateAdminReport,
  updateListingStatus,
} from '../../services/admin.service'
import type { ReportItem, ReportStatus, ReportPriority } from '../../types/report'
import {
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('PENDING')
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | ''>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Selected report for inspection modal
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminReports({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: 15,
      })
      setReports(data.reports)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
    } catch {
      toast.error('Failed to load reports.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [statusFilter, priorityFilter, page])

  const handleUpdateStatus = async (status: ReportStatus) => {
    if (!selectedReport) return
    setIsUpdating(true)
    try {
      await updateAdminReport(selectedReport.id, {
        status,
        adminNote: adminNote.trim() || undefined,
      })
      toast.success(`Report marked as ${status}`)
      setSelectedReport(null)
      setAdminNote('')
      loadReports()
    } catch {
      toast.error('Failed to update report status.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to remove this listing from the marketplace?')) return
    try {
      await updateListingStatus(listingId, 'REMOVED', 'Violated safety guidelines reported by user.')
      toast.success('Listing removed from marketplace.')
      handleUpdateStatus('RESOLVED')
    } catch {
      toast.error('Failed to remove listing.')
    }
  }

  return (
    <AdminLayout title="Reports & Moderation Queue" subtitle="Manage buyer reports and marketplace violations">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <Filter className="w-4 h-4" /> Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setPage(1)
            }}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as any)
              setPage(1)
            }}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Showing {reports.length} of {totalItems} reports
        </span>
      </div>

      {/* Reports Table / Card List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-800">No reports found</p>
            <p className="text-xs text-stone-400">Try changing your filter settings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          r.priority === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : r.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : r.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{r.targetType}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700">{r.reason.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4 text-stone-600">{r.reporter?.full_name || 'Buyer'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : r.status === 'UNDER_REVIEW'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : r.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(r)
                          setAdminNote(r.adminNote || '')
                        }}
                        className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        Inspect
                      </button>
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

      {/* Inspect / Moderation Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                  Report #{selectedReport.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900">
                  {selectedReport.targetType}: {selectedReport.reason.replace(/_/g, ' ')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">Reporter:</span>
                  <span className="font-bold text-stone-900">{selectedReport.reporter?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">Target ID:</span>
                  <span className="font-mono text-stone-700">{selectedReport.targetId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">Date Filed:</span>
                  <span className="font-medium text-stone-700">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedReport.description && (
                <div className="space-y-1">
                  <span className="font-bold text-stone-700">Reporter Description:</span>
                  <p className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-stone-800 italic">
                    "{selectedReport.description}"
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Admin Internal Note</label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Record why this action was taken for audit log..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Target-Specific Moderator Actions */}
              {selectedReport.targetType === 'LISTING' && (
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <span className="font-bold text-stone-800 block">Direct Listing Actions</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveListing(selectedReport.targetId)}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Listing from Marketplace
                  </button>
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  className="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                >
                  Under Review
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Resolve Report
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('DISMISSED')}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
