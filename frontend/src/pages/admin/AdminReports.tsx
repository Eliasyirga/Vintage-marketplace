import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  getAdminReports,
  updateAdminReport,
  updateListingStatus,
} from '../../services/admin.service'
import type { ReportItem, ReportStatus, ReportPriority } from '../../types/report'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  X,
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
      setReports(data.reports || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.totalItems || 0)
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse shadow-xs">
            Critical
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            High
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Medium
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            Low
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="Dispute & Safety Reports"
      subtitle="Resolution center for buyer complaints, prohibited goods flags, and seller disputes"
    >
      <div className="space-y-6">
        {/* Filters Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
                setPage(1)
              }}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="">All Report Statuses</option>
              <option value="PENDING">Pending Triage</option>
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
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <span className="text-xs font-bold text-stone-500">
            Showing {reports.length} of {totalItems} incidents
          </span>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading Safety Queue...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-800">All reports resolved!</p>
              <p className="text-xs text-stone-400">There are no pending reports matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Incident Target</th>
                    <th className="py-3 px-4">Violation Category</th>
                    <th className="py-3 px-4">Reported By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date Filed</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">{getPriorityBadge(r.priority)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                          {r.targetType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 capitalize">
                        {r.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {r.reporter?.full_name || 'Anonymous User'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.status === 'PENDING'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(r)
                            setAdminNote(r.adminNote || '')
                          }}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Triage & Resolve"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Report Triage Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Flag className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-stone-900">Incident Triage Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-stone-500">Reason:</span>
                  <span className="font-extrabold text-stone-900 capitalize">{selectedReport.reason.replace(/_/g, ' ')}</span>
                </div>
                {selectedReport.description && (
                  <div className="text-xs text-stone-700 pt-2 border-t border-stone-200 font-medium">
                    "{selectedReport.description}"
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Admin Resolution Note:
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Document moderation decision..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {selectedReport.targetType === 'LISTING' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveListing(selectedReport.targetId)}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs"
                  >
                    Remove Reported Listing
                  </button>
                )}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('DISMISSED')}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Dismiss Report
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  Resolve Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
