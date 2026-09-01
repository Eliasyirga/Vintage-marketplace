import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ShieldCheck, Loader2, RotateCcw, CheckCircle2, Sparkles, ArrowLeft, RefreshCw, Mail, Phone, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import * as authService from '../../services/auth.service'
import { useAuth } from '../../hooks/useAuth'
import { OTPInput } from '../../components/auth/OTPInput'
import { RegistrationProgress } from '../../components/auth/RegistrationProgress'
import { isValidEmail, isValidEthiopianPhone } from '../../utils/validation'
import type { VerificationMethod } from '../../types/auth'

interface LocationState {
  registrationId: string
  maskedDestination: string
  verificationMethod: VerificationMethod
}

const INITIAL_EXPIRY_SECONDS = 5 * 60 // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60 // 60 seconds

export default function VerifyRegistration() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuthFromResponse } = useAuth()

  const state = location.state as LocationState | null

  useEffect(() => {
    if (!state?.registrationId) {
      navigate('/register', { replace: true })
    }
  }, [state, navigate])

  const [registrationId, setRegistrationId] = useState(state?.registrationId || '')
  const [maskedDestination, setMaskedDestination] = useState(state?.maskedDestination || '')
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(
    state?.verificationMethod || 'EMAIL',
  )

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isChangingMethod, setIsChangingMethod] = useState(false)

  // Countdown timers
  const [expiryTimer, setExpiryTimer] = useState(INITIAL_EXPIRY_SECONDS)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [canResend, setCanResend] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userName, setUserName] = useState('')

  // New method change form inputs
  const [newMethod, setNewMethod] = useState<VerificationMethod>('EMAIL')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [changeError, setChangeError] = useState('')
  const [isSubmittingChange, setIsSubmittingChange] = useState(false)

  // Expiry Timer countdown
  useEffect(() => {
    if (expiryTimer <= 0) return
    const timer = setInterval(() => {
      setExpiryTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [expiryTimer])

  // Resend Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Handle Verification
  const handleVerify = useCallback(async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of your verification code.')
      return
    }
    if (!registrationId) return

    setIsVerifying(true)
    setError('')

    try {
      const response = await authService.verifyRegistration(registrationId, otpString)
      if (response.success && response.data) {
        setSuccess(true)
        setUserName(response.data.user.fullName || 'Member')
        setAuthFromResponse(response.data)
        toast.success('Account verified!')

        setTimeout(() => {
          navigate('/browse', { replace: true })
        }, 2000)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(
        axiosErr?.response?.data?.message || 'Incorrect verification code. Please try again.',
      )
      setOtp(Array(6).fill(''))
    } finally {
      setIsVerifying(false)
    }
  }, [otp, registrationId, setAuthFromResponse, navigate])

  // Auto trigger verification when 6 digits are typed
  useEffect(() => {
    if (otp.every((d) => d !== '') && !isVerifying && !success && !isChangingMethod) {
      handleVerify()
    }
  }, [otp, isVerifying, success, isChangingMethod, handleVerify])

  // Resend OTP
  async function handleResend() {
    if (!canResend || !registrationId || isResending) return
    setIsResending(true)
    setError('')

    try {
      const response = await authService.resendOtp(registrationId)
      if (response.success) {
        toast.success('New verification code sent!')
        setOtp(Array(6).fill(''))
        setCanResend(false)
        setResendCooldown(RESEND_COOLDOWN_SECONDS)
        setExpiryTimer(INITIAL_EXPIRY_SECONDS)
        if (response.data?.maskedDestination) {
          setMaskedDestination(response.data.maskedDestination)
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message || 'Could not resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  // Submit Change Verification Method
  async function handleChangeMethodSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChangeError('')

    if (newMethod === 'EMAIL') {
      if (!newEmail.trim() || !isValidEmail(newEmail)) {
        setChangeError('Please enter a valid email address.')
        return
      }
    } else {
      if (!newPhone.trim() || !isValidEthiopianPhone(newPhone)) {
        setChangeError('Please enter a valid Ethiopian phone number.')
        return
      }
    }

    setIsSubmittingChange(true)
    try {
      const response = await authService.changeVerificationMethod({
        registrationId,
        verificationMethod: newMethod,
        email: newMethod === 'EMAIL' ? newEmail.trim() : undefined,
        phone: newMethod === 'PHONE' ? newPhone.trim() : undefined,
      })

      if (response.success && response.data) {
        toast.success('Verification method updated!')
        setVerificationMethod(newMethod)
        setMaskedDestination(response.data.maskedDestination)
        setRegistrationId(response.data.registrationId)
        setIsChangingMethod(false)
        setOtp(Array(6).fill(''))
        setError('')
        setResendCooldown(RESEND_COOLDOWN_SECONDS)
        setCanResend(false)
        setExpiryTimer(INITIAL_EXPIRY_SECONDS)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setChangeError(
        axiosErr?.response?.data?.message || 'Failed to update verification method.',
      )
    } finally {
      setIsSubmittingChange(false)
    }
  }

  if (!state?.registrationId && !registrationId) return null

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans">
      {/* ── Shared Left Brand Panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[45%] flex-col justify-between bg-stone-900 relative overflow-hidden p-10 xl:p-14 border-r border-stone-800">
        {/* Ambient Gradient Lighting */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, #b45309 50%, transparent 80%)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none blur-2xl"
          style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }}
        />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-amber-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-extrabold text-lg tracking-tight leading-none">
                Vintage Marketplace
              </p>
              <p className="text-stone-400 text-xs font-medium mt-0.5">Make Bonda Digital</p>
            </div>
          </Link>
        </div>

        {/* Center Hero */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${
              success
                ? 'bg-emerald-500/20 border-2 border-emerald-400/40 shadow-lg shadow-emerald-500/10'
                : 'bg-amber-500/20 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10'
            }`}
          >
            {success ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-amber-400" />
            )}
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              Step 2 of 3 — Security Check
            </span>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {success ? "You're all set!" : 'Verify your\nidentity'}
            </h2>
            <p className="text-stone-400 mt-4 text-base leading-relaxed">
              {success
                ? 'Your account has been verified successfully. Taking you to the marketplace...'
                : 'We sent a 6-digit code to protect your account. Enter it to activate your profile.'}
            </p>
          </div>

          {!success && (
            <div className="space-y-3 pt-2">
              {[
                { icon: Lock, text: '6-digit OTP code expires in 5 minutes' },
                { icon: Mail, text: 'Check spam folder if email was selected' },
                { icon: RotateCcw, text: 'Request a new code after 60 seconds' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-stone-800/50 backdrop-blur-sm rounded-2xl p-3 border border-stone-700/50">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-stone-300 text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-stone-500 text-xs">© Vintage Marketplace. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-stone-900 font-extrabold text-lg">Vintage Marketplace</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Visual Step Indicator */}
          <RegistrationProgress currentStep={success ? 3 : 2} />

          {success ? (
            /* ── Step 3: Complete State ── */
            <div className="text-center py-6 bg-white border-2 border-emerald-100 rounded-3xl p-8 shadow-xl shadow-emerald-500/5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Account Verified!</h1>
              <p className="text-stone-600 text-base mb-6 font-medium">
                Welcome to Vintage, <span className="font-bold text-stone-900">{userName}</span>.
              </p>
              <button
                id="continue-to-home-btn"
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-600/25 text-sm"
              >
                Continue to Marketplace
              </button>
            </div>
          ) : isChangingMethod ? (
            /* ── Change Verification Method Form ── */
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-stone-900">Change verification method</h2>
                <p className="text-stone-500 text-xs mt-1">
                  Switch destination to receive a new code.
                </p>
              </div>

              {changeError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {changeError}
                </div>
              )}

              <form onSubmit={handleChangeMethodSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewMethod('EMAIL')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                      newMethod === 'EMAIL' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-500'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMethod('PHONE')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                      newMethod === 'PHONE' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-500'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </button>
                </div>

                {newMethod === 'EMAIL' ? (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">New Phone Number</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full bg-white border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingMethod(false)}
                    className="flex-1 py-2.5 border-2 border-stone-200 rounded-xl text-stone-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingChange}
                    className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-500 disabled:opacity-50"
                  >
                    {isSubmittingChange ? 'Updating...' : 'Update & Send Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ── Step 2: Verification Form ── */
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                  Verify your account
                </h1>
                <p className="text-stone-600 mt-2 text-sm font-medium leading-relaxed">
                  {verificationMethod === 'EMAIL'
                    ? `We sent a 6-digit code to ${maskedDestination}`
                    : `We sent a 6-digit code to ${maskedDestination}`}
                </p>

                {/* Expiration Timer Indicator */}
                <div className="mt-3 flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-bold text-amber-900">Code expires in</span>
                  <span
                    className={`font-mono font-extrabold text-xs tracking-wider tabular-nums ${
                      expiryTimer < 60 ? 'text-red-600 animate-pulse' : 'text-amber-800'
                    }`}
                  >
                    {formatTimer(expiryTimer)}
                  </span>
                </div>
              </div>

              {/* OTP Input Boxes */}
              <div className="mb-6">
                <OTPInput
                  value={otp}
                  onChange={(newOtp) => {
                    setOtp(newOtp)
                    setError('')
                  }}
                  disabled={isVerifying || expiryTimer === 0}
                  error={!!error}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                id="verify-otp-submit-btn"
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || otp.some((d) => !d) || expiryTimer === 0}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-amber-600/25 text-sm mb-6"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>

              {/* Resend Controls */}
              <div className="text-center space-y-3">
                <p className="text-stone-500 text-xs font-semibold">Didn't receive the code?</p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'Sending new code...' : 'Resend Code'}</span>
                  </button>
                ) : (
                  <p className="text-stone-500 text-xs font-medium">
                    Resend code in{' '}
                    <span className="text-amber-800 font-mono font-bold tabular-nums">
                      {formatTimer(resendCooldown)}
                    </span>
                  </p>
                )}
              </div>

              {/* Change Verification Method Link */}
              <div className="text-center mt-6 pt-6 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 text-xs font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <span>Wrong email or phone number?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMethod(verificationMethod)
                      setIsChangingMethod(true)
                    }}
                    className="text-amber-700 hover:text-amber-900 font-bold underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Change
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
