import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  Flame,
  CreditCard,
  Lock,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import type { Plan, AdPlacement } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'
import * as paymentService from '../../services/payment.service'
import { toast } from 'react-hot-toast'

export default function CreateAdvertisementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialPlacement = (searchParams.get('placement') as AdPlacement) || 'HOME_TOP'
  const initialPlanId = searchParams.get('planId') || ''

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  // Form state
  const [placement, setPlacement] = useState<AdPlacement>(initialPlacement)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetUrl, setTargetUrl] = useState('https://')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<'MOCK' | 'CHAPA' | 'TELEBIRR'>('MOCK')

  useEffect(() => {
    adService
      .getAdPlans()
      .then((data) => {
        setPlans(data)
        if (!selectedPlanId && data.length > 0) {
          const match = data.find((p) => p.features?.includes(placement)) || data[0]
          setSelectedPlanId(match.id)
        }
      })
      .catch(() => {
        toast.error('Failed to load advertisement plans')
      })
      .finally(() => setIsLoadingPlans(false))
  }, [placement])

  // Filter plans available for current placement
  const placementPlans = plans.filter((p) => p.features?.includes(placement))
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || placementPlans[0]

  // Validate URL on client side
  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim())
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  }

  const handleNextFromStep1 = () => {
    if (!selectedPlan) {
      toast.error('Please select an advertising duration plan.')
      return
    }
    setStep(2)
  }

  const handleNextFromStep2 = () => {
    if (!title.trim()) {
      toast.error('Please enter an advertisement title.')
      return
    }
    if (!targetUrl.trim() || !validateUrl(targetUrl)) {
      toast.error('Please provide a valid web address starting with https:// or http://')
      return
    }
    if (!imageUrl.trim()) {
      toast.error('Please provide a banner creative image URL.')
      return
    }
    setStep(3)
  }

  const handleCreateAndPay = async () => {
    if (!selectedPlan) return

    setIsSubmitting(true)
    try {
      // 1. Create Advertisement in PENDING_PAYMENT
      const ad = await adService.createAdvertisement({
        planId: selectedPlan.id,
        title: title.trim(),
        description: description.trim() || undefined,
        image: imageUrl.trim(),
        targetUrl: targetUrl.trim(),
        placement,
      })

      // 2. Initialize Payment
      const paymentRes = await paymentService.initializePayment({
        purpose: 'ADVERTISEMENT',
        planId: selectedPlan.id,
        advertisementId: ad.id,
        provider: paymentProvider,
        returnUrl: `${window.location.origin}/advertise/my-ads?adCreated=true`,
      })

      toast.success('Advertisement registered! Redirecting to payment...')

      // If mock checkout provider:
      if (paymentProvider === 'MOCK') {
        navigate(`/checkout/mock?ref=${paymentRes.payment.reference}`)
      } else if (paymentRes.checkoutUrl) {
        window.location.href = paymentRes.checkoutUrl
      } else {
        navigate(`/checkout/mock?ref=${paymentRes.payment.reference}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create advertisement.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/advertise"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Advertisement Plans</span>
          </Link>
        </div>

        {/* Stepper Header */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                Create Campaign
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
                Book Your Sponsored Slot
              </h1>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: 'Slot & Plan' },
                { n: 2, label: 'Creative' },
                { n: 3, label: 'Review & Pay' },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                      step === s.n
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : step > s.n
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                  </div>
                  {s.n < 3 && <div className="w-4 h-0.5 bg-stone-200" />}
                </div>
              ))}
            </div>
          </div>

          {/* ── STEP 1: Placement & Plan Selection ────────────────────────── */}
          {step === 1 && (
            <div className="pt-6 space-y-8">
              {/* Placement Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-3">
                  1. Select Marketplace Placement Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'HOME_TOP' as AdPlacement,
                      title: 'HOME_TOP',
                      desc: 'Homepage Top Wide Banner',
                      icon: Flame,
                    },
                    {
                      id: 'MARKETPLACE_MIDDLE' as AdPlacement,
                      title: 'MARKETPLACE_MIDDLE',
                      desc: 'In-Feed Grid Native Banner',
                      icon: Layers,
                    },
                    {
                      id: 'MARKETPLACE_BOTTOM' as AdPlacement,
                      title: 'MARKETPLACE_BOTTOM',
                      desc: 'Catalog Bottom Spotlight',
                      icon: Sparkles,
                    },
                  ].map((p) => {
                    const isSelected = placement === p.id
                    const Icon = p.icon
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPlacement(p.id)
                          const nextPlan = plans.find((item) => item.features?.includes(p.id))
                          if (nextPlan) setSelectedPlanId(nextPlan.id)
                        }}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-2 ring-amber-500/20'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-stone-900">{p.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{p.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Duration Plan Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-500 mb-3">
                  2. Select Campaign Duration & Pricing
                </label>
                {isLoadingPlans ? (
                  <div className="p-8 text-center text-stone-400 text-xs animate-pulse">
                    Loading pricing plans from server...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {placementPlans.map((plan) => {
                      const isCur = (selectedPlan?.id || selectedPlanId) === plan.id
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-4 rounded-2xl text-center border-2 transition-all ${
                            isCur
                              ? 'border-amber-500 bg-amber-50/50 text-stone-900 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                          }`}
                        >
                          <p className="text-sm font-black">{plan.durationDays} Days</p>
                          <p className="text-sm font-extrabold text-amber-600 mt-1">
                            {Number(plan.price).toLocaleString()} ETB
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md"
                >
                  <span>Continue to Creative Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Creative & Content ────────────────────────────────── */}
          {step === 2 && (
            <div className="pt-6 space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">
                    Advertisement Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {title.length}/150
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vintage Leather Jackets - 20% Off This Weekend"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700">
                    Short Tagline / Description (Optional)
                  </label>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {description.length}/300
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Discover authentic hand-stitched leather jackets crafted in Addis Ababa. Free delivery on orders over 2,000 ETB."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium resize-none"
                />
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Target Landing Page URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://yourstore.com/promo or https://vintagethiopia.com/listings/xyz"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono text-stone-800"
                  />
                  <ExternalLink className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Must start with <code className="font-bold text-stone-700">https://</code>. Users will be securely directed here when clicking "Learn More".
                </p>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Banner Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Cloudinary image URL"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono text-stone-800"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Recommended ratio: 16:7 for Home Top, 16:9 for Marketplace In-Feed.
                </p>

                {imageUrl && (
                  <div className="mt-3 p-3 bg-stone-100 rounded-2xl border border-stone-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                      Image Preview
                    </p>
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-200 relative">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => toast.error('Failed to load image preview. Please check URL.')}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md"
                >
                  <span>Review Campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & Payment ──────────────────────────────────── */}
          {step === 3 && (
            <div className="pt-6 space-y-6">
              {/* Campaign summary card */}
              <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                    Selected Placement & Plan
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    {placement}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider block">
                      Plan Name
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {selectedPlan?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {selectedPlan?.durationDays} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider block">
                      Total Price
                    </span>
                    <span className="font-black text-amber-600 text-base">
                      {Number(selectedPlan?.price).toLocaleString()} ETB
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider block">
                      Moderation
                    </span>
                    <span className="font-extrabold text-emerald-700 text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Standard Review
                    </span>
                  </div>
                </div>

                {/* Creative Preview */}
                <div className="pt-4 border-t border-stone-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-2">
                    Creative Mock Preview
                  </span>
                  <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center gap-4">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Ad Thumbnail"
                        className="w-20 h-16 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                        Sponsored
                      </span>
                      <h4 className="font-extrabold text-sm truncate">{title}</h4>
                      {description && (
                        <p className="text-xs text-stone-400 truncate">{description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Provider Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'MOCK' as const,
                      name: 'Test / Mock Checkout',
                      desc: 'Instant 1-click test payment simulation',
                    },
                    {
                      id: 'CHAPA' as const,
                      name: 'Chapa Gateway',
                      desc: 'Telebirr, CBE Birr, Cards & Bank Transfer',
                    },
                    {
                      id: 'TELEBIRR' as const,
                      name: 'Telebirr Direct',
                      desc: 'Direct mobile wallet payment',
                    },
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setPaymentProvider(prov.id)}
                      className={`p-4 rounded-2xl text-left border-2 transition-all ${
                        paymentProvider === prov.id
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <CreditCard className="w-4 h-4 text-stone-600" />
                        {paymentProvider === prov.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <p className="font-extrabold text-sm text-stone-900">{prov.name}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{prov.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Quality Guarantee & Moderation Policy</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Upon verified payment, your advertisement is submitted to our community moderation team. Once approved, it activates automatically for your selected duration. If an ad does not meet guidelines, your payment is refunded.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateAndPay}
                  className="inline-flex items-center gap-2 px-9 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? (
                    <span>Processing Booking...</span>
                  ) : (
                    <>
                      <span>Pay {Number(selectedPlan?.price).toLocaleString()} ETB & Submit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
