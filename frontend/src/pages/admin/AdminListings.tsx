import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { getAdminListings, updateListingStatus } from '../../services/admin.service'
import { Search, Trash2, RotateCcw, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminListings() {
  const [listings, setListings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadListings = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminListings({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      })
      setListings(data.listings)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
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
    const action = newStatus === 'REMOVED' ? 'remove' : 'restore'
    if (!confirm(`Are you sure you want to ${action} this listing?`)) return

    try {
      await updateListingStatus(listingId, newStatus as any, `Admin moderation action: ${action}`)
      toast.success(`Listing ${action}d successfully.`)
      loadListings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update listing.')
    }
  }

  return (
    <AdminLayout title="Listing Moderation" subtitle="Inspect and moderate marketplace inventory">
      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings by title..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SOLD">Sold</option>
          <option value="ARCHIVED">Archived</option>
          <option value="REMOVED">Removed by Admin</option>
        </select>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-xs text-stone-400 font-medium">
            No listings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Listing</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900 max-w-xs truncate">
                      {l.title}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{l.seller?.full_name || 'Seller'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-700">
                      {Number(l.price).toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{l.condition}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          l.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : l.status === 'REMOVED'
                            ? 'bg-red-100 text-red-700 font-black'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/listings/${l.id}`}
                          className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
                          title="View public page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {l.status === 'REMOVED' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(l.id, 'ACTIVE')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(l.id, 'REMOVED')}
                            className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] flex items-center gap-1"
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
          <div className="p-4 border-t border-stone-200 flex items-center justify-between gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs disabled:opacity-40 hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-bold text-stone-600">
              Page {page} of {totalPages} ({totalItems} total listings)
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
    </AdminLayout>
  )
}
