import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Shield, Check, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { PlanCard } from '../components/monetization/PlanCard'
import { CheckoutModal } from '../components/payments/CheckoutModal'
import { useAuthContext } from '../context/AuthContext'
import type { Plan } from '../types/monetization'
import * as monetizationService from '../services/monetization.service'

export default function Pricing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthContext()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    monetizationService
      .getPublicPlans()
      .then((data) => setPlans(data))
      .catch(() => toast.error('Failed to load plans.'))
      .finally(() => setLoading(false))
  }, [])

  const subscriptionPlans = plans.filter(
    (p) => p.type === 'PREMIUM' || p.type === 'BUSINESS',
  )
  const verificationPlan = plans.find((p) => p.type === 'VERIFICATION')

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      toast('Please log in to upgrade your seller account.')
      navigate('/login?redirect=/pricing')
      return
    }
    setSelectedPlan(plan)
    setIsCheckoutOpen(true)
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            Scale Your Sales on <span className="text-amber-700">Vintage Marketplace</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Choose the plan that fits your business. Start free, boost on-demand, or upgrade to
            unlock deep analytics, business badges, and advertising tools.
          </p>
        </div>

        {/* Free vs Paid Tier Grid */}
        <div className="mt-12 sm:mt-16">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {/* Free Tier */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-stone-200 bg-white shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-stone-900">Individual / Free</h3>
                    <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                      Free Forever
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">0</span>
                    <span className="text-stone-500 text-sm font-bold">ETB</span>
                  </div>

                  <p className="text-xs text-stone-500 font-medium mt-2">Essential tools for occasional sellers.</p>

                  <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>Post up to 10 active listings</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>Direct in-app buyer messaging</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>Basic seller profile</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>Standard search placement</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100">
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-stone-100 text-stone-400 font-bold rounded-xl text-xs sm:text-sm cursor-default"
                  >
                    Included by Default
                  </button>
                </div>
              </div>

              {/* Dynamic Subscription Plans */}
              {subscriptionPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isPopular={plan.type === 'PREMIUM'}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
          )}
        </div>

        {/* Verification Card Banner */}
        {verificationPlan && (
          <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Fast-Track Verified Seller Badge
                  </h3>
                  <span className="text-xs bg-amber-500 text-stone-950 font-bold px-2.5 py-0.5 rounded-full">
                    {verificationPlan.price} ETB
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                  Build immediate trust with buyers. Pay the one-time verification fee for priority
                  document & ID review. Verified sellers convert 3x higher.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan(verificationPlan)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shrink-0 shadow-md shadow-amber-500/20"
            >
              <span>Get Verified</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Embedded Checkout */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title={`Upgrade to ${selectedPlan.name}`}
          subtitle={`${selectedPlan.price.toLocaleString()} ETB / ${selectedPlan.durationDays} Days`}
          amount={selectedPlan.price}
          purpose={
            selectedPlan.type === 'BUSINESS'
              ? 'BUSINESS_SUBSCRIPTION'
              : selectedPlan.type === 'VERIFICATION'
              ? 'VERIFICATION'
              : 'PREMIUM_SUBSCRIPTION'
          }
          planId={selectedPlan.id}
          onSuccess={() => {
            setIsCheckoutOpen(false)
            navigate('/seller/monetization')
          }}
        />
      )}

      <Footer />
    </div>
  )
}
