import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { AdminUserItem, UserDetailsDossier } from '../../types/admin'
import {
  Search,
  UserX,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [selectedUser, setSelectedUser] = useState<UserDetailsDossier | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getAdminUsers({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        verification: verificationFilter || undefined,
        page,
        limit: 15,
      })
      setUsers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.totalItems || 0)
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [statusFilter, roleFilter, verificationFilter, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleInspect = async (userId: string) => {
    try {
      const dossier = await adminService.getUserDetails(userId)
      setSelectedUser(dossier)
    } catch (err) {
      toast.error('Failed to load user dossier.')
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    const reason = window.prompt(`Please enter the moderation reason to ${newStatus.toLowerCase()} this user:`)
    if (reason === null) return

    try {
      await adminService.updateUserStatus(userId, newStatus, reason.trim() || undefined)
      toast.success(`User has been ${newStatus.toLowerCase()}.`)
      loadUsers()
      if (selectedUser && selectedUser.user.id === userId) {
        setSelectedUser({
          ...selectedUser,
          user: { ...selectedUser.user, status: newStatus },
        })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update user status.`)
    }
  }

  return (
    <AdminLayout
      title="User Management"
      subtitle="Complete account directory, identity badges, and seller dossier inspections"
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone number..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Account Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="USER">User / Seller</option>
                <option value="ADMIN">Administrator</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value)
                  setPage(1)
                }}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Verifications</option>
                <option value="VERIFIED">Fayda / ID Verified</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading User Directory...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400 font-medium">
              No users matched your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Tier & Quota</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Verifications</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold text-xs shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              u.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-stone-900 block truncate max-w-[150px]">
                              {u.fullName}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400 block truncate max-w-[150px]">
                              {u.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block text-stone-900 font-bold truncate max-w-[140px]">
                          {u.email || 'No email'}
                        </span>
                        <span className="block text-stone-400 text-[11px] font-mono truncate max-w-[140px]">
                          {u.phone || 'No phone'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              u.tier === 'BUSINESS'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {u.tier}
                          </span>
                          <span className="text-[11px] text-stone-500 block">
                            {u.listingsCount} {u.tier === 'BUSINESS' ? '/ 50' : '/ 10'} listings
                          </span>
                        </div>
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
                          {u.isFaydaVerified ? (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Fayda
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-semibold">Unverified</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInspect(u.id)}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Inspect User Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {u.role !== 'ADMIN' && (
                            u.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                                title="Suspend Account"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                title="Activate Account"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )
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
                Page {page} of {totalPages} ({totalItems} total users)
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

      {/* User Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 font-black text-base flex items-center justify-center shadow-md shadow-amber-500/20">
                  {selectedUser.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">{selectedUser.user.fullName}</h3>
                  <p className="text-xs text-stone-500 font-mono">
                    {selectedUser.user.email || selectedUser.user.phone} &bull; ID: {selectedUser.user.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">Total Listings</span>
                <p className="text-xl font-black text-stone-900 mt-0.5">{selectedUser.stats.totalListings}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">Sales Orders</span>
                <p className="text-xl font-black text-emerald-600 mt-0.5">{selectedUser.stats.totalSales}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">Purchases</span>
                <p className="text-xl font-black text-blue-600 mt-0.5">{selectedUser.stats.totalPurchases}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">Chapa Paid</span>
                <p className="text-xl font-black text-purple-600 mt-0.5">ETB {selectedUser.stats.totalPaidETB}</p>
              </div>
            </div>

            {/* Recent Listings */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-900 block">Recent Listings</span>
              {selectedUser.listings.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No listings created yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedUser.listings.map((l) => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900 truncate max-w-[160px]">{l.title}</span>
                      <span className="font-bold text-amber-700">ETB {l.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety Reports Against User */}
            {selectedUser.reportsAgainst.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-red-600 block">Dispute & Safety Reports</span>
                <div className="space-y-1.5">
                  {selectedUser.reportsAgainst.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs flex justify-between items-center">
                      <span className="font-bold text-red-900">{r.reason}</span>
                      <span className="text-red-700 font-mono text-[11px]">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
