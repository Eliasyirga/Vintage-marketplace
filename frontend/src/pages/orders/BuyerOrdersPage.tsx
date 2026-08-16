import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Loader2, PackageOpen, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { OrderCard } from '../../components/orders/OrderCard'
import * as orderService from '../../services/order.service'
import type { SafeOrder } from '../../types/order'

export default function BuyerOrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<SafeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    async function loadOrders() {
      try {
        setLoading(true)
        const filter = activeTab === 'all' ? undefined : activeTab
        const data = await orderService.getBuyerOrders(filter)
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
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-amber-600" />
              <span>My Orders</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
              Track your deliveries, in-person meetings, and purchase history.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => {
            const isCurrent = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-200/60 border border-stone-200/80'
                }`}
              >
                {tab === 'all' ? 'All Orders' : `${tab} Orders`}
              </button>
            )
          })}
        </div>

        {/* Order List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-xs font-bold text-stone-500">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No Orders Found</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-medium">
              You haven't placed any orders in this category yet. Explore authentic Ethiopian vintage items on the marketplace!
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <OrderCard key={ord.id} order={ord} viewType="buyer" />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
