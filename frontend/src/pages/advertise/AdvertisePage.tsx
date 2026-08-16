import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  TrendingUp,
  Eye,
  MousePointerClick,
  Sparkles,
  ArrowRight,
  Layers,
  BarChart3,
  Flame,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useAuthContext } from '../../context/AuthContext'
import type { Plan, AdPlacement } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'

const PLACEMENT_INFO: Record<
  AdPlacement,
  {
    title: string
    tagline: string
    description: string
    dimensions: string
    badgeColor: string
    icon: React.ElementType
    aspect: string
  }
> = {
  HOME_TOP: {
    title: 'Home Top Banner',
    tagline: 'Maximum Reach & Dominance',
    description: 'Premier billboard placement directly on Bonda’s homepage. Seen by every visitor exploring vintage and quality items.',
    dimensions: '1200 x 500 px (16:7)',
    badgeColor: 'bg-amber-500 text-stone-950',
    icon: Flame,
    aspect: 'Aspect Ratio ~16:7',
  },
  MARKETPLACE_MIDDLE: {
    title: 'Marketplace In-Feed',
    tagline: 'High-Intent Buyer Engagement',
    description: 'Seamlessly embedded inside product search and category grids right when users are actively comparing products.',
    dimensions: '800 x 450 px (16:9)',
    badgeColor: 'bg-emerald-500 text-stone-950',
    icon: Layers,
    aspect: 'Aspect Ratio 16:9',
  },
  MARKETPLACE_BOTTOM: {
    title: 'Marketplace Bottom Spotlight',
    tagline: 'Catalog Footer Highlight',
    description: 'Full-width spotlight placed directly below catalog results. High conversion for closing interested shoppers.',
    dimensions: '1200 x 400 px (16:5)',
    badgeColor: 'bg-indigo-500 text-white',
    icon: Sparkles,
    aspect: 'Aspect Ratio ~16:5',
  },
}

