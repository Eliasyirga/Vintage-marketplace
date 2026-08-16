import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMySellerProfile, updateMySellerProfile } from '../../services/seller.service'
import { useAuthContext } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { User, MapPin, FileText, Image, Loader2, Save, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ETHIOPIAN_CITIES = [
  'Addis Ababa',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Hawassa',
  'Bahir Dar',
  'Dessie',
  'Jimma',
  'Jijiga',
  'Shashamane',
  'Bishoftu',
  'Arba Minch',
  'Harar',
  'Dilla',
  'Nekemte',
]

const ADDIS_SUB_CITIES = [
  'Addis Ketema',
  'Akaky Kaliti',
  'Arada',
  'Bole',
  'Gullele',
  'Kirkos',
  'Kolfe Keranio',
  'Lideta',
  'Nifas Silk-Lafto',
  'Yeka',
  'Lemi Kura',
]

interface FormState {
  displayName: string
  bio: string
  profileImage: string
  city: string
  subCity: string
  neighborhood: string
}

export default function SellerProfileEditPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    displayName: '',
    bio: '',
    profileImage: '',
    city: '',
    subCity: '',
    neighborhood: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const profile = await getMySellerProfile()
        setForm({
          displayName: profile.displayName ?? '',
          bio: profile.bio ?? '',
          profileImage: profile.profileImage ?? '',
          city: profile.city ?? '',
          subCity: profile.subCity ?? '',
          neighborhood: profile.neighborhood ?? '',
        })
      } catch {
        // Profile may not exist yet — start with defaults
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (form.displayName.trim().length < 2) {
      next.displayName = 'Display name must be at least 2 characters.'
    }
    if (form.displayName.trim().length > 120) {
      next.displayName = 'Display name must be 120 characters or fewer.'
    }
    if (form.bio.length > 500) {
      next.bio = 'Bio must be 500 characters or fewer.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      await updateMySellerProfile({
        displayName: form.displayName.trim() || undefined,
        bio: form.bio.trim() || undefined,
        profileImage: form.profileImage.trim() || undefined,
        city: form.city.trim() || undefined,
        subCity: form.subCity.trim() || undefined,
        neighborhood: form.neighborhood.trim() || undefined,
      })
      toast.success('Profile updated successfully!')
      navigate(`/seller/${user?.id}`)
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors as { field: string; message: string }[] | undefined
      if (apiErrors) {
        const mapped: Record<string, string> = {}
        apiErrors.forEach((e) => { mapped[e.field] = e.message })
        setErrors(mapped)
      } else {
        toast.error(err.response?.data?.message || 'Failed to update profile.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
        <Navbar />
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
          <p className="text-sm font-semibold text-stone-600">Loading profile...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Header */}
        <div>
          <Link
            to={`/seller/${user?.id}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            View Profile
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900">Edit Seller Profile</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            This information is shown publicly to buyers on the marketplace.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-3xl shadow-sm divide-y divide-stone-100"
        >
          {/* Display Name */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                Public Identity
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="displayName">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                maxLength={120}
                placeholder="e.g. Elias Electronics"
                className={`w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors ${errors.displayName ? 'border-red-400' : 'border-stone-300'}`}
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.displayName}</p>
              )}
              <p className="mt-1 text-xs text-stone-400">
                {form.displayName.length}/120 characters
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="bio">
                Bio <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={500}
                rows={3}
                placeholder="Tell buyers a little about yourself or what you sell..."
                className={`w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none ${errors.bio ? 'border-red-400' : 'border-stone-300'}`}
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.bio}</p>
              )}
              <p className="mt-1 text-xs text-stone-400">{form.bio.length}/500 characters</p>
            </div>
          </div>

          {/* Profile Image URL */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                Profile Photo
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="profileImage">
                Image URL <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                id="profileImage"
                name="profileImage"
                type="url"
                value={form.profileImage}
                onChange={handleChange}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
              {form.profileImage && (
                <div className="mt-3">
                  <img
                    src={form.profileImage}
                    alt="Preview"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                Location
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="city">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                >
                  <option value="">Select city</option>
                  {ETHIOPIAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="subCity">
                  Sub-City / District
                </label>
                {form.city === 'Addis Ababa' ? (
                  <select
                    id="subCity"
                    name="subCity"
                    value={form.subCity}
                    onChange={handleChange}
                    className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  >
                    <option value="">Select sub-city</option>
                    {ADDIS_SUB_CITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="subCity"
                    name="subCity"
                    type="text"
                    value={form.subCity}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Sub-city or district"
                    className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="neighborhood">
                Neighborhood <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                id="neighborhood"
                name="neighborhood"
                type="text"
                value={form.neighborhood}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Atlas, Gerji"
                className="w-full bg-stone-50 focus:bg-white text-stone-900 font-medium rounded-xl px-4 py-2.5 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Privacy notice */}
          <div className="p-6 bg-stone-50 rounded-b-3xl">
            <div className="flex items-start gap-2 text-xs text-stone-500 font-medium">
              <FileText className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <p>
                Your private email and phone number are never shown on your public profile.
                Only your display name, bio, location, and verification status are visible to buyers.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="p-6 pt-0">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
