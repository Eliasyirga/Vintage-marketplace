import { useState } from 'react'
import { Eye, EyeOff, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { VerificationMethodSelector } from './VerificationMethodSelector'
import { isStrongPassword, isValidEmail, isValidEthiopianPhone } from '../../utils/validation'
import type { VerificationMethod, RegisterFormData } from '../../types/auth'

export interface RegistrationFormErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface RegistrationFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  isLoading: boolean
  serverErrors?: RegistrationFormErrors
}

export function RegistrationForm({ onSubmit, isLoading, serverErrors }: RegistrationFormProps) {
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('EMAIL')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [localErrors, setLocalErrors] = useState<RegistrationFormErrors>({})

  const activeErrors = { ...localErrors, ...serverErrors }

  const passwordStrength = isStrongPassword(password)

  const strengthScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore]
  const strengthColors = [
    '',
    'bg-red-500',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-emerald-500',
  ]
  const strengthTextColors = [
    '',
    'text-red-600',
    'text-orange-600',
    'text-yellow-700',
    'text-emerald-600',
  ]

  function validate(): boolean {
    const newErrors: RegistrationFormErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.'
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.'
    }

    if (verificationMethod === 'EMAIL') {
      if (!email.trim()) {
        newErrors.email = 'Please enter your email address.'
      } else if (!isValidEmail(email)) {
        newErrors.email = 'Please enter a valid email address.'
      }
    } else {
      if (!phone.trim()) {
        newErrors.phone = 'Please enter your phone number.'
      } else if (!isValidEthiopianPhone(phone)) {
        newErrors.phone = 'Please enter a valid Ethiopian phone number (e.g. 0912345678).'
      }
    }

    if (!password) {
      newErrors.password = 'Please enter a password.'
    } else if (!passwordStrength.valid) {
      newErrors.password = passwordStrength.errors[0]
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setLocalErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLoading) return
    if (!validate()) return

    setLocalErrors({})

    await onSubmit({
      fullName: fullName.trim(),
      email: verificationMethod === 'EMAIL' ? email.trim() : '',
      phone: verificationMethod === 'PHONE' ? phone.trim() : '',
      password,
      confirmPassword,
      verificationMethod,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* General Error Banner */}
      {activeErrors.general && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm font-medium">
          <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
          <p>{activeErrors.general}</p>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          disabled={isLoading}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            if (localErrors.fullName) setLocalErrors((prev) => ({ ...prev, fullName: undefined }))
          }}
          placeholder="Enter your full name"
          className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
            activeErrors.fullName
              ? 'border-red-400 bg-red-50/20 focus:border-red-500'
              : 'border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
          }`}
        />
        {activeErrors.fullName && (
          <p className="text-red-600 text-xs mt-1.5 font-semibold">
            {activeErrors.fullName}
          </p>
        )}
      </div>

      {/* Verification Method Selector */}
      <VerificationMethodSelector
        selectedMethod={verificationMethod}
        onChange={(method) => {
          setVerificationMethod(method)
          setLocalErrors({})
        }}
        disabled={isLoading}
      />

      {/* Email / Phone Field */}
      {verificationMethod === 'EMAIL' ? (
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (localErrors.email) setLocalErrors((prev) => ({ ...prev, email: undefined }))
              }}
              placeholder="user@example.com"
              className={`w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
                activeErrors.email
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                  : 'border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
              }`}
            />
          </div>
          {activeErrors.email && (
            <p className="text-red-600 text-xs mt-1.5 font-semibold">
              {activeErrors.email}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-stone-100 border-2 border-stone-200 rounded-xl px-3.5 text-stone-700 text-sm font-bold whitespace-nowrap">
              <span>+251</span>
            </div>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              disabled={isLoading}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (localErrors.phone) setLocalErrors((prev) => ({ ...prev, phone: undefined }))
              }}
              placeholder="0912345678"
              className={`flex-1 bg-white border-2 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
                activeErrors.phone
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                  : 'border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
              }`}
            />
          </div>
          {activeErrors.phone && (
            <p className="text-red-600 text-xs mt-1.5 font-semibold">
              {activeErrors.phone}
            </p>
          )}
        </div>
      )}

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isLoading}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (localErrors.password) setLocalErrors((prev) => ({ ...prev, password: undefined }))
            }}
            placeholder="Enter password"
            className={`w-full bg-white border-2 rounded-xl px-4 py-3 pr-11 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
              activeErrors.password
                ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                : 'border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < strengthScore ? strengthColors[strengthScore] : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-semibold ${strengthTextColors[strengthScore]}`}>
              Password Strength: {strengthLabel}
            </p>
          </div>
        )}

        {activeErrors.password && (
          <p className="text-red-600 text-xs mt-1.5 font-semibold">
            {activeErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isLoading}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (localErrors.confirmPassword) setLocalErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            placeholder="Confirm password"
            className={`w-full bg-white border-2 rounded-xl px-4 py-3 pr-11 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
              activeErrors.confirmPassword
                ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                : confirmPassword && confirmPassword === password
                  ? 'border-emerald-400 focus:ring-4 focus:ring-emerald-500/10'
                  : 'border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
            }`}
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {confirmPassword && confirmPassword === password && (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {activeErrors.confirmPassword && (
          <p className="text-red-600 text-xs mt-1.5 font-semibold">
            {activeErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        id="register-submit-btn"
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 text-sm mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating your account...</span>
          </>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}
