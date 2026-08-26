import React from 'react'
import { ShieldCheck, CreditCard, Sparkles, CheckCircle2, Lock } from 'lucide-react'
import type { PaymentMethod, FulfillmentMethod } from '../../types/order'

interface PaymentSelectorProps {
  fulfillmentMethod: FulfillmentMethod
  selectedMethod: PaymentMethod
  onSelectMethod: (method: PaymentMethod) => void
  selectedProvider?: string
  onSelectProvider?: (provider: 'CHAPA') => void
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  fulfillmentMethod: _fulfillmentMethod,
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Payment Method</h3>
          <p className="text-xs text-stone-500">
            Secure checkout powered by Chapa Ethiopian Payment Gateway.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Protected Chapa Platform Payment */}
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white flex-shrink-0 font-black text-xs tracking-wider shadow-xs">
                CHAPA
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>Chapa Secure Checkout</span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" /> Official Gateway
                  </span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Cards, Telebirr, CBE Birr, Awash, and Ethiopian Mobile Banking via Hosted Checkout.
                </p>
              </div>
            </div>

            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          </div>

          <div className="mt-4 pt-3.5 border-t border-amber-200/60 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">256-Bit SSL Encrypted Transaction</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Chapa Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