export default function AdvertisePage() {
  const { isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const [plans, setPlans] = useState<Plan[]>([])
  const [availability, setAvailability] = useState<Record<AdPlacement, boolean>>({
    HOME_TOP: true,
    MARKETPLACE_MIDDLE: true,
    MARKETPLACE_BOTTOM: true,
  })
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement>('HOME_TOP')
  const [selectedDuration, setSelectedDuration] = useState<number>(7)

  useEffect(() => {
    Promise.all([adService.getAdPlans(), adService.getAvailablePlacements()])
      .then(([fetchedPlans, avail]) => {
        setPlans(fetchedPlans)
        if (avail?.slots) {
          setAvailability(avail.slots)
        }
      })
      .catch((err) => {
        console.warn('Failed to load ad plans:', err)
      })
  }, [])

  // Filter plans by selected placement
  const placementPlans = plans.filter((p) =>
    p.features?.some((f) => f === selectedPlacement),
  )

  const activePlan =
    placementPlans.find((p) => p.durationDays === selectedDuration) ||
    placementPlans[0]

  const handleChoosePlan = (plan: Plan, placement: AdPlacement) => {
    navigate(`/advertise/create?placement=${placement}&planId=${plan.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-stone-950 text-white py-16 sm:py-24 border-b border-stone-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Bonda Marketplace Advertising</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-none">
              Put Your Business in Front of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                Ready Buyers
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Reach thousands of shoppers looking for electronics, vintage clothing, and lifestyle products across Ethiopia with high-visibility sponsored slots.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#placements"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <span>Explore Ad Placements</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {isAuthenticated && (
                <Link
                  to="/advertise/my-ads"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm border border-stone-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>My Campaign Analytics</span>
                </Link>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 pt-10 border-t border-stone-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-amber-400">3 Slots</p>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                  Guaranteed Exclusivity
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                  Real Buyer Traffic
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-amber-400">Live</p>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                  CTR & Click Metrics
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-white">Telebirr / Chapa</p>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                  Instant Verification
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 Placements Interactive Selector ─────────────────────────── */}
        <section id="placements" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Choose Your Advertisement Placement
            </h2>
            <p className="text-sm text-stone-600 font-medium">
              We offer exactly 3 high-impact marketplace placements to ensure your brand stands out without cluttering the buyer experience.
            </p>
          </div>

          {/* 3 Placement Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {(['HOME_TOP', 'MARKETPLACE_MIDDLE', 'MARKETPLACE_BOTTOM'] as AdPlacement[]).map((placement) => {
              const info = PLACEMENT_INFO[placement]
              const Icon = info.icon
              const isSelected = selectedPlacement === placement
              const isAvailable = availability[placement]

              // Get 7-day or lowest price for preview
              const relevantPlans = plans.filter((p) =>
                p.features?.some((f) => f === placement),
              )
              const lowestPrice = relevantPlans.length > 0
                ? Math.min(...relevantPlans.map((p) => p.price))
                : 200

              return (
                <div
                  key={placement}
                  onClick={() => setSelectedPlacement(placement)}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-amber-500 shadow-xl scale-[1.02] ring-4 ring-amber-500/10'
                      : 'bg-white border border-stone-200 hover:border-amber-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${info.badgeColor}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{info.title}</span>
                      </span>

                      {/* Status indicator */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isAvailable ? '🟢 Slot Available' : '🟡 Active (Reserve Next)'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-stone-900 tracking-tight">
                        {info.tagline}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                        {info.description}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-stone-500 font-semibold">
                        <span>Creative Size:</span>
                        <span className="font-bold text-stone-900">{info.dimensions}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-500 font-semibold">
                        <span>Max Active Ads:</span>
                        <span className="font-bold text-stone-900">1 (Exclusive)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing footer */}
                  <div className="pt-6 mt-6 border-t border-stone-100 space-y-4">
                    <div>
                      <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                        Starting From
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-amber-600">
                          {lowestPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-stone-500">ETB</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const targetPlan = relevantPlans[0]
                        if (targetPlan) {
                          handleChoosePlan(targetPlan, placement)
                        } else {
                          navigate(`/advertise/create?placement=${placement}`)
                        }
                      }}
                      className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-stone-900 hover:bg-amber-600 text-white shadow-md'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      <span>Choose Placement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Duration Selector for Active Placement */}
          {placementPlans.length > 0 && (
            <div className="mt-12 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-100">
                <div>
                  <h4 className="text-lg font-black text-stone-900">
                    Select Duration for {PLACEMENT_INFO[selectedPlacement].title}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium">
                    Pick your preferred campaign length. Prices are fetched live from database.
                  </p>
                </div>
                {activePlan && (
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-amber-600">
                      {Number(activePlan.price).toLocaleString()} ETB
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {placementPlans.map((plan) => {
                  const isCur = activePlan?.id === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(plan.durationDays)
                      }}
                      className={`p-4 rounded-2xl text-center border-2 transition-all ${
                        isCur
                          ? 'border-amber-500 bg-amber-50/40 text-stone-900 shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <p className="text-sm font-black">{plan.durationDays} Days</p>
                      <p className="text-xs font-bold text-amber-700 mt-1">
                        {Number(plan.price).toLocaleString()} ETB
                      </p>
                    </button>
                  )
                })}
              </div>

              {activePlan && (
                <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Includes moderation review, HTTPS validation & live CTR tracking</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChoosePlan(activePlan, selectedPlacement)}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Continue with {activePlan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Why Advertise on Bonda? ───────────────────────────────────── */}
        <section className="py-16 bg-stone-900 text-white border-y border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Advertiser Benefits
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                Engineered for Maximum Return
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-3xl bg-stone-800/80 border border-stone-700/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Uncluttered Visibility</h3>
                <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                  With a maximum of 3 advertisements across the entire marketplace, your brand will never compete against a wall of spam banners.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-stone-800/80 border border-stone-700/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">High-Intent Ethiopian Audience</h3>
                <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                  Every visitor on Bonda is looking to buy, sell, or compare second-hand and vintage items — reaching consumers right when they have buying intent.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-stone-800/80 border border-stone-700/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <MousePointerClick className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Transparent Live Analytics</h3>
                <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                  Track actual viewport impressions, unique clicks, and CTR in your dedicated advertiser dashboard without third-party tracking delays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works Lifecycle ────────────────────────────────────── */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1">
              How Advertising on Bonda Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Slot & Duration',
                desc: 'Select from HOME_TOP, MARKETPLACE_MIDDLE, or MARKETPLACE_BOTTOM and select 3 to 30 days.',
              },
              {
                step: '02',
                title: 'Upload Creative',
                desc: 'Enter your brand title, description, HTTPS landing page, and banner artwork.',
              },
              {
                step: '03',
                title: 'Instant Payment',
                desc: 'Pay securely using Telebirr, Chapa, or test checkout. Price is guaranteed from database.',
              },
              {
                step: '04',
                title: 'Review & Go Live',
                desc: 'Our moderation team approves your ad to ensure high community quality, and it automatically goes live.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xs space-y-3 relative overflow-hidden"
              >
                <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">
                  {s.step}
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">
                  {s.step}
                </div>
                <h4 className="text-base font-black text-stone-900">{s.title}</h4>
                <p className="text-xs text-stone-600 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
