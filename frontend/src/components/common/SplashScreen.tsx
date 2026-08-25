import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

interface SplashScreenProps {
  /** Triggered when the splash screen is transitioning out into the application */
  isExiting?: boolean
  /** Error state if startup initialization failed */
  error?: string | null
  /** Retry callback if initialization failed */
  onRetry?: () => void
}

export function SplashScreen({
  isExiting = false,
  error = null,
  onRetry,
}: SplashScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={error ? 'Application startup error' : 'Loading Vintage Marketplace'}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-stone-50 px-4 text-stone-900 transition-all duration-300 ease-out select-none ${
        isExiting
          ? 'opacity-0 scale-[0.98] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient radial glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-300/25 via-amber-400/20 to-transparent blur-3xl pointer-events-none splash-ambient-glow" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full mx-auto">
        {/* ── Brand Logo ── */}
        <div className="splash-scale-in flex items-center justify-center mb-5">
          <div className="relative">
            {/* Outer soft glow ring */}
            <div className="absolute -inset-2 rounded-2xl bg-amber-500/20 blur-md" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── Brand Wordmark ── */}
        <div className="splash-fade-up-1 space-y-1 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Vintage
            <span className="text-amber-600 ml-1.5 font-black">Marketplace</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-amber-700/90 tracking-wide uppercase">
            Buy • Sell • Discover
          </p>
        </div>

        {/* ── Secondary Subtitle / Tagline ── */}
        <div className="splash-fade-up-2 mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200/80 text-[11px] font-bold text-amber-900 tracking-wider">
            Make Bonda Digital
          </span>
        </div>

        {/* ── Interactive State: Error or Modern Dots Loader ── */}
        {error ? (
          <div className="splash-fade-up-3 w-full bg-white border border-red-200 rounded-2xl p-5 shadow-lg shadow-red-500/5 space-y-3">
            <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Something went wrong</span>
            </div>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              We couldn't initialize Vintage Marketplace. Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : (
          <div className="splash-fade-up-3 flex flex-col items-center space-y-3" aria-hidden="true">
            {/* 3-Dot Brand Loader */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 splash-dot-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 splash-dot-2" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 splash-dot-3" />
            </div>
            <span className="text-[11px] font-semibold text-stone-400 tracking-wider">
              Starting marketplace...
            </span>
          </div>
        )}
      </div>

      {/* ── Subtle Bottom Footer ── */}
      <div className="absolute bottom-6 text-center text-[10px] text-stone-400 font-semibold tracking-wider uppercase">
        Ethiopia's Trusted Digital Marketplace
      </div>
    </div>
  )
}

export default SplashScreen
