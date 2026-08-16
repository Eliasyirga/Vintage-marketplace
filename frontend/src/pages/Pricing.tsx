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
      toast('Please log in to upgrade your seller account.', { icon: '🔒' })
      navigate('/login?redirect=/pricing')
      return
    }
    setSelectedPlan(plan)
    setIsCheckoutOpen(true)
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Scale Your Sales on <span className="text-amber-500">Vintage Marketplace</span>
          </h1>
          <p className="text-stone-400 text-base sm:text-lg">
            Choose the plan that fits your business. Start free, boost on-demand, or upgrade to
            unlock deep analytics, business badges, and advertising tools.
          </p>
        </div>

        {/* Free vs Paid Tier Grid */}
        <div className="mt-16">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Free Tier */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-stone-800 bg-stone-900/40">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Individual / Free</h3>
                    <span className="text-xs text-stone-400 bg-stone-800 px-2.5 py-1 rounded-full">
                      Free Forever
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">0</span>
                    <span className="text-stone-400 text-sm font-medium">ETB</span>
                  </div>

                  <p className="text-xs text-stone-400 mt-2">Essential tools for occasional sellers.</p>

                  <div className="mt-6 pt-6 border-t border-stone-800 space-y-3">
                    <div className="flex items-start gap-2.5 text-sm text-stone-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Post up to 10 active listings</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-stone-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Direct in-app buyer messaging</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-stone-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Basic seller profile</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-stone-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Standard search placement</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800">
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-stone-800 text-stone-400 font-semibold rounded-xl text-sm cursor-default"
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
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    Fast-Track Verified Seller Badge
                  </h3>
                  <span className="text-xs bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                    {verificationPlan.price} ETB
                  </span>
                </div>
                <p className="text-sm text-stone-400 max-w-xl">
                  Build immediate trust with buyers. Pay the one-time verification fee for priority
                  document & ID review. Verified sellers convert 3x higher.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan(verificationPlan)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-sm rounded-xl transition shrink-0 shadow-lg shadow-amber-500/20"
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
