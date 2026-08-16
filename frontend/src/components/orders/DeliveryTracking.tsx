import React from 'react'
import { Truck, MapPin, Phone, User, Copy, Check, Navigation, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SafeDeliveryOrder } from '../../types/order'

interface DeliveryTrackingProps {
  delivery: SafeDeliveryOrder
  isSeller: boolean
  isAdmin: boolean
  onUpdateStatus?: (newStatus: string) => void
  isUpdating?: boolean
}

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  delivery,
  isSeller,
  isAdmin,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [copied, setCopied] = React.useState(false)

  const copyTracking = () => {
    if (delivery.trackingReference) {
      navigator.clipboard.writeText(delivery.trackingReference)
      setCopied(true)
      toast.success('Tracking reference copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">Delivery Tracking</h3>
            <p className="text-xs text-stone-500">
              Direct dispatch & neighborhood delivery
            </p>
          </div>
        </div>

        {delivery.trackingReference && (
          <button
            type="button"
            onClick={copyTracking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold transition-colors"
          >
            <span>{delivery.trackingReference}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
          </button>
        )}
      </div>

      {/* Recipient & Location Details Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Recipient Details
          </p>
          <div className="space-y-1 text-stone-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>{delivery.recipientName}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>{delivery.recipientPhone}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Dropoff Destination
          </p>
          <div className="space-y-1 text-stone-800">
            <div className="flex items-center gap-2 font-bold">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {delivery.city}, {delivery.subCity}
                {delivery.neighborhood ? ` (${delivery.neighborhood})` : ''}
              </span>
            </div>
            <div className="flex items-start gap-2 text-stone-600">
              <Navigation className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{delivery.deliveryLocation}</span>
            </div>
          </div>
        </div>
      </div>

      {delivery.deliveryNotes && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
          <span className="font-bold">Delivery Instructions:</span> {delivery.deliveryNotes}
        </div>
      )}

      {/* Seller / Admin Status Action Triggers */}
      {(isSeller || isAdmin) && onUpdateStatus && (
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <p className="text-xs font-bold text-stone-700">Dispatch Controls:</p>
          <div className="flex flex-wrap gap-2">
            {delivery.status === 'REQUESTED' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onUpdateStatus('ACCEPTED')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
              >
                Accept Delivery Request
              </button>
            )}

            {['REQUESTED', 'ACCEPTED'].includes(delivery.status) && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onUpdateStatus('READY_FOR_PICKUP')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
              >
                Mark Ready for Courier
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus('IN_TRANSIT')}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-all"
                >
                  Simulate In Transit
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus('DELIVERED')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  Mark Delivered
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>Deliveries are covered by Bonda delivery protection insurance.</span>
      </div>
    </div>
  )
}
