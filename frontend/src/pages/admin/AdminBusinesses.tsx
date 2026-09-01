import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { AdminBusinessItem } from '../../types/admin'
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Store,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<AdminBusinessItem[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadBusinesses = (page = 1) => {
    setIsLoading(true)
    adminService
      .getAdminBusinesses({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      })
      .then((data) => {
        setBusinesses(data.businesses || [])
        setPagination(data.pagination || null)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadBusinesses(1)
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadBusinesses(1)
  }

  const handleStatusChange = async (businessId: string, newStatus: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    setActionLoadingId(businessId)
    try {
      await adminService.updateBusinessStatus(businessId, newStatus)
      toast.success(`Business profile marked as ${newStatus}`)
      loadBusinesses(pagination?.currentPage || 1)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update business')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Store
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
            <Clock className="w-3 h-3 text-amber-600" /> Under Review
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="Business Directory & Stores"
      subtitle="Oversight on commercial merchants, tax/TIN compliance, and verified business entitlements"
    >
      <div className="space-y-6">
        {/* Filter Toolbar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business name, TIN, or license..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none self-start sm:self-auto"
            >
              <option value="">All Verification Statuses</option>
              <option value="VERIFIED">Verified Stores</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Business Grid / Table */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading Business Stores...
              </p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No registered businesses found</p>
              <p className="text-xs text-stone-500">
                No business profiles match the selected criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                    <th className="py-3 px-4">Business Store</th>
                    <th className="py-3 px-4">Owner Contact</th>
                    <th className="py-3 px-4">TIN / License</th>
                    <th className="py-3 px-4">Inventory Quota</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {businesses.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
                            {b.logo ? (
                              <img src={b.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Store className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-stone-900 block truncate max-w-[150px]">
                              {b.business_name}
                            </span>
                            <span className="text-[10px] text-stone-400 capitalize block">
                              {b.business_category || 'Commercial Retail'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block truncate max-w-[140px]">
                          {b.user?.full_name || 'Business Owner'}
                        </span>
                        <span className="text-[11px] text-stone-400 truncate block max-w-[140px]">
                          {b.user?.email || b.user?.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="block text-stone-900 font-semibold">TIN: {b.tin_number || 'N/A'}</span>
                        <span className="text-stone-400 text-[10px] block">City: {b.city || 'Addis Ababa'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-stone-900 text-xs">
                            {b.listingsCount} / {b.maxListingQuota}
                          </span>
                          <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (b.listingsCount / b.maxListingQuota) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(b.registration_status)}</td>
                      <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.registration_status !== 'VERIFIED' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleStatusChange(b.id, 'VERIFIED')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                            >
                              Verify
                            </button>
                          )}
                          {b.registration_status !== 'REJECTED' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleStatusChange(b.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-colors"
                            >
                              Reject
                            </button>
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
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total stores)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => loadBusinesses(pagination.currentPage - 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 font-bold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => loadBusinesses(pagination.currentPage + 1)}
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
