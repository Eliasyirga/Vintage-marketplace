import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import * as authService from '../../services/auth.service'
import { ShieldCheck, KeyRound, Lock, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SecuritySettingsPage() {
  const { user } = useAuth()


  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (res.success) {
        toast.success(res.message || 'Password changed successfully.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(res.message || 'Failed to change password.')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check current password.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Security & Password</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage your login credentials, password, and session security.
        </p>
      </div>

      {/* Account Info / Session Info */}
      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Security Overview</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <Clock className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-500">Last Login</p>
              <p className="text-sm font-bold text-stone-900 mt-0.5">
                {user?.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : 'Active now'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-500">Authentication Method</p>
              <p className="text-sm font-bold text-stone-900 mt-0.5">
                Password + OTP Verification
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-6 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="Minimum 8 characters (Uppercase, lowercase, number)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="Re-enter your new password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
