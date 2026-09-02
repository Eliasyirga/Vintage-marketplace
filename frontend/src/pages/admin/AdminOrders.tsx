import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { AdminOrderItem } from '../../types/admin'
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Truck,
  Users,
  X,
} from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const loadOrders = (page = 1) => {
    setIsLoading(true)
    adminService
      .getAdminOrders({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      })
      .then((data) => {
        setOrders(data.orders || [])
        setPagination(data.pagination || null)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadOrders(1)
  }, [statusFilter, paymentFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadOrders(1)
  }

  const handleOpenDetail = async (orderId: string) => {
    try {
      const { order } = await adminService.getAdminOrderById(orderId)
      setSelectedOrder(order)
    } catch (err) {
      console.error(err)
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Confirmed
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Cancelled
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Paid
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Pending
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="Order Management"
      subtitle="Oversight on buyer checkout purchases, meeting orders, and verified settlements"
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
                placeholder="Search order number or ID..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Order Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
              >
                <option value="">All Payment Statuses</option>
                <option value="PAID">Paid / Success</option>
                <option value="PENDING">Pending Payment</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                Loading Orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShoppingCart className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No orders found</p>
              <p className="text-xs text-stone-500">
                No orders match your search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Listing / Product</th>
                    <th className="py-3 px-4">Buyer & Seller</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Fulfillment</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {order.order_number || (order.id ? order.id.slice(0, 8) : 'Order')}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-bold text-stone-900 truncate block">
                          {order.listing?.title || 'Marketplace Item'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="block text-stone-900 font-bold truncate max-w-[120px]">
                            B: {order.buyer?.full_name || 'Buyer'}
                          </span>
                          <span className="block text-stone-500 text-[11px] truncate max-w-[120px]">
                            S: {order.seller?.full_name || 'Seller'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        ETB {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                          {order.fulfillment_method === 'DELIVERY' ? (
                            <>
                              <Truck className="w-3 h-3 text-stone-500" /> Delivery
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3 text-stone-500" /> Meeting
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getPaymentStatusBadge(order.payment_status)}</td>
                      <td className="py-3.5 px-4">{getOrderStatusBadge(order.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order.id)}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="View Order Details"
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

          {/* Pagination Footer */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => loadOrders(pagination.currentPage - 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 font-bold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => loadOrders(pagination.currentPage + 1)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  Order Details
                </span>
                <h3 className="text-lg font-black text-stone-900">
                  Order #{selectedOrder.order_number || (selectedOrder.id ? selectedOrder.id.slice(0, 8) : '')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400">Buyer</span>
                <p className="font-bold text-stone-900 text-sm">{selectedOrder.buyer?.full_name}</p>
                <p className="text-xs text-stone-500 font-mono">{selectedOrder.buyer?.email || selectedOrder.buyer?.phone}</p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400">Seller</span>
                <p className="font-bold text-stone-900 text-sm">{selectedOrder.seller?.full_name}</p>
                <p className="text-xs text-stone-500 font-mono">{selectedOrder.seller?.email || selectedOrder.seller?.phone}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400">Financial Breakdown</span>
              <div className="flex justify-between text-xs">
                <span className="text-stone-600">Item Price</span>
                <span className="font-bold text-stone-900">ETB {Number(selectedOrder.item_price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-600">Platform Fee</span>
                <span className="font-bold text-stone-900">ETB {Number(selectedOrder.platform_fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-stone-200 font-black">
                <span className="text-stone-900">Total Charged</span>
                <span className="text-amber-600 text-sm">ETB {Number(selectedOrder.total_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline Events */}
            {selectedOrder.events && selectedOrder.events.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 block">Lifecycle Timeline</span>
                <div className="space-y-2">
                  {selectedOrder.events.map((evt: any) => (
                    <div key={evt.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 text-xs">
                      <span className="font-bold text-stone-800">{evt.event_type}</span>
                      <span className="text-stone-400 text-[11px] font-mono">
                        {new Date(evt.created_at).toLocaleString()}
                      </span>
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
