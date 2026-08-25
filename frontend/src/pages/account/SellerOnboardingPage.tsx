import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as sellerService from '../../services/seller.service'
import * as accountService from '../../services/account.service'
import { Store, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const ETHIOPIAN_CITIES = [
  'Addis Ababa',
  'Hawassa',
  'Bahir Dar',
  'Dire Dawa',
  'Adama (Nazret)',
  'Gondar',
  'Mekelle',
  'Jimma',
  'Bishoftu (Debre Zeit)',
]

const ADDIS_SUBCITIES = [
  'Bole',
  'Kirkos',
  'Yeka',
  'Arada',
  'Lideta',
  'Nifas Silk-Lafto',
  'Kolfe Keranio',
  'Gullele',
  'Akaky Kaliti',
  'Addis Ketema',
  'Lemi Kura',
]

export default function SellerOnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.fullName || '')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState(user?.avatarUrl || '')
  const [city, setCity] = useState('Addis Ababa')
  const [subCity, setSubCity] = useState('Bole')
  const [neighborhood, setNeighborhood] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Prepopulate if user already has a seller profile
  useEffect(() => {
    async function checkExisting() {
      try {
        const profile = await sellerService.getMySellerProfile()
        if (profile) {
          setDisplayName(profile.displayName || user?.fullName || '')
          setBio(profile.bio || '')
          setProfileImage(profile.profileImage || user?.avatarUrl || '')
          if (profile.city) setCity(profile.city)
          if (profile.subCity) setSubCity(profile.subCity)
          if (profile.neighborhood) setNeighborhood(profile.neighborhood)
        }
      } catch {
        // No profile yet, proceed with defaults
      }
    }
    checkExisting()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      toast.error('Seller display name is required.')
      return
    }

    setSubmitting(true)
    try {
      const profile = await sellerService.updateMySellerProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        profileImage: profileImage.trim() || undefined,
        city,
        subCity: city === 'Addis Ababa' ? subCity : undefined,
        neighborhood: neighborhood.trim() || undefined,
      })

      if (profile) {
        toast.success('Seller profile created! You are ready to start selling.')
        navigate('/sell')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save seller profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Seller Onboarding
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Set up your marketplace shop profile in 30 seconds. Buyers will see your location and trust score when purchasing.
        </p>
      </div>

      {/* Onboarding Form */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Public Display Name / Store Name *
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="e.g. Vintage Vault Addis, Elias Y."
            />
            <p className="text-xs text-stone-500 mt-1">This name will appear on all your item listings.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              About Your Vintage Collection / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
              placeholder="Tell buyers what kind of pre-loved goods or vintage gems you specialize in..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
              >
                {ETHIOPIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {city === 'Addis Ababa' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Sub-City *
                </label>
                <select
                  value={subCity}
                  onChange={(e) => setSubCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                >
                  {ADDIS_SUBCITIES.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Neighborhood / Area (Optional)
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="e.g. Kazanchis, Piassa, Sarbet, 22 Mazoria"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Profile Photo (Optional)
            </label>
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center border border-stone-200">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-amber-800">
                    {(displayName || user?.fullName || 'S').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="cursor-pointer inline-block px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm transition-all">
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const res = await accountService.uploadAvatar(file)
                        if (res.success && res.data) {
                          setProfileImage(res.data.avatarUrl)
                          toast.success('Avatar uploaded to Cloudinary!')
                        }
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Upload failed.')
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-stone-500">JPG, PNG, WEBP up to 5MB.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>{submitting ? 'Saving Profile...' : 'Complete & Start Selling'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
