import React from 'react'
import { CheckCircle2, Clock, CircleDot, XCircle } from 'lucide-react'
import type { OrderStatus, FulfillmentMethod, SafeOrderEvent } from '../../types/order'

interface OrderTimelineProps {
  status: OrderStatus
  fulfillmentMethod: FulfillmentMethod
  events?: SafeOrderEvent[]
}

interface Step {
  id: string
  label: string
  description: string
  isCompleted: boolean
  isCurrent: boolean
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  fulfillmentMethod,
  events = [],
}) => {
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED'

  // Build sequential steps depending on fulfillment type
  const steps: Step[] =
    fulfillmentMethod === 'DELIVERY'
      ? [
          {
            id: 'created',
            label: 'Order Placed',
            description: 'Order created & payment initialized',
            isCompleted: status !== 'PENDING_PAYMENT',
            isCurrent: status === 'PENDING_PAYMENT',
          },
          {
            id: 'paid',
            label: 'Payment Confirmed',
            description: 'Payment verified on server',
            isCompleted: !['PENDING_PAYMENT'].includes(status),
            isCurrent: status === 'PAID',
          },
          {
            id: 'preparing',
            label: 'Preparing Package',
            description: 'Seller packing vintage item',
            isCompleted: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(
              status,
            ),
            isCurrent: status === 'PREPARING' || status === 'CONFIRMED',
          },
          {
            id: 'delivery',
            label: 'Out for Delivery',
            description: 'Dispatched to your neighborhood',
            isCompleted: ['DELIVERED', 'COMPLETED'].includes(status),
            isCurrent: status === 'READY_FOR_DELIVERY' || status === 'OUT_FOR_DELIVERY',
          },
          {
            id: 'delivered',
            label: 'Delivered & Complete',
            description: 'Package received by buyer',
            isCompleted: status === 'COMPLETED',
            isCurrent: status === 'DELIVERED',
          },
        ]
      : [
          {
            id: 'created',
            label: 'Meeting Requested',
            description: 'Order placed with meeting proposal',
            isCompleted: status !== 'PENDING_PAYMENT',
            isCurrent: status === 'PENDING_PAYMENT' || status === 'MEETING_REQUESTED',
          },
          {
            id: 'confirmed',
            label: 'Meeting Confirmed',
            description: 'Location & time accepted',
            isCompleted: ['MEETING_CONFIRMED', 'INSPECTION_PENDING', 'COMPLETED'].includes(status),
            isCurrent: status === 'MEETING_CONFIRMED',
          },
          {
            id: 'inspection',
            label: 'Item Inspection',
            description: 'In-person condition verification',
            isCompleted: status === 'COMPLETED',
            isCurrent: status === 'INSPECTION_PENDING',
          },
          {
            id: 'completed',
            label: 'Purchase Completed',
            description: 'Transaction finalized',
            isCompleted: status === 'COMPLETED',
            isCurrent: status === 'COMPLETED',
          },
        ]

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="text-base font-extrabold text-stone-900">Order Progress</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            isCancelled
              ? 'bg-red-50 text-red-700 border border-red-200'
              : status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {isCancelled ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800">
          <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <div className="text-xs">
            <p className="font-extrabold">Order Cancelled</p>
            <p className="text-red-600 mt-0.5">
              This transaction has been stopped and any reserved funds or items have been released.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
          {steps.map((step) => {
            return (
              <div key={step.id} className="relative flex items-start gap-4 text-left">
                {/* Milestone Node Icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : step.isCurrent
                      ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                      : 'bg-stone-100 border-stone-300 text-stone-400'
                  }`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : step.isCurrent ? (
                    <CircleDot className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                </div>

                {/* Milestone Details */}
                <div className="space-y-0.5">
                  <h4
                    className={`text-sm font-bold ${
                      step.isCompleted
                        ? 'text-stone-900'
                        : step.isCurrent
                        ? 'text-amber-700 font-extrabold'
                        : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Audit Event Feed */}
      {events.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Activity Log
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="text-[11px] text-stone-600 flex items-baseline justify-between gap-2 p-2 rounded-xl bg-stone-50"
              >
                <span className="font-medium">{ev.description}</span>
                <span className="text-[10px] text-stone-400 flex-shrink-0">
                  {new Date(ev.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
