import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { AdminListingItem } from '../../types/admin'
import {
  Search,
  Trash2,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminListings() {
  const [listings, setListings] = useState<AdminListingItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadListings = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getAdminListings({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      })
      setListings(data.listings || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.totalItems || 0)
    } catch {
      toast.error('Failed to load listings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [statusFilter, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadListings()
  }

  const handleStatusUpdate = async (listingId: string, newStatus: string) => {
    let reason = ''
    if (newStatus === 'REMOVED') {
      const r = window.prompt('Please enter the reason for removing this listing (e.g. Prohibited item, counterfeit, spam):')
      if (r === null) return
      reason = r.trim()
    }

    setActionLoadingId(listingId)
    try {
      await adminService.updateListingStatus(listingId, newStatus, reason || undefined, 'Admin moderation action')
      toast.success(`Listing ${newStatus === 'REMOVED' ? 'removed' : 'updated'} successfully.`)
      loadListings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update listing.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
          </span>
        )
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        )
      case 'REMOVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Removed
          </span>
        )
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Sold
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="Listing Moderation"
      subtitle="Inspect catalog quality, moderate prohibited goods, and manage soft-deleted inventory"
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings by title or keywords..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none self-start sm:self-auto"
            >
              <option value="">All Inventory Statuses</option>
              <option value="ACTIVE">Active & Live</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="SOLD">Sold</option>
              <option value="ARCHIVED">Archived</option>
              <option value="REMOVED">Removed by Admin</option>
            </select>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading Marketplace Inventory...
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No listings found</p>
              <p className="text-xs text-stone-500">
                No items match your active search and status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 shrink-0 overflow-hidden">
                            {l.images && l.images[0] ? (
                              <img
                                src={l.images[0].image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-stone-900 block truncate max-w-[180px]">
                              {l.title}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono block">
                              {l.category?.name || 'Used Goods'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block truncate max-w-[130px]">
                          {l.seller?.full_name || 'Seller'}
                        </span>
                        <span className="text-[11px] text-stone-400 truncate block max-w-[130px]">
                          {l.seller?.email || l.seller?.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-700">
                        ETB {Number(l.price).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-mono">
                        {l.views_count || 0}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(l.status)}</td>
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {new Date(l.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/listings/${l.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Inspect Public Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {l.status === 'REMOVED' ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === l.id}
                              onClick={() => handleStatusUpdate(l.id, 'ACTIVE')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoadingId === l.id}
                              onClick={() => handleStatusUpdate(l.id, 'REMOVED')}
                              className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
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
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex items-center justify-between gap-4 text-xs text-stone-500">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-2xs disabled:opacity-40 hover:bg-stone-50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="font-bold text-stone-600">
                Page {page} of {totalPages} ({totalItems} total listings)
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-2xs disabled:opacity-40 hover:bg-stone-50 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
