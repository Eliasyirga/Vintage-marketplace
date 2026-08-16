import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { getAdminUsers, updateUserStatus } from '../../services/admin.service'
import { Search, UserX, UserCheck, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminUsers({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      })
      setUsers(data.users)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [statusFilter, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    const actionText = newStatus === 'SUSPENDED' ? 'suspend' : 'activate'
    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return

    try {
      await updateUserStatus(userId, newStatus, `Moderator action to ${actionText} user.`)
      toast.success(`User has been ${newStatus.toLowerCase()}.`)
      loadUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update user status.`)
    }
  }

  return (
    <AdminLayout title="User Management" subtitle="Manage accounts, roles, and verification status">
      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
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

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-xs text-stone-400 font-medium">
            No users matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/75 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verifications</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{u.full_name}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{u.email || u.phone}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-700 font-black'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.is_email_verified && (
                          <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                            Email
                          </span>
                        )}
                        {u.is_phone_verified && (
                          <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                            Phone
                          </span>
                        )}
                        {u.is_fayda_verified && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            Fayda
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        u.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                            className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors flex items-center gap-1 ml-auto"
                          >
                            <UserX className="w-3.5 h-3.5" /> Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors flex items-center gap-1 ml-auto"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </button>
                        )
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
              Page {page} of {totalPages} ({totalItems} total users)
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
