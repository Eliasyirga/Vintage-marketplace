import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Star, Package, TrendingUp, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import * as authService from '../../services/auth.service'
import { RegistrationProgress } from '../../components/auth/RegistrationProgress'
import { RegistrationForm, type RegistrationFormErrors } from '../../components/auth/RegistrationForm'
import type { RegisterFormData } from '../../types/auth'

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

export default function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState<RegistrationFormErrors>({})

  async function handleRegistrationSubmit(data: RegisterFormData) {
    setIsLoading(true)
    setServerErrors({})

    try {
      const response = await authService.register(data)
      if (response.success && response.data) {
        toast.success(response.message || 'Verification code sent!')
        navigate('/verify-registration', {
          state: {
            registrationId: response.data.registrationId,
            maskedDestination: response.data.maskedDestination,
            verificationMethod: data.verificationMethod,
          },
          replace: true,
        })
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string
            errors?: Array<{ field: string; message: string }>
          }
        }
      }
      const respData = axiosErr?.response?.data
      if (respData?.errors?.length) {
        const fieldErrors: RegistrationFormErrors = {}
        const validFields = ['fullName', 'email', 'phone', 'password', 'confirmPassword']
        for (const e of respData.errors) {
          if (validFields.includes(e.field)) {
            fieldErrors[e.field as keyof RegistrationFormErrors] = e.message
          } else {
            fieldErrors.general = e.message
          }
        }
        setServerErrors(fieldErrors)
      } else {
        setServerErrors({
          general: respData?.message || "We couldn't connect to the server. Please try again.",
        })
      }
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
              🚀 Join Ethiopia's #1 Marketplace
            </span>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Create your free<br />
              <span className="text-amber-400">Vintage account</span>
            </h2>
            <p className="text-stone-400 mt-4 text-base leading-relaxed">
              Discover quality pre-owned products near you or list your unused items to earn extra cash securely.
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
              <p className="text-emerald-300 text-xs font-bold">Verified Registration</p>
              <p className="text-emerald-500/80 text-xs">Instant OTP verification via Email or Phone</p>
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
          {/* Visual Step Indicator */}
          <RegistrationProgress currentStep={1} />

          {/* Title Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Create your Vintage account
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm font-medium">
              Join the marketplace and buy or sell used products easily.
            </p>
          </div>

          {/* Registration Form */}
          <RegistrationForm
            onSubmit={handleRegistrationSubmit}
            isLoading={isLoading}
            serverErrors={serverErrors}
          />

          {/* Existing User Link */}
          <div className="text-center mt-6 pt-6 border-t border-stone-200">
            <p className="text-stone-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-700 hover:text-amber-800 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
