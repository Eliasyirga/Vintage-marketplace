import { useState, type FormEvent } from 'react'
import { ImageUploader, type ImageItem } from './ImageUploader'
import { CategorySelector } from './CategorySelector'
import { ConditionSelector } from './ConditionSelector'
import { ListingPreview } from './ListingPreview'
import type {
  CreateListingFormState,
  ListingCondition,
} from '../../types/listing'
import { FileText, MapPin, DollarSign, Tag, Info, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface ListingFormProps {
  initialValues?: Partial<CreateListingFormState>
  initialImages?: ImageItem[]
  onSubmit: (formData: FormData, status: 'DRAFT' | 'ACTIVE') => Promise<void>
  isSubmitting: boolean
  mode?: 'create' | 'edit'
}

export function ListingForm({
  initialValues,
  initialImages = [],
  onSubmit,
  isSubmitting,
  mode = 'create',
}: ListingFormProps) {
  const [images, setImages] = useState<ImageItem[]>(initialImages)
  const [formState, setFormState] = useState<CreateListingFormState>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    price: initialValues?.price || '',
    categoryId: initialValues?.categoryId || '',
    condition: initialValues?.condition || 'LIGHTLY_USED',
    city: initialValues?.city || 'Addis Ababa',
    subCity: initialValues?.subCity || '',
    neighborhood: initialValues?.neighborhood || '',
    status: initialValues?.status || 'ACTIVE',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleInputChange = (field: keyof CreateListingFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (targetStatus: 'DRAFT' | 'ACTIVE'): boolean => {
    const errs: Record<string, string> = {}

    if (!formState.title.trim()) {
      errs.title = 'Title is required.'
    } else if (formState.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.'
    } else if (formState.title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters.'
    }

    if (!formState.categoryId) {
      errs.categoryId = 'Please select a category.'
    }

    if (!formState.price || isNaN(Number(formState.price)) || Number(formState.price) <= 0) {
      errs.price = 'Please enter a valid price greater than 0.'
    }

    if (!formState.city.trim()) {
      errs.city = 'City is required.'
    }

    if (targetStatus === 'ACTIVE') {
      if (images.length < 1) {
        toast.error('At least 1 photo is required to publish a listing.')
        errs.images = 'At least 1 photo is required.'
      }

      if (formState.description.trim().length < 20) {
        errs.description = 'Description must be at least 20 characters to publish.'
      }
    } else if (formState.description.trim().length > 0 && formState.description.trim().length < 20) {
      errs.description = 'Description must be at least 20 characters when provided.'
    }

    if (formState.description.trim().length > 5000) {
      errs.description = 'Description cannot exceed 5000 characters.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const prepareFormData = (targetStatus: 'DRAFT' | 'ACTIVE'): FormData => {
    const fd = new FormData()
    fd.append('title', formState.title.trim())
    fd.append('description', formState.description.trim())
    fd.append('price', String(Number(formState.price)))
    fd.append('categoryId', formState.categoryId)
    fd.append('condition', formState.condition)
    fd.append('city', formState.city.trim())
    if (formState.subCity.trim()) fd.append('subCity', formState.subCity.trim())
    if (formState.neighborhood.trim()) fd.append('neighborhood', formState.neighborhood.trim())
    fd.append('status', targetStatus)

    images.forEach((img) => {
      if (img.file) {
        fd.append('images', img.file)
      }
    })

    return fd
  }

  const handlePublish = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (!validateForm('ACTIVE')) {
      toast.error('Please fix the errors in the form before publishing.')
      return
    }
    const fd = prepareFormData('ACTIVE')
    await onSubmit(fd, 'ACTIVE')
  }

  const handleSaveDraft = async () => {
    if (!validateForm('DRAFT')) {
      toast.error('Please fix the errors in the form before saving draft.')
      return
    }
    const fd = prepareFormData('DRAFT')
    await onSubmit(fd, 'DRAFT')
  }

  return (
    <>
      <form onSubmit={handlePublish} className="space-y-8 max-w-3xl mx-auto">
        {/* Section 1: Photos */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
              1
            </span>
            <h2 className="text-lg font-bold text-stone-900">Item Photos</h2>
          </div>
          <ImageUploader images={images} onChange={setImages} maxImages={8} />
          {errors.images && <p className="text-xs text-red-600 font-medium">{errors.images}</p>}
        </section>

        {/* Section 2: Basic Information */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
              2
            </span>
            <h2 className="text-lg font-bold text-stone-900">Basic Information</h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              Listing Title <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Samsung Galaxy S23 256GB"
              className={`w-full bg-stone-50/50 focus:bg-white text-stone-900 rounded-xl px-4 py-3 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                errors.title ? 'border-red-500 bg-red-50/20' : 'border-stone-300 hover:border-stone-400'
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 font-medium">{errors.title}</p>}
          </div>
        </section>

        {/* Section 3: Category & Condition */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
              3
            </span>
            <h2 className="text-lg font-bold text-stone-900">Category & Condition</h2>
          </div>

          <CategorySelector
            value={formState.categoryId}
            onChange={(catId) => handleInputChange('categoryId', catId)}
            error={errors.categoryId}
          />

          <ConditionSelector
            value={formState.condition}
            onChange={(cond: ListingCondition) => handleInputChange('condition', cond)}
            error={errors.condition}
          />
        </section>

        {/* Section 4: Pricing */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
              4
            </span>
            <h2 className="text-lg font-bold text-stone-900">Pricing</h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Price (ETB) <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={formState.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g. 45000"
                className={`w-full bg-stone-50/50 focus:bg-white text-stone-900 font-semibold rounded-xl pl-4 pr-16 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.price ? 'border-red-500 bg-red-50/20' : 'border-stone-300 hover:border-stone-400'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-amber-600 text-xs">
                ETB
              </span>
            </div>
            {formState.price && !isNaN(Number(formState.price)) && (
              <p className="text-xs text-stone-500 mt-1">
                Display format: <span className="font-bold text-stone-800">{Number(formState.price).toLocaleString('en-US')} ETB</span>
              </p>
            )}
            {errors.price && <p className="text-xs text-red-600 font-medium">{errors.price}</p>}
          </div>
        </section>

        {/* Section 5: Location */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
              5
            </span>
            <h2 className="text-lg font-bold text-stone-900">Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                City <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={formState.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g. Addis Ababa"
                className={`w-full bg-stone-50/50 focus:bg-white text-stone-900 rounded-xl px-3.5 py-2.5 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                  errors.city ? 'border-red-500' : 'border-stone-300'
                }`}
              />
              {errors.city && <p className="text-xs text-red-600 font-medium">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Sub-city</label>
              <input
                type="text"
                value={formState.subCity}
                onChange={(e) => handleInputChange('subCity', e.target.value)}
                placeholder="e.g. Bole"
                className="w-full bg-stone-50/50 focus:bg-white text-stone-900 rounded-xl px-3.5 py-2.5 text-sm font-medium border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Neighborhood</label>
              <input
                type="text"
                value={formState.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="e.g. Atlas"
                className="w-full bg-stone-50/50 focus:bg-white text-stone-900 rounded-xl px-3.5 py-2.5 text-sm font-medium border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        </section>

        {/* Section 6: Description */}
        <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xs">
              6
            </span>
            <h2 className="text-lg font-bold text-stone-900">Item Description</h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Detailed Description <span className="text-amber-600">*</span>
            </label>
            <textarea
              rows={5}
              value={formState.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the item's condition, age, usage, included accessories, and any issues buyers should know about."
              className={`w-full bg-stone-50/50 focus:bg-white text-stone-900 rounded-xl p-4 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                errors.description ? 'border-red-500 bg-red-50/20' : 'border-stone-300 hover:border-stone-400'
              }`}
            />
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 font-medium">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Minimum 20 characters required to publish.
              </span>
              <span className="font-semibold">{formState.description.length} / 5000</span>
            </div>
            {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
          </div>
        </section>

        {/* Section 7: Actions */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200 shadow-md">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-stone-200"
          >
            <Eye className="w-4 h-4 text-amber-600" />
            Preview Listing
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-bold transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Publishing...'
                  : 'Saving...'
                : mode === 'create'
                ? 'Publish Listing'
                : 'Save Changes'}
            </button>
          </div>
        </section>
      </form>

      <ListingPreview
        formData={formState}
        images={images}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
