import React from 'react'
import { ShieldCheck, Truck, Users, ArrowRight, Loader2, Lock } from 'lucide-react'
import type { FulfillmentMethod, PaymentMethod } from '../../types/order'

interface OrderSummaryProps {
  listing: {
    id: string
    title: string
    price: number
    condition: string
    city: string
    seller: {
      id: string
      fullName: string
      isVerified: boolean
      avatarUrl?: string | null
    }
    imageUrl?: string
  }
  fulfillmentMethod: FulfillmentMethod
  paymentMethod: PaymentMethod
  deliveryFee: number
  platformFee: number
  totalAmount: number
  onSubmit: () => void
  isSubmitting: boolean
  isValid: boolean
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  listing,
  fulfillmentMethod,
  paymentMethod,
  deliveryFee,
  platformFee,
  totalAmount,
  onSubmit,
  isSubmitting,
  isValid,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 sticky top-24">
      <h3 className="text-base font-extrabold text-stone-900 pb-3 border-b border-stone-100">
        Order Summary
      </h3>

      {/* Product Card */}
      <div className="flex gap-3.5 items-start">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-20 h-20 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-700 flex-shrink-0 text-sm">
            Vintage
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
            {listing.condition.replace(/_/g, ' ')}
          </span>
          <h4 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
            {listing.title}
          </h4>
          <p className="text-xs text-stone-500 font-medium truncate">
            Seller: <span className="text-stone-800 font-semibold">{listing.seller.fullName}</span>
          </p>
        </div>
      </div>

      {/* Fulfillment Status Pill */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
        <span className="text-stone-500 font-medium">Fulfillment:</span>
        <span className="font-bold text-stone-800 flex items-center gap-1.5">
          {fulfillmentMethod === 'DELIVERY' ? (
            <>
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Doorstep Delivery</span>
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Meet in Person</span>
            </>
          )}
        </span>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100 font-medium">
        <div className="flex items-center justify-between">
          <span>Item Price</span>
          <span className="font-bold text-stone-900">{listing.price.toLocaleString()} ETB</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Delivery Fee</span>
          <span className="font-bold text-stone-900">
            {fulfillmentMethod === 'DELIVERY'
              ? `${deliveryFee.toLocaleString()} ETB`
              : '0.00 ETB (In-Person)'}
          </span>
        </div>

        {platformFee > 0 && (
          <div className="flex items-center justify-between text-stone-500">
            <span>Marketplace Fee (5%)</span>
            <span>{platformFee.toLocaleString()} ETB</span>
          </div>
        )}

        <div className="h-px bg-stone-200 my-2" />

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-extrabold text-stone-900">Total</span>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600 tracking-tight">
              {totalAmount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-stone-500 ml-1">ETB</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={!isValid || isSubmitting}
        onClick={onSubmit}
        className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
          !isValid || isSubmitting
            ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Order...</span>
          </>
        ) : paymentMethod === 'PLATFORM_PAYMENT' ? (
          <>
            <Lock className="w-4 h-4" />
            <span>Continue to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Trust & Safety Footnote */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-semibold text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Bonda Secure Checkout • Buyer Protection Active</span>
      </div>
    </div>
  )
}
