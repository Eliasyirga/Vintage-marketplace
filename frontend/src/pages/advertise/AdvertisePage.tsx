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
  Sidebar,
  Zap,
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
    icon: typeof Flame
    aspect: string
  }
> = {
  MARKETPLACE_BANNER: {
    title: 'Top Banner',
    tagline: 'Maximum Reach & Premium Billboard',
    description:
      'Premier full-width billboard placement directly at the top of the homepage and marketplace catalog. Seen by every visitor exploring vintage and used items.',
    dimensions: '1200 x 500 px (16:7)',
    badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
    icon: Flame,
    aspect: 'Aspect Ratio ~16:7',
  },
  MARKETPLACE_FEATURED: {
    title: 'In-Feed Feature',
    tagline: 'High-Intent In-Feed Engagement',
    description:
      'Seamlessly embedded inside product search and category grids right when users are actively comparing listings and making purchasing decisions.',
    dimensions: '800 x 450 px (16:9)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    icon: Layers,
    aspect: 'Aspect Ratio 16:9',
  },
  MARKETPLACE_SIDEBAR: {
    title: 'Desktop Sidebar',
    tagline: 'Persistent Desktop Filter Slot',
    description:
      'Fixed square promotional slot on desktop marketplace filter columns. Continuous visibility as buyers refine searches.',
    dimensions: '600 x 600 px (1:1)',
    badgeColor: 'bg-blue-100 text-blue-800 border border-blue-300',
    icon: Sidebar,
    aspect: 'Aspect Ratio 1:1',
  },
}

export default function AdvertisePage() {
  const { isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const [plans, setPlans] = useState<Plan[]>([])
  const [availability, setAvailability] = useState<Record<AdPlacement, boolean>>({
    MARKETPLACE_BANNER: true,
    MARKETPLACE_FEATURED: true,
    MARKETPLACE_SIDEBAR: true,
  })
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement>('MARKETPLACE_BANNER')
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
        {/* ── Hero Section (Bright & Airy) ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-stone-50 to-stone-50 py-16 sm:py-24 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Vintage Marketplace Advertising</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 max-w-3xl mx-auto leading-tight">
              Put Your Business in Front of{' '}
              <span className="text-amber-600">Ready Buyers</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Reach thousands of shoppers looking for electronics, vintage clothing, and lifestyle products across Ethiopia with high-visibility sponsored slots.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#placements"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm transition-all shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95"
              >
                <span>Explore Ad Placements</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {isAuthenticated && (
                <Link
                  to="/advertise/my-ads"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-sm border border-stone-300 shadow-2xs transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <span>My Campaign Analytics</span>
                </Link>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="pt-10 mt-6 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-amber-600">3 Slots</p>
                <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                  Guaranteed Exclusivity
                </p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-stone-900">100%</p>
                <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                  Real Buyer Traffic
                </p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-amber-600">Live</p>
                <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                  CTR & Click Metrics
                </p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-stone-900">Telebirr / Chapa</p>
                <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                  Instant Verification
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 Placements Interactive Selector ─────────────────────────── */}
        <section id="placements" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
              Interactive Placement Selector
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Select Your Sponsored Slot
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              Click a placement below to review specifications, visual layout, and pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {(['MARKETPLACE_BANNER', 'MARKETPLACE_FEATURED', 'MARKETPLACE_SIDEBAR'] as AdPlacement[]).map(
              (placementKey) => {
                const info = PLACEMENT_INFO[placementKey]
                const Icon = info.icon
                const isSelected = selectedPlacement === placementKey
                const isAvailable = availability[placementKey]

                return (
                  <button
                    key={placementKey}
                    type="button"
                    onClick={() => setSelectedPlacement(placementKey)}
                    className={`text-left rounded-3xl p-6 sm:p-7 border-2 transition-all duration-200 bg-white flex flex-col justify-between space-y-6 ${
                      isSelected
                        ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-4 ring-amber-500/10'
                        : 'border-stone-200 hover:border-stone-300 shadow-xs'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {isAvailable ? '● Available Now' : 'Occupied'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-stone-900">{info.title}</h3>
                        <p className="text-xs font-bold text-amber-700 mt-0.5">{info.tagline}</p>
                        <p className="text-xs text-stone-600 mt-2 leading-relaxed font-medium">
                          {info.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-500">
                      <span>{info.dimensions}</span>
                      <span className="text-amber-700 font-extrabold">
                        {isSelected ? 'Selected ✓' : 'Select →'}
                      </span>
                    </div>
                  </button>
                )
              },
            )}
          </div>

          {/* Pricing & Duration Configurator */}
          {placementPlans.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <h4 className="text-lg font-black text-stone-900">
                    Select Duration for {PLACEMENT_INFO[selectedPlacement].title}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    Pick your preferred campaign length. Prices are fetched live from database.
                  </p>
                </div>
                {activePlan && (
                  <div className="sm:text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600">
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
                          ? 'border-amber-500 bg-amber-50 text-stone-900 shadow-2xs font-bold'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium'
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
                <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Includes moderation review, HTTPS link validation & live CTR tracking</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChoosePlan(activePlan, selectedPlacement)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm transition-transform hover:scale-105 active:scale-95 shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
                  >
                    <span>Continue with {activePlan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Why Advertise on Vintage Marketplace? (Bright & Clean) ───────── */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Advertiser Benefits
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Engineered for Maximum Return
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                Target high-intent shoppers without getting lost in cluttered ad networks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-7 rounded-3xl bg-stone-50 border border-stone-200 space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shadow-2xs">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900">Uncluttered Visibility</h3>
                <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                  With a maximum of 3 advertisements across the entire marketplace, your brand will never compete against a wall of spam banners.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-stone-50 border border-stone-200 space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900">High-Intent Ethiopian Audience</h3>
                <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                  Every visitor is looking to buy, sell, or compare second-hand and vintage items — reaching consumers right when they have buying intent.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-stone-50 border border-stone-200 space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shadow-2xs">
                  <MousePointerClick className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900">Transparent Live Analytics</h3>
                <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                  Track actual viewport impressions, unique clicks, and CTR in your dedicated advertiser dashboard without third-party tracking delays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works Lifecycle ────────────────────────────────────── */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              How Advertising Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Slot & Duration',
                desc: 'Select from Top Banner, In-Feed Feature, or Desktop Sidebar for 3 to 14 days.',
              },
              {
                step: '02',
                title: 'Upload Creative',
                desc: 'Upload your banner artwork directly to Cloudinary and provide your landing URL.',
              },
              {
                step: '03',
                title: 'Instant Payment',
                desc: 'Pay securely using Telebirr, Chapa, or sandbox checkout.',
              },
              {
                step: '04',
                title: 'Review & Go Live',
                desc: 'Our moderation team approves your creative to ensure community standards, and it activates automatically.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3 relative overflow-hidden"
              >
                <span className="text-4xl font-black text-amber-500/15 absolute top-4 right-4">
                  {s.step}
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                  {s.step}
                </div>
                <h4 className="text-base font-black text-stone-900">{s.title}</h4>
                <p className="text-xs text-stone-600 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA Banner ─────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-500/20">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Zap className="w-3.5 h-3.5" />
                <span>Ready to Grow Your Business?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Launch your campaign in minutes
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed font-medium">
                Reserve your sponsored placement now to start capturing high-intent shoppers across Ethiopia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('placements')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
