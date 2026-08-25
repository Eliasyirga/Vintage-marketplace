import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Building,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { WorkspaceHeader } from '../../components/layout/WorkspaceHeader'
import { OrderTimeline } from '../../components/orders/OrderTimeline'
import { DeliveryTracking } from '../../components/orders/DeliveryTracking'
import { MeetingDetails } from '../../components/orders/MeetingDetails'
import { InspectionChecklist } from '../../components/orders/InspectionChecklist'
import * as orderService from '../../services/order.service'
import * as deliveryService from '../../services/delivery.service'
import type { SafeOrder } from '../../types/order'

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [order, setOrder] = useState<SafeOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    try {
      setLoading(true)
      const data = await orderService.getOrderById(orderId)
      setOrder(data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Unable to load order.')
      navigate('/account/orders')
    } finally {
      setLoading(false)
    }
  }, [orderId, navigate])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadOrder()
  }, [authLoading, isAuthenticated, loadOrder, navigate])

  const isBuyer = user?.id === order?.buyerId
  const isSeller = user?.id === order?.sellerId
  const isAdmin = user?.role === 'ADMIN'

  // Actions
  const handleSellerConfirm = async () => {
    if (!order) return
    try {
      setActionLoading(true)
      const updated = await orderService.confirmOrder(order.id)
      setOrder((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success('Order confirmed by seller!')
      loadOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Confirmation failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSellerMarkReady = async () => {
    if (!order) return
    try {
      setActionLoading(true)
      const updated = await orderService.markOrderReady(order.id)
      setOrder((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success('Order marked ready for delivery!')
      loadOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBuyerComplete = async () => {
    if (!order) return
    try {
      setActionLoading(true)
      const updated = await orderService.completeOrder(order.id)
      setOrder((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success('Order completed! Listing is marked as SOLD.')
      loadOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Completion failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeliveryStatusUpdate = async (newStatus: string) => {
    if (!order?.delivery) return
    try {
      setActionLoading(true)
      await deliveryService.updateDeliveryStatus(order.delivery.id, newStatus)
      toast.success(`Delivery status set to ${newStatus}`)
      loadOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update delivery status.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || !cancelReason.trim()) return

    try {
      setActionLoading(true)
      const updated = await orderService.cancelOrder(order.id, cancelReason)
      setOrder((prev) => (prev ? { ...prev, ...updated } : null))
      setIsCancelModalOpen(false)
      toast.success('Order cancelled.')
      loadOrder()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancellation failed.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
        <WorkspaceHeader
          title="Order Details"
          backUrl={isSeller ? '/seller/orders' : '/account/orders'}
          backLabel="Orders"
        />
        <div className="flex-1 flex flex-col items-center justify-center py-28 space-y-4">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
        <WorkspaceHeader
          title="Order Details"
          backUrl={isSeller ? '/seller/orders' : '/account/orders'}
          backLabel="Orders"
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full my-10 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
            <h2 className="text-lg font-bold text-stone-900">Order Not Found</h2>
            <Link
              to={isSeller ? '/seller/orders' : '/account/orders'}
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs"
            >
              Go to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isCompleted = order.status === 'COMPLETED'
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const firstImage = order.listing?.images?.[0]?.url

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <WorkspaceHeader
        title={`Order #${order.orderNumber || order.id.slice(0, 8).toUpperCase()}`}
        subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
        backUrl={isSeller ? '/seller/orders' : '/account/orders'}
        backLabel={isSeller ? 'Seller Orders' : 'My Orders'}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6 sm:space-y-8 flex-1">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => navigate(isSeller ? '/seller/orders' : '/account/orders')}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isSeller ? 'Back to Seller Dashboard' : 'Back to My Orders'}</span>
            </button>
            <div className="flex items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isCancelled
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Main Grid: Left Timeline & Details (7 cols) + Right Financials & Parties (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Timeline */}
            <OrderTimeline
              status={order.status}
              fulfillmentMethod={order.fulfillmentMethod}
              events={order.events}
            />

            {/* Fulfillment Sub-Component */}
            {order.fulfillmentMethod === 'DELIVERY' && order.delivery && (
              <DeliveryTracking
                delivery={order.delivery}
                isSeller={isSeller}
                isAdmin={isAdmin}
                onUpdateStatus={handleDeliveryStatusUpdate}
                isUpdating={actionLoading}
              />
            )}

            {order.fulfillmentMethod === 'MEET_IN_PERSON' && order.meeting && (
              <>
                <MeetingDetails
                  meeting={order.meeting}
                  isBuyer={isBuyer}
                  isSeller={isSeller}
                  listingId={order.listingId}
                  onMeetingUpdated={(up) => setOrder((prev) => (prev ? { ...prev, meeting: up } : null))}
                />

                {/* Inspection Checklist for Buyer */}
                {isBuyer && !isCompleted && !isCancelled && (
                  <InspectionChecklist
                    meetingId={order.meeting.id}
                    isCompleted={order.meeting.inspectionCompleted}
                    onInspectionVerified={loadOrder}
                    onReportIssue={() => setIsCancelModalOpen(true)}
                  />
                )}
              </>
            )}

            {/* Quick Action Center */}
            {!isCompleted && !isCancelled && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-stone-900">Next Actions</h3>

                <div className="flex flex-wrap gap-3">
                  {/* Seller Confirm Pending Order */}
                  {isSeller &&
                    ['PENDING_PAYMENT', 'SELLER_CONFIRMATION_REQUIRED', 'MEETING_REQUESTED'].includes(
                      order.status,
                    ) && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleSellerConfirm}
                        className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept & Confirm Order</span>
                      </button>
                    )}

                  {/* Seller Mark Ready */}
                  {isSeller &&
                    order.fulfillmentMethod === 'DELIVERY' &&
                    ['CONFIRMED', 'PREPARING'].includes(order.status) && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleSellerMarkReady}
                        className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Mark Packed & Ready for Pickup</span>
                      </button>
                    )}

                  {/* Buyer Final Confirmation */}
                  {isBuyer &&
                    ['DELIVERED', 'INSPECTION_PENDING', 'MEETING_CONFIRMED'].includes(order.status) && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleBuyerComplete}
                        className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Confirm Receipt & Complete Purchase</span>
                      </button>
                    )}

                  {/* Cancel Order Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors ml-auto"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Financial Breakdown, Product & User Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Snapshot Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Product Details
              </h3>

              <div className="flex items-start gap-4">
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={order.listing?.title}
                    className="w-20 h-20 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-700 flex-shrink-0 text-sm">
                    Vintage
                  </div>
                )}

                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                    {(order.listing?.condition || '').replace(/_/g, ' ') || 'Good'}
                  </span>
                  <h4 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                    {order.listing?.title}
                  </h4>
                  <Link
                    to={`/listings/${order.listingId}`}
                    className="text-xs font-bold text-amber-600 hover:underline inline-block pt-1"
                  >
                    View Original Listing →
                  </Link>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Financial Breakdown
              </h3>

              <div className="space-y-2.5 text-xs text-stone-600 font-medium">
                <div className="flex items-center justify-between">
                  <span>Item Price</span>
                  <span className="font-bold text-stone-900">
                    {Number(order.itemPrice ?? (order as any).item_price ?? 0).toLocaleString()} ETB
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-stone-900">
                    {Number(order.deliveryFee ?? (order as any).delivery_fee ?? 0).toLocaleString()} ETB
                  </span>
                </div>

                {Number(order.platformFee ?? (order as any).platform_fee ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-stone-500">
                    <span>Marketplace Platform Fee (5%)</span>
                    <span>{Number(order.platformFee ?? (order as any).platform_fee ?? 0).toLocaleString()} ETB</span>
                  </div>
                )}

                {isSeller && (
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-xl font-bold">
                    <span>Seller Payout Amount</span>
                    <span>{Number(order.sellerAmount ?? (order as any).seller_amount ?? 0).toLocaleString()} ETB</span>
                  </div>
                )}

                <div className="h-px bg-stone-200 my-2" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-extrabold text-stone-900">Total Paid</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-600">
                      {Number(order.totalAmount ?? (order as any).total_amount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-stone-500 ml-1">ETB</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Payment Method:</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                    {order.paymentMethod === 'PLATFORM_PAYMENT'
                      ? 'Protected Platform Payment'
                      : 'Direct to Seller'}
                  </span>
                </div>
              </div>
            </div>

            {/* Counterpart Contact Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs font-medium">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {isBuyer ? 'Seller Information' : 'Buyer Information'}
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-extrabold text-amber-800 text-sm">
                  {(isBuyer ? order.seller?.fullName : order.buyer?.fullName)?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {isBuyer ? order.seller?.fullName : order.buyer?.fullName}
                  </h4>
                  <p className="text-stone-500 text-[11px]">
                    {isBuyer ? order.seller?.phone || 'Verified Phone' : order.buyer?.phone || 'Buyer'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/messages"
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-stone-500" />
                  <span>Open Chat Conversation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-base">Cancel Order</h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelOrder} className="space-y-4 text-xs font-medium">
              <p className="text-stone-600">
                Are you sure you want to cancel order #{order.orderNumber}? If this order was paid, a refund workflow will be recorded.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed mind / Item condition problem / Unreachable..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !cancelReason.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
