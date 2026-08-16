import { useState, useEffect } from 'react'
import { X, Rocket, Sparkles, Check, Loader2 } from 'lucide-react'
import type { Listing } from '../../types/listing'
import type { Plan } from '../../types/monetization'
import * as monetizationService from '../../services/monetization.service'
import { CheckoutModal } from '../payments/CheckoutModal'

interface PromoteListingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: Listing | null
}

export function PromoteListingModal({ isOpen, onClose, listing }: PromoteListingModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [activeTab, setActiveTab] = useState<'BOOST' | 'FEATURED'>('BOOST')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      monetizationService
        .getPublicPlans()
        .then((allPlans) => {
          const promoPlans = allPlans.filter((p) => p.type === 'BOOST' || p.type === 'FEATURED')
          setPlans(promoPlans)
          const first = promoPlans.find((p) => p.type === activeTab) || promoPlans[0]
          setSelectedPlan(first || null)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isOpen, activeTab])

  if (!isOpen || !listing) return null

  const filteredPlans = plans.filter((p) => p.type === activeTab)

  const handleOpenCheckout = () => {
    if (!selectedPlan) return
    setIsCheckoutOpen(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-800 bg-stone-900/50">
            <div>
              <span className="text-xs font-semibold tracking-wider text-amber-500 uppercase">
                Promote Your Listing
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5 line-clamp-1">{listing.title}</h2>
              <p className="text-sm text-stone-400 mt-1">
                Listed at{' '}
                <span className="text-amber-400 font-semibold">{listing.price.toLocaleString()} ETB</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Promotion Type Tabs */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-950 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('BOOST')
                  const p = plans.find((x) => x.type === 'BOOST')
                  if (p) setSelectedPlan(p)
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition ${
                  activeTab === 'BOOST'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>🚀 Boost Listing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('FEATURED')
                  const p = plans.find((x) => x.type === 'FEATURED')
                  if (p) setSelectedPlan(p)
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition ${
                  activeTab === 'FEATURED'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>⭐ Featured Product</span>
              </button>
            </div>

            {/* Description of feature */}
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs text-stone-300 space-y-1">
              {activeTab === 'BOOST' ? (
                <>
                  <p className="font-semibold text-amber-400 text-sm">Boost Benefits:</p>
                  <p>• Multiplies ranking score across marketplace search and category feeds.</p>
                  <p>• Gradually decays over the chosen duration before returning to normal ranking.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-400 text-sm">Featured Benefits:</p>
                  <p>• Displays with an official golden Featured Badge.</p>
                  <p>• Appears in dedicated Featured Carousels and high-visibility sections.</p>
                </>
              )}
            </div>

            {/* Plans List */}
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Choose Duration & Plan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPlans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{plan.name}</span>
                            <span className="text-xs text-stone-400">
                              {plan.durationDays} Days
                            </span>
                          </div>
                          <p className="text-xl font-extrabold text-amber-500 mt-2">
                            {plan.price.toLocaleString()}{' '}
                            <span className="text-xs text-stone-400 font-normal">ETB</span>
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-stone-800/80 space-y-1.5">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-300">
                              <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="line-clamp-1">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-stone-800 bg-stone-900/50">
            <div>
              <p className="text-xs text-stone-400">Total Price</p>
              <p className="text-lg font-bold text-white">
                {selectedPlan ? `${selectedPlan.price.toLocaleString()} ETB` : 'Select a plan'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOpenCheckout}
                disabled={!selectedPlan}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Checkout */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title={`Promote: ${selectedPlan.name}`}
          subtitle={listing.title}
          amount={selectedPlan.price}
          purpose={selectedPlan.type === 'BOOST' ? 'LISTING_BOOST' : 'FEATURED_LISTING'}
          planId={selectedPlan.id}
          listingId={listing.id}
          onSuccess={() => {
            setIsCheckoutOpen(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
