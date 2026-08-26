import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { WorkspaceHeader } from '../../components/layout/WorkspaceHeader'
import { FulfillmentSelector } from '../../components/checkout/FulfillmentSelector'
import { DeliveryForm } from '../../components/checkout/DeliveryForm'
import { MeetingForm } from '../../components/checkout/MeetingForm'
import { PaymentSelector } from '../../components/checkout/PaymentSelector'
import { OrderSummary } from '../../components/checkout/OrderSummary'
import * as orderService from '../../services/order.service'
import * as deliveryService from '../../services/delivery.service'
import * as meetingService from '../../services/meeting.service'
import type {
  FulfillmentMethod,
  PaymentMethod,
  DeliveryInput,
  MeetingInput,
} from '../../types/order'

export default function CheckoutPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  // State
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [eligibilityData, setEligibilityData] = useState<orderService.BuyNowEligibilityResult | null>(null)
  const [suggestedLocations, setSuggestedLocations] = useState<string[]>([])

  // Form State
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('DELIVERY')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PLATFORM_PAYMENT')

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInput>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    city: 'Addis Ababa',
    subCity: 'Bole',
    neighborhood: '',
    deliveryLocation: '',
    deliveryNotes: '',
  })

  const [meetingInfo, setMeetingInfo] = useState<MeetingInput>({
    meetingLocation: '📍 Bole Medhanialem Mall / Edna Mall area',
    meetingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    meetingTime: '14:00',
    buyerNote: '',
  })

  const [deliveryFee, setDeliveryFee] = useState(100)
  const [platformFee, setPlatformFee] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load Listing & Verification
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      toast.error('Please sign in to complete your purchase.')
      navigate(`/login?redirect=/checkout/${listingId}`)
      return
    }

    async function loadData() {
      if (!listingId) return
      try {
        setLoading(true)
        const data = await orderService.checkBuyNowEligibility(listingId)
        setEligibilityData(data)

        // Calculate initial platform fee (5%)
        const pFee = Math.round(data.listing.price * 0.05 * 100) / 100
        setPlatformFee(pFee)

        // Fetch suggested locations
        const locations = await meetingService.getSuggestedLocations().catch(() => [])
        if (locations.length > 0) setSuggestedLocations(locations)
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Listing unavailable for purchase.')
        navigate(`/listings/${listingId}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [listingId, isAuthenticated, authLoading, navigate])

  // Recalculate dynamic delivery fee when sub-city changes
  useEffect(() => {
    if (fulfillmentMethod !== 'DELIVERY' || !eligibilityData) return

    async function updateDeliveryPricing() {
      try {
        const estimate = await deliveryService.estimateDelivery({
          sellerSubCity: eligibilityData?.listing.subCity,
          buyerSubCity: deliveryInfo.subCity,
          sellerCity: eligibilityData?.listing.city,
          buyerCity: deliveryInfo.city,
        })
        setDeliveryFee(estimate.deliveryFee)
      } catch {
        setDeliveryFee(100)
      }
    }

    updateDeliveryPricing()
  }, [deliveryInfo.subCity, deliveryInfo.city, fulfillmentMethod, eligibilityData])

  // Handle Form Change
  const handleDeliveryChange = (field: keyof DeliveryInput, value: string) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleMeetingChange = (field: keyof MeetingInput, value: string) => {
    setMeetingInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Validate fields before submission
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {}

    if (fulfillmentMethod === 'DELIVERY') {
      if (!deliveryInfo.fullName.trim()) errs.fullName = 'Full name is required.'
      if (!deliveryInfo.phone.trim()) errs.phone = 'Phone number is required.'
      if (!deliveryInfo.subCity.trim()) errs.subCity = 'Sub-city is required.'
      if (!deliveryInfo.deliveryLocation.trim())
        errs.deliveryLocation = 'Specific delivery location/address is required.'
    } else {
      if (!meetingInfo.meetingLocation.trim())
        errs.meetingLocation = 'Meeting location is required.'
      if (!meetingInfo.meetingDate.trim()) errs.meetingDate = 'Meeting date is required.'
      if (!meetingInfo.meetingTime.trim()) errs.meetingTime = 'Meeting time is required.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Submit Order
  const handleSubmitOrder = async () => {
    if (!validateForm() || !listingId || !eligibilityData) return

    try {
      setSubmitting(true)

      const result = await orderService.createOrder({
        listingId,
        fulfillmentMethod,
        paymentMethod,
        provider: 'CHAPA',
        deliveryInfo: fulfillmentMethod === 'DELIVERY' ? deliveryInfo : undefined,
        meetingInfo: fulfillmentMethod === 'MEET_IN_PERSON' ? meetingInfo : undefined,
      })

      toast.success('Order initialized! Redirecting to secure Chapa checkout...')

      // Redirect to Chapa hosted payment checkout
      if (
        paymentMethod === 'PLATFORM_PAYMENT' &&
        result.paymentInit?.checkoutUrl
      ) {
        window.location.href = result.paymentInit.checkoutUrl
      } else {
        navigate(`/orders/${result.order.id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <WorkspaceHeader
          title="Secure Checkout"
          backUrl={`/listings/${listingId || ''}`}
          backLabel="Product"
        />
        <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-sm font-bold text-stone-600">Preparing secure checkout...</p>
        </div>
      </div>
    )
  }

  if (!eligibilityData) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <WorkspaceHeader
          title="Secure Checkout"
          backUrl="/marketplace"
          backLabel="Marketplace"
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full my-10 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
            <h2 className="text-lg font-bold text-stone-900">Item Unavailable</h2>
            <p className="text-xs text-stone-500">
              This item cannot be purchased at this moment.
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const effectiveDeliveryFee = fulfillmentMethod === 'DELIVERY' ? deliveryFee : 0
  const totalAmount = eligibilityData.listing.price + effectiveDeliveryFee

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <WorkspaceHeader
        title="Secure Checkout"
        subtitle={eligibilityData.listing.title}
        backUrl={`/listings/${listingId}`}
        backLabel="Product"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/listings/${listingId}`)}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Product</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Review your order details and choose your fulfillment method.
          </p>
        </div>

        {/* Main Grid: Forms (7 Cols) + Summary (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Fulfillment & Options */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Choose Fulfillment */}
            <FulfillmentSelector
              selectedMethod={fulfillmentMethod}
              onSelect={(method) => {
                setFulfillmentMethod(method)
                if (method === 'DELIVERY') {
                  setPaymentMethod('PLATFORM_PAYMENT')
                }
              }}
            />

            {/* Step 2: Fulfillment Details Form */}
            {fulfillmentMethod === 'DELIVERY' ? (
              <DeliveryForm
                formData={deliveryInfo}
                onChange={handleDeliveryChange}
                errors={errors}
              />
            ) : (
              <MeetingForm
                formData={meetingInfo}
                onChange={handleMeetingChange}
                errors={errors}
                suggestedLocations={suggestedLocations}
              />
            )}

            {/* Step 3: Payment Method */}
            <PaymentSelector
              fulfillmentMethod={fulfillmentMethod}
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <OrderSummary
              listing={{
                id: eligibilityData.listing.id,
                title: eligibilityData.listing.title,
                price: eligibilityData.listing.price,
                condition: eligibilityData.listing.condition,
                city: eligibilityData.listing.city,
                seller: eligibilityData.seller,
              }}
              fulfillmentMethod={fulfillmentMethod}
              paymentMethod={paymentMethod}
              deliveryFee={effectiveDeliveryFee}
              platformFee={platformFee}
              totalAmount={totalAmount}
              onSubmit={handleSubmitOrder}
              isSubmitting={submitting}
              isValid={true}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
