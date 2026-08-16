import { Link } from 'react-router-dom'
import { Megaphone, ArrowRight, TrendingUp, Sparkles } from 'lucide-react'
import type { AdPlacement } from '../../types/monetization'

interface AdvertisementCTAProps {
  placement: AdPlacement
  className?: string
}

export function AdvertisementCTA({ placement, className = '' }: AdvertisementCTAProps) {
  // ── Placement 1: HOME_TOP CTA ──────────────────────────────────────────────
  if (placement === 'HOME_TOP') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-stone-900/5 border border-amber-500/30 p-5 sm:p-6 lg:p-7 shadow-xs ${className}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Partner Opportunity</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Grow Your Business on Bonda
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xl">
                Put your brand in front of thousands of active buyers looking for electronics, vintage items, and fashion across Ethiopia.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              to="/advertise"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-amber-600 text-white font-black text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Advertise on Bonda</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Placement 2: MARKETPLACE_MIDDLE CTA (In-Feed Card) ──────────────────────
  if (placement === 'MARKETPLACE_MIDDLE') {
    return (
      <div
        className={`rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100/30 border-2 border-dashed border-amber-300 p-6 flex flex-col justify-between shadow-2xs hover:border-amber-400 transition-colors ${className}`}
      >
        <div className="space-y-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs mx-auto sm:mx-0">
            <TrendingUp className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Sponsored Slot Available
            </span>
            <h4 className="text-base font-black text-stone-900 leading-snug">
              Promote Your Shop Here
            </h4>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Reach motivated shoppers while they browse Ethiopian marketplace listings.
            </p>
          </div>
        </div>

        <div className="pt-4 mt-3 border-t border-amber-200/60">
          <Link
            to="/advertise"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            <span>Reserve This Spot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  // ── Placement 3: MARKETPLACE_BOTTOM CTA ────────────────────────────────────
  return (
    <div
      className={`rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 text-white p-6 sm:p-7 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-black text-white">
              Reach Bonda Buyers Across Ethiopia
            </h4>
            <p className="text-xs sm:text-sm text-stone-400 max-w-lg font-medium">
              Start with flexible 3, 7, or 30-day sponsored placements and track your live click-through performance.
            </p>
          </div>
        </div>

        <Link
          to="/advertise"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-transform duration-200 hover:scale-105 active:scale-95 shadow-md"
        >
          <span>Advertise Your Business</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
