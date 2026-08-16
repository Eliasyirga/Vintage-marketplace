import React from 'react'
import { ShieldCheck, CreditCard, HandCoins, AlertCircle, Sparkles } from 'lucide-react'
import type { PaymentMethod, FulfillmentMethod } from '../../types/order'

interface PaymentSelectorProps {
  fulfillmentMethod: FulfillmentMethod
  selectedMethod: PaymentMethod
  onSelectMethod: (method: PaymentMethod) => void
  selectedProvider: 'MOCK' | 'CHAPA' | 'TELEBIRR'
  onSelectProvider: (provider: 'MOCK' | 'CHAPA' | 'TELEBIRR') => void
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  fulfillmentMethod,
  selectedMethod,
  onSelectMethod,
  selectedProvider,
  onSelectProvider,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Payment Option</h3>
          <p className="text-xs text-stone-500">
            Choose how you would like to handle the transaction.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Protected Platform Payment */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectMethod('PLATFORM_PAYMENT')}
          onKeyDown={(e) => e.key === 'Enter' && onSelectMethod('PLATFORM_PAYMENT')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left relative ${
            selectedMethod === 'PLATFORM_PAYMENT'
              ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
              : 'border-stone-200 bg-stone-50 hover:bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>Protected Platform Payment</span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" /> Recommended
                  </span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Secure checkout via Chapa, Telebirr, or Sandbox Gateway.
                </p>
              </div>
            </div>

            <input
              type="radio"
              checked={selectedMethod === 'PLATFORM_PAYMENT'}
              onChange={() => onSelectMethod('PLATFORM_PAYMENT')}
              className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300"
            />
          </div>

          {selectedMethod === 'PLATFORM_PAYMENT' && (
            <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-3">
              <p className="text-xs font-bold text-stone-700">Select Gateway Provider:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Mock Sandbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectProvider('MOCK')
                  }}
                  className={`p-3 rounded-xl border text-center transition-all text-xs font-bold ${
                    selectedProvider === 'MOCK'
                      ? 'border-amber-600 bg-white text-amber-800 shadow-2xs'
                      : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                  }`}
                >
                  <span className="block text-amber-600 font-extrabold">Sandbox Mock</span>
                  <span className="text-[10px] font-normal text-stone-400">Test Simulator</span>
                </button>

                {/* Chapa */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectProvider('CHAPA')
                  }}
                  className={`p-3 rounded-xl border text-center transition-all text-xs font-bold ${
                    selectedProvider === 'CHAPA'
                      ? 'border-amber-600 bg-white text-amber-800 shadow-2xs'
                      : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                  }`}
                >
                  <span className="block text-emerald-600 font-extrabold">Chapa</span>
                  <span className="text-[10px] font-normal text-stone-400">Cards / Telebirr</span>
                </button>

                {/* Telebirr */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectProvider('TELEBIRR')
                  }}
                  className={`p-3 rounded-xl border text-center transition-all text-xs font-bold ${
                    selectedProvider === 'TELEBIRR'
                      ? 'border-amber-600 bg-white text-amber-800 shadow-2xs'
                      : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                  }`}
                >
                  <span className="block text-blue-600 font-extrabold">Telebirr</span>
                  <span className="text-[10px] font-normal text-stone-400">Ethio Telecom</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Payment to Seller (Only for Meet in Person) */}
        {fulfillmentMethod === 'MEET_IN_PERSON' && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSelectMethod('DIRECT_TO_SELLER')}
            onKeyDown={(e) => e.key === 'Enter' && onSelectMethod('DIRECT_TO_SELLER')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left relative ${
              selectedMethod === 'DIRECT_TO_SELLER'
                ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
                : 'border-stone-200 bg-stone-50 hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">Pay Seller Directly in Person</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pay the seller via cash or mobile transfer after physical item inspection.
                  </p>
                </div>
              </div>

              <input
                type="radio"
                checked={selectedMethod === 'DIRECT_TO_SELLER'}
                onChange={() => onSelectMethod('DIRECT_TO_SELLER')}
                className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500 border-stone-300"
              />
            </div>

            {selectedMethod === 'DIRECT_TO_SELLER' && (
              <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-start gap-2 text-xs text-stone-600">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-stone-600">
                  <span className="font-bold text-stone-800">Notice:</span> Payment is made directly between buyer and seller. Bonda does not hold or process this payment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
