import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Store, Loader2, PackageCheck, PlusCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { OrderCard } from '../../components/orders/OrderCard'
import * as orderService from '../../services/order.service'
import type { SafeOrder } from '../../types/order'

export default function SellerOrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<SafeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    async function loadOrders() {
      try {
        setLoading(true)
        const filter = activeTab === 'all' ? undefined : activeTab
        const data = await orderService.getSellerOrders(filter)
        setOrders(data)
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [activeTab, isAuthenticated, authLoading])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-amber-600" />
            <span>Seller Orders Dashboard</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage incoming purchase requests, dispatch courier deliveries, and coordinate meetings.
          </p>
        </div>

        <Link
          to="/sell"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all w-fit"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>List Another Item</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        {(['all', 'new', 'preparing', 'ready', 'completed', 'cancelled'] as const).map((tab) => {
          const isCurrent = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                isCurrent
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200/60 border border-stone-200/80'
              }`}
            >
              {tab === 'all'
                ? 'All Orders'
                : tab === 'new'
                ? 'New Orders'
                : tab === 'preparing'
                ? 'Preparing'
                : tab === 'ready'
                ? 'Ready for Dispatch'
                : `${tab} Orders`}
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-xs font-bold text-stone-500">Loading incoming orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No Orders in this Section</h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            You do not have any pending orders under this status.
          </p>
          <Link
            to="/seller/growth"
            className="inline-block px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all"
          >
            Promote Your Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <OrderCard key={ord.id} order={ord} viewType="seller" />
          ))}
        </div>
      )}
    </div>
  )
}
