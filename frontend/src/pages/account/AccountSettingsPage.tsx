import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as accountService from '../../services/account.service'
import { User, AlertTriangle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils'


export default function AccountSettingsPage() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [updating, setUpdating] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are supported.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar image must be 5 MB or smaller.')
      return
    }

    setUploadingAvatar(true)
    try {
      const res = await accountService.uploadAvatar(file)
      if (res.success && res.data) {
        setAvatarUrl(res.data.avatarUrl)
        toast.success('Profile avatar updated successfully!')
        await refreshUser()
      } else {
        toast.error(res.message || 'Failed to upload avatar.')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true)
    try {
      const res = await accountService.removeAvatar()
      if (res.success) {
        setAvatarUrl('')
        toast.success('Avatar removed.')
        await refreshUser()
      } else {
        toast.error(res.message || 'Failed to remove avatar.')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove avatar.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Full name is required.')
      return
    }

    setUpdating(true)
    try {
      const res = await accountService.updateAccountProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      })

      if (res.success) {
        toast.success('Account information updated.')
        await refreshUser()
      } else {
        toast.error(res.message || 'Failed to update account.')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update account.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeactivate = async () => {
    setDeactivating(true)
    try {
      const res = await accountService.deactivateAccount()
      if (res.success) {
        toast.success('Your account has been deactivated.')
        await logout()
        navigate('/login')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to deactivate account.')
    } finally {
      setDeactivating(false)
      setShowDeactivateModal(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Account Settings</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage your personal details, profile picture, and account preferences.
        </p>
      </div>

      {/* Edit Personal Info */}
      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          <span>Personal Information</span>
        </h3>

        {/* Profile Picture Upload Section */}
        <div className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center border-2 border-white shadow">
            {avatarUrl || user?.avatarUrl ? (
              <img
                src={resolveImageUrl(avatarUrl || user?.avatarUrl)}
                alt={user?.fullName || 'Avatar'}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e)}
              />
            ) : (
              <span className="text-2xl font-bold text-amber-800">
                {(user?.fullName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <p className="text-sm font-bold text-stone-900">Profile Photo</p>
            <p className="text-xs text-stone-500">
              Upload a clear photo (JPG, PNG, WEBP up to 5MB). Hosted securely on Cloudinary.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm transition-all">
                <span>{uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
              {(avatarUrl || user?.avatarUrl) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-red-100 hover:text-red-700 text-stone-700 font-semibold text-xs transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Profile Photo URL (Or use uploader above)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Email Address (Read-only)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || 'Not provided'}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Phone Number (Read-only)
            </label>
            <input
              type="text"
              disabled
              value={user?.phone || 'Not provided'}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-500 text-sm cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Deactivate Account */}
      <div className="p-6 bg-red-50/50 rounded-3xl border border-red-200 space-y-4">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold text-base text-red-900">Danger Zone</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Deactivating your account will hide your listings and disable your ability to place orders.
          Past financial records and transaction receipts remain preserved for legal compliance.
        </p>

        <button
          onClick={() => setShowDeactivateModal(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-2xl shadow-sm transition-all"
        >
          Deactivate Account
        </button>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-stone-900">Deactivate Your Account?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to deactivate your Vintage Marketplace account? You will be signed out immediately.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/20"
              >
                {deactivating ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
