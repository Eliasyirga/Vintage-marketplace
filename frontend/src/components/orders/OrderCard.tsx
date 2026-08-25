import React from 'react'
import { Link } from 'react-router-dom'
import { Truck, Users, ArrowRight, Calendar } from 'lucide-react'
import type { SafeOrder } from '../../types/order'

interface OrderCardProps {
  order: SafeOrder
  viewType: 'buyer' | 'seller'
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, viewType }) => {
  const isCompleted = order.status === 'COMPLETED'
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'

  const otherPersonName =
    viewType === 'buyer' ? order.seller?.fullName || 'Seller' : order.buyer?.fullName || 'Buyer'

  const firstImage = order.listing?.images?.[0]?.url

  return (
    <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs hover:shadow-md transition-all space-y-3.5 sm:space-y-4">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 sm:pb-3 border-b border-stone-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-stone-900 bg-stone-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs">
            #{order.orderNumber}
          </span>
          <span className="text-stone-400 flex items-center gap-1 text-[11px] sm:text-xs">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
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

      {/* Main Content Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3">
          {firstImage ? (
            <img
              src={firstImage}
              alt={order.listing?.title || 'Vintage Item'}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-stone-200 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-700 flex-shrink-0 text-xs">
              Vintage
            </div>
          )}

          <div className="space-y-1">
            <h4 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-1">
              {order.listing?.title || 'Listing item'}
            </h4>
            <p className="text-xs text-stone-500 font-medium">
              {viewType === 'buyer' ? 'Seller' : 'Buyer'}:{' '}
              <span className="font-semibold text-stone-800">{otherPersonName}</span>
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1 font-semibold">
                {order.fulfillmentMethod === 'DELIVERY' ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Delivery</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>Meet in Person</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & View Action */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Amount</p>
            <p className="text-lg font-black text-amber-600">
              {Number(order.totalAmount ?? (order as any).total_amount ?? 0).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-stone-500">ETB</span>
            </p>
          </div>

          <Link
            to={`/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            <span>View Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
