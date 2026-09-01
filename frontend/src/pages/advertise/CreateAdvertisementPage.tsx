import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Flame,
  Lock,
  Upload,
  Image as ImageIcon,
  X,
  Sidebar,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import type { Plan, AdPlacement } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'
import * as paymentService from '../../services/payment.service'
import { toast } from 'react-hot-toast'

const PLACEMENT_OPTIONS: {
  id: AdPlacement
  title: string
  desc: string
  ratio: string
  icon: typeof Flame
}[] = [
  {
    id: 'MARKETPLACE_BANNER',
    title: 'Top Banner',
    desc: 'High-impact full-width banner at the top of Home and Marketplace.',
    ratio: '16:7',
    icon: Flame,
  },
  {
    id: 'MARKETPLACE_FEATURED',
    title: 'In-Feed Feature',
    desc: 'Native card embedded directly between browse listings.',
    ratio: '16:9',
    icon: Layers,
  },
  {
    id: 'MARKETPLACE_SIDEBAR',
    title: 'Desktop Sidebar',
    desc: 'Persistent desktop visibility beside search filters.',
    ratio: '1:1',
    icon: Sidebar,
  },
]

export default function CreateAdvertisementPage() {
  const [searchParams] = useSearchParams()

  const initialPlacement =
    (searchParams.get('placement') as AdPlacement) || 'MARKETPLACE_BANNER'
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adService
      .getAdPlans()
      .then((data) => {
        setPlans(data)
        if (!selectedPlanId && data.length > 0) {
          const match =
            data.find((p) => p.features?.includes(placement)) || data[0]
          setSelectedPlanId(match.id)
        }
      })
      .catch(() => {
        toast.error('Failed to load advertisement plans')
      })
      .finally(() => setIsLoadingPlans(false))
  }, [placement])

  // Filter plans available for current placement
  const placementPlans = plans.filter(
    (p) =>
      p.features?.includes(placement) ||
      !p.features?.length ||
      p.type === 'ADVERTISEMENT',
  )
  const selectedPlan =
    plans.find((p) => p.id === selectedPlanId) || placementPlans[0]

  // Validate URL on client side
  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim())
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  }

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPEG, PNG, and WEBP image files are allowed.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be 5MB or smaller.')
        return
      }
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
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
    if (!imageFile) {
      toast.error('Please upload a creative banner image.')
      return
    }
    setStep(3)
  }

  const handleCreateAndPay = async () => {
    if (!selectedPlan || !imageFile) return

    setIsSubmitting(true)
    try {
      // 1. Create Advertisement in PENDING_PAYMENT (uploads creative directly to Cloudinary)
      const ad = await adService.createAdvertisement({
        planId: selectedPlan.id,
        title: title.trim(),
        description: description.trim() || undefined,
        imageFile,
        targetUrl: targetUrl.trim(),
        placement,
      })

      // 2. Initialize Payment via centralized payment service with Chapa
      const paymentRes = await paymentService.initializePayment({
        purpose: 'ADVERTISEMENT',
        planId: selectedPlan.id,
        advertisementId: ad.id,
        provider: 'CHAPA',
        returnUrl: `${window.location.origin}/payment/processing`,
      })

      const pendingRef = paymentRes.payment?.reference || paymentRes.providerReference
      if (pendingRef) {
        try {
          sessionStorage.setItem('pending_payment_ref', pendingRef)
          localStorage.setItem('pending_payment_ref', pendingRef)
        } catch (_) {}
      }

      toast.success('Advertisement creative saved! Redirecting to Chapa payment...')

      if (paymentRes.checkoutUrl) {
        window.location.href = paymentRes.checkoutUrl
      } else {
        throw new Error('Payment gateway did not return a checkout URL.')
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to create advertisement.',
      )
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
                  {PLACEMENT_OPTIONS.map((p) => {
                    const isSelected = placement === p.id
                    const Icon = p.icon
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPlacement(p.id)
                          const nextPlan = plans.find((item) =>
                            item.features?.includes(p.id),
                          )
                          if (nextPlan) setSelectedPlanId(nextPlan.id)
                        }}
                        className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs ring-2 ring-amber-500/20'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected ? 'text-amber-600' : 'text-stone-400'
                            }`}
                          />
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-stone-900">
                            {p.title}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">{p.desc}</p>
                          <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md mt-2">
                            Aspect Ratio: {p.ratio}
                          </span>
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
                      const isCur =
                        (selectedPlan?.id || selectedPlanId) === plan.id
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
                    Advertisement Headline / Title <span className="text-red-500">*</span>
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
                  placeholder="e.g. Vintage Leather Jackets — 20% Off This Weekend"
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
                  placeholder="e.g. Discover authentic hand-stitched leather jackets crafted in Addis Ababa. Fast delivery across Ethiopia."
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
                    placeholder="https://yourbrand.com/promo or https://vintagemarketplace.com/sellers/xyz"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono text-stone-800"
                  />
                  <ExternalLink className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Must start with <code className="font-bold text-stone-700">https://</code>. Users are securely redirected here when clicking your ad.
                </p>
              </div>

              {/* Creative Upload */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Creative Image Upload (Cloudinary Powered) <span className="text-red-500">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                {!imagePreviewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer bg-stone-50/60 hover:bg-amber-50/30 transition-all flex flex-col items-center gap-2"
                  >
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        Click to upload creative banner
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Supports JPG, PNG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-stone-800 truncate max-w-xs">
                          {imageFile?.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreviewUrl('')
                        }}
                        className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="w-full aspect-[16/8] rounded-xl overflow-hidden bg-stone-900 relative">
                      <img
                        src={imagePreviewUrl}
                        alt="Creative preview"
                        className="w-full h-full object-cover"
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
                  <span>Review & Checkout</span>
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
                    Campaign Summary
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    {placement}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider block">
                      Plan
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
                      Placement
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {placement}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider block">
                      Amount
                    </span>
                    <span className="font-black text-amber-600 text-base">
                      {Number(selectedPlan?.price).toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                {/* Creative preview snapshot */}
                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Creative Preview:
                  </span>
                  <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
                    {imagePreviewUrl && (
                      <img
                        src={imagePreviewUrl}
                        alt={title}
                        className="w-full sm:w-36 h-20 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-amber-300 truncate">
                        {title}
                      </h4>
                      {description && (
                        <p className="text-xs text-stone-300 line-clamp-2">
                          {description}
                        </p>
                      )}
                      <p className="text-[10px] text-stone-400 font-mono truncate">
                        {targetUrl}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method - Chapa Hosted */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-stone-500">
                  Payment Method
                </label>
                <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 border border-emerald-500 flex items-center justify-center font-black text-white text-xs tracking-wider shadow-sm">
                      CHAPA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">
                          Chapa Secure Checkout
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Official
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Instant payment via Telebirr, CBE Birr, Awash Bank, or Ethiopian Debit Cards.
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 ml-2" />
                </div>
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
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-sm transition-all shadow-md"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Processing Creative & Order...'
                      : `Pay ${Number(selectedPlan?.price).toLocaleString()} ETB & Submit`}
                  </span>
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
