import { MapPin, Tag, Eye, X } from 'lucide-react'
import { CONDITION_LABELS, type CreateListingFormState } from '../../types/listing'
import type { ImageItem } from './ImageUploader'
import { useAuthContext } from '../../context/AuthContext'

interface ListingPreviewProps {
  formData: CreateListingFormState
  images: ImageItem[]
  isOpen: boolean
  onClose: () => void
  onPublish: () => void
  onSaveDraft: () => void
  isSubmitting: boolean
}

export function ListingPreview({
  formData,
  images,
  isOpen,
  onClose,
  onPublish,
  onSaveDraft,
  isSubmitting,
}: ListingPreviewProps) {
  const { user } = useAuthContext()

  if (!isOpen) return null

  const coverImage = images[0]?.previewUrl || '/placeholder.png'
  const formattedPrice = Number(formData.price)
    ? Number(formData.price).toLocaleString('en-US')
    : '0'

  const conditionLabel = CONDITION_LABELS[formData.condition]?.title || formData.condition

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">Listing Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Photos carousel / main preview */}
          <div className="space-y-3">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
              {images.length > 0 ? (
                <img
                  src={coverImage}
                  alt={formData.title || 'Product preview'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 font-medium">
                  No image selected
                </div>
              )}
              <span className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-md shadow uppercase tracking-wider">
                Preview Mode
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.previewUrl}
                    alt={`Thumb ${idx + 1}`}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  {formData.title || 'Untitled Listing'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-2">
                  <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 font-semibold px-2.5 py-1 rounded-lg">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    Category
                  </span>
                  <span className="flex items-center gap-1 bg-stone-100 border border-stone-200 font-semibold px-2.5 py-1 rounded-lg">
                    {conditionLabel}
                  </span>
                  <span className="flex items-center gap-1 bg-stone-100 border border-stone-200 font-semibold px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {formData.city}
                    {formData.subCity ? `, ${formData.subCity}` : ''}
                    {formData.neighborhood ? ` (${formData.neighborhood})` : ''}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
                  {formattedPrice} <span className="text-xs font-normal text-stone-500">ETB</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Description
              </h4>
              <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                {formData.description || 'No description provided yet.'}
              </p>
            </div>

            {/* Seller Info Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-700">
                  {user?.fullName?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">{user?.fullName || 'Seller'}</p>
                  <p className="text-xs text-stone-500">Seller (You)</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1 rounded-full">
                Verified Seller
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-end gap-3 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 text-sm font-semibold transition-colors shadow-sm"
          >
            Back to Edit
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSaveDraft}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-semibold transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onPublish}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Listing Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
