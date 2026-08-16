import React from 'react'
import { Truck, Users, ShieldCheck, MapPin } from 'lucide-react'
import type { FulfillmentMethod } from '../../types/order'

interface FulfillmentSelectorProps {
  selectedMethod: FulfillmentMethod
  onSelect: (method: FulfillmentMethod) => void
}

export const FulfillmentSelector: React.FC<FulfillmentSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-extrabold text-stone-900">How would you like to receive it?</h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Select your preferred fulfillment method for this vintage item.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Delivery Option */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect('DELIVERY')}
          onKeyDown={(e) => e.key === 'Enter' && onSelect('DELIVERY')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative text-left ${
            selectedMethod === 'DELIVERY'
              ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
              : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            {selectedMethod === 'DELIVERY' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                Selected
              </span>
            )}
          </div>

          <div className="mt-4 space-y-1.5">
            <h4 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
              <span>🚚 Delivery</span>
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Have the product safely delivered to your doorstep or neighborhood in Addis Ababa & regional cities.
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fast zone dispatch & live tracking</span>
          </div>
        </div>

        {/* Meet in Person Option */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect('MEET_IN_PERSON')}
          onKeyDown={(e) => e.key === 'Enter' && onSelect('MEET_IN_PERSON')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative text-left ${
            selectedMethod === 'MEET_IN_PERSON'
              ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
              : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            {selectedMethod === 'MEET_IN_PERSON' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                Selected
              </span>
            )}
          </div>

          <div className="mt-4 space-y-1.5">
            <h4 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
              <span>🤝 Meet in Person</span>
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Meet the seller in a safe public spot, inspect the product in-person before confirming purchase.
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-200 flex items-center gap-1.5 text-[11px] text-stone-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Zero delivery fee & instant inspection</span>
          </div>
        </div>
      </div>
    </div>
  )
}
