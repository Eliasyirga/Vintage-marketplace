import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListingForm } from '../../components/listings/ListingForm'
import { ListingLimitBanner } from '../../components/listings/ListingLimitBanner'
import { createListing } from '../../services/listing.service'
import type { ListingLimitInfo } from '../../services/listing.service'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import toast from 'react-hot-toast'

export default function SellPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [limitInfo, setLimitInfo] = useState<ListingLimitInfo | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (formData: FormData, status: 'DRAFT' | 'ACTIVE') => {
    setIsSubmitting(true)
    try {
      const result = await createListing(formData)
      toast.success(result.message || (status === 'DRAFT' ? 'Draft saved!' : 'Listing published!'))
      navigate(`/listings/${result.listing.id}`)
    } catch (err: any) {
      const data = err.response?.data
      if (data?.code === 'LISTING_LIMIT_REACHED') {
        toast.error(
          data?.message ||
            `You've reached your listing limit (${data?.currentCount ?? ''}/${data?.limit ?? ''}). Upgrade your account to add more.`,
          { duration: 6000 },
        )
      } else {
        toast.error(data?.message || 'Failed to create listing.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const atLimit = limitInfo !== null && !limitInfo.canCreate

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            Sell an Item
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium">
            Turn your used items into a listing and reach nearby buyers across Ethiopia.
          </p>
        </div>

        <ListingLimitBanner onLimitResolved={setLimitInfo} />

        <div className={atLimit ? 'opacity-60 pointer-events-none select-none' : undefined}>
          <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} mode="create" />
        </div>
      </main>

      <Footer />
    </div>
  )
}

