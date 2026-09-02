import { Check, Sparkles, Building2, Crown, Zap, ShieldCheck } from 'lucide-react'
import type { Plan } from '../../types/monetization'

interface PlanCardProps {
  plan: Plan
  isCurrent?: boolean
  isPopular?: boolean
  onSelect: (plan: Plan) => void
}

export function PlanCard({ plan, isCurrent, isPopular, onSelect }: PlanCardProps) {
  const isBusiness = plan.type === 'BUSINESS'

  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all duration-500 ${
        isBusiness
          ? 'bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white border border-amber-500/30 shadow-2xl shadow-stone-950/40 hover:border-amber-400 hover:-translate-y-1'
          : isPopular
          ? 'bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-500 shadow-xl shadow-amber-500/15 sm:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20'
          : 'bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md hover:-translate-y-1'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white font-black text-[11px] uppercase tracking-wider py-1 px-4 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Most Popular</span>
        </div>
      )}

      {isBusiness && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-stone-950 font-black text-[11px] uppercase tracking-wider py-1 px-4 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5" />
          <span>Storefront Pro</span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isBusiness
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : isPopular
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {isBusiness ? (
                <Building2 className="w-5 h-5" />
              ) : isPopular ? (
                <Zap className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <h3
              className={`text-xl font-black tracking-tight ${
                isBusiness ? 'text-white' : 'text-stone-900'
              }`}
            >
              {plan.name}
            </h3>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
              isBusiness
                ? 'bg-stone-800 text-amber-300 border border-amber-400/20'
                : 'text-stone-600 bg-stone-100'
            }`}
          >
            {plan.billingCycle.toLowerCase()}
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-1.5">
          <span
            className={`text-4xl sm:text-5xl font-black tracking-tight ${
              isBusiness
                ? 'text-amber-400'
                : isPopular
                ? 'text-amber-700'
                : 'text-stone-900'
            }`}
          >
            {plan.price === 0 ? '0' : plan.price.toLocaleString()}
          </span>
          <span
            className={`text-sm font-extrabold ${
              isBusiness ? 'text-stone-300' : 'text-stone-500'
            }`}
          >
            ETB
          </span>
          {plan.billingCycle !== 'ONE_TIME' && (
            <span
              className={`text-xs font-semibold ml-1 ${
                isBusiness ? 'text-stone-400' : 'text-stone-400'
              }`}
            >
              / month
            </span>
          )}
        </div>

        <p
          className={`text-xs font-medium mt-2 flex items-center gap-1.5 ${
            isBusiness ? 'text-stone-400' : 'text-stone-500'
          }`}
        >
          <span>Duration: {plan.durationDays > 0 ? `${plan.durationDays} Days` : '30 Days'}</span>
          <span>•</span>
          <span>Instant Chapa Activation</span>
        </p>

        {/* Feature List */}
        <div
          className={`mt-6 pt-6 border-t space-y-3.5 ${
            isBusiness ? 'border-stone-800' : 'border-stone-100'
          }`}
        >
          {plan.features.map((feature, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 text-xs sm:text-sm font-medium ${
                isBusiness ? 'text-stone-200' : 'text-stone-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isBusiness
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isPopular
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`mt-8 pt-6 border-t ${
          isBusiness ? 'border-stone-800' : 'border-stone-100'
        }`}
      >
        {isCurrent ? (
          <button
            disabled
            className="w-full py-3.5 px-4 bg-stone-100 text-stone-400 font-bold rounded-2xl text-xs sm:text-sm cursor-default"
          >
            Current Active Plan
          </button>
        ) : (
          <button
            onClick={() => onSelect(plan)}
            className={`w-full py-3.5 px-5 font-black rounded-2xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isBusiness
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 hover:brightness-110 active:scale-98 shadow-lg shadow-amber-500/25'
                : isPopular
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white active:scale-98 shadow-lg shadow-amber-600/30'
                : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-98 shadow-md'
            }`}
          >
            <span>Choose {plan.name}</span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

