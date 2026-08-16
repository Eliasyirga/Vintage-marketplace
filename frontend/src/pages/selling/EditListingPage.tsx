import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ListingForm } from '../../components/listings/ListingForm'
import { getListingById, updateListing } from '../../services/listing.service'
import type { Listing } from '../../types/listing'
import type { ImageItem } from '../../components/listings/ImageUploader'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthContext } from '../../context/AuthContext'

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadListing() {
      if (!id) return
      try {
        const data = await getListingById(id)

        if (data.seller.id !== user?.id) {
          toast.error('You do not have permission to edit this listing.')
          navigate('/my-listings')
          return
        }

        setListing(data)
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Listing not found.')
        navigate('/my-listings')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadListing()
    }
  }, [id, user, navigate])

  const handleSubmit = async (formData: FormData) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      const result = await updateListing(id, formData)
      toast.success(result.message || 'Listing updated successfully.')
      navigate(`/listings/${id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-sm font-semibold text-stone-600">Loading listing details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!listing) return null

  const initialImages: ImageItem[] = listing.images.map((img) => ({
    id: img.id,
    existingImage: img,
    previewUrl: img.url,
  }))

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            Edit Listing
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-medium">
            Update your item details, photos, or status.
          </p>
        </div>

        <ListingForm
          initialValues={{
            title: listing.title,
            description: listing.description,
            price: String(listing.price),
            categoryId: listing.category.id,
            condition: listing.condition,
            city: listing.city,
            subCity: listing.subCity || '',
            neighborhood: listing.neighborhood || '',
            status: listing.status,
          }}
          initialImages={initialImages}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </main>

      <Footer />
    </div>
  )
}
