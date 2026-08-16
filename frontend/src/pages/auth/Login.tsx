import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Phone, ArrowRight, Loader2, Sparkles, ShieldCheck, Star, Package, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

interface FormErrors {
  identifier?: string
  password?: string
  general?: string
}

const BRAND_STATS = [
  { label: 'Active Users', value: '12K+' },
  { label: 'Products', value: '45K+' },
  { label: 'Cities', value: '15+' },
]

const BRAND_FEATURES = [
  { icon: Package, text: 'Buy & sell quality used items' },
  { icon: Star, text: 'Verified sellers & trusted reviews' },
  { icon: TrendingUp, text: 'Best prices across Ethiopia' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/browse'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const isPhone = identifier.trim().startsWith('0') || identifier.trim().startsWith('+') || /^\d/.test(identifier.trim())

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!identifier.trim()) newErrors.identifier = 'Please enter your email address or phone number.'
    if (!password) newErrors.password = 'Please enter your password.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})
    try {
      const loggedUser = await login({ identifier: identifier.trim(), password })
      toast.success('Welcome back to Vintage!')
      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setErrors({ general: axiosErr?.response?.data?.message || 'Invalid email/phone or password.' })
    } finally {
      setIsLoading(false)
    }
  }

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
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
              ✨ Welcome Back
            </span>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Sign in to your<br />
              <span className="text-amber-400">Vintage account</span>
            </h2>
            <p className="text-stone-400 mt-4 text-base leading-relaxed">
              Connect with buyers & sellers across Ethiopia. Manage your listings, messages, and saved items easily.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="space-y-3.5">
            {BRAND_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-stone-800/50 backdrop-blur-sm rounded-2xl p-3.5 border border-stone-700/50">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-stone-200 text-sm font-semibold">{text}</span>
              </div>
            ))}
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-3 bg-emerald-950/40 rounded-2xl p-3.5 border border-emerald-800/40">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 text-xs font-bold">Secure Authentication</p>
              <p className="text-emerald-500/80 text-xs">256-bit encrypted SSL & OTP security</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800">
            {BRAND_STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-amber-400 font-extrabold text-2xl tracking-tight">{value}</p>
                <p className="text-stone-400 text-xs font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-stone-500 text-xs">© Vintage Marketplace. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-stone-900 font-extrabold text-lg">Vintage Marketplace</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Sign in to Vintage
            </h1>
            <p className="text-stone-500 mt-2 text-sm font-medium">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-amber-700 hover:text-amber-800 font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm font-medium">
                <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
                <p>{errors.general}</p>
              </div>
            )}

            {/* Identifier (Email / Phone) */}
            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email or Phone Number
              </label>
              <div className="relative">
                {isPhone ? (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                ) : (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                )}
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  disabled={isLoading}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }))
                  }}
                  placeholder="user@example.com or 0912345678"
                  className={`w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
                    errors.identifier
                      ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                      : 'border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-600 text-xs mt-1.5 font-semibold flex items-center gap-1">
                  <span>⚠</span> {errors.identifier}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  placeholder="Enter password"
                  className={`w-full bg-white border-2 rounded-xl px-4 py-3 pr-11 text-stone-900 placeholder-stone-300 text-sm font-medium transition-all focus:outline-none ${
                    errors.password
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
              {errors.password && (
                <p className="text-red-600 text-xs mt-1.5 font-semibold flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-amber-600/25 text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs text-stone-400 font-bold uppercase tracking-wider">
                <span className="bg-stone-50 px-3">New to Vintage?</span>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-stone-200 hover:border-amber-400 text-stone-800 font-bold py-3 rounded-xl transition-all text-sm hover:text-amber-800 shadow-sm"
            >
              Create Account
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
