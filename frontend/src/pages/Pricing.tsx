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

  const premiumPlan = plans.find((p) => p.type === 'PREMIUM' && p.isActive !== false)
  const businessPlan = plans.find((p) => p.type === 'BUSINESS' && p.isActive !== false)
  const subscriptionPlans = [premiumPlan, businessPlan].filter(Boolean) as Plan[]
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
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-200/30 via-stone-100/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 py-1 px-4 rounded-full text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
            Transparent Seller Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            Scale Your Sales on <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">Vintage Marketplace</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Choose the membership tier built for your growth. Start free with essential seller tools, or upgrade to unlock verified store badges, priority search ranking, and direct phone leads.
          </p>
        </div>

        {/* 3-Tier Grid */}
        <div className="mt-12 sm:mt-16">
          {loading ? (
            <div className="py-24 flex flex-col justify-center items-center gap-3">
              <Loader2 className="w-9 h-9 animate-spin text-amber-600" />
              <span className="text-xs font-bold text-stone-500">Loading verified seller tiers...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {/* Free Tier */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-stone-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                        🌱
                      </div>
                      <h3 className="text-xl font-black text-stone-900">Individual / Free</h3>
                    </div>
                    <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                      Free Forever
                    </span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">0</span>
                    <span className="text-sm font-extrabold text-stone-500">ETB</span>
                    <span className="text-xs font-semibold text-stone-400 ml-1">/ month</span>
                  </div>

                  <p className="text-xs text-stone-500 font-medium mt-2">
                    Essential tools for occasional sellers and personal collectors.
                  </p>

                  <div className="mt-6 pt-6 border-t border-stone-100 space-y-3.5">
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Post up to 10 active listings</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Direct in-app buyer messaging</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Basic seller public profile</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>Standard marketplace search ranking</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100">
                  <button
                    disabled
                    className="w-full py-3.5 px-4 bg-stone-100 text-stone-500 font-bold rounded-2xl text-xs sm:text-sm cursor-default border border-stone-200"
                  >
                    Included by Default
                  </button>
                </div>
              </div>

              {/* Dynamic Subscription Plans (Premium & Business) */}
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
          <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Fast-Track Verified Seller Badge
                  </h3>
                  <span className="text-xs bg-amber-400 text-stone-950 font-black px-3 py-0.5 rounded-full shadow-xs">
                    {verificationPlan.price} ETB
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed font-medium">
                  Build immediate buyer trust with official National ID (Fayda) / document verification. Verified sellers receive preferential ranking and convert 3x higher.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan(verificationPlan)}
              className="relative z-10 flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-2xl transition-all shrink-0 shadow-lg shadow-amber-500/20"
            >
              <span>Get Verified Now</span>
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
