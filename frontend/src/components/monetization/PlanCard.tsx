import { Check } from 'lucide-react'
import type { Plan } from '../../types/monetization'

interface PlanCardProps {
  plan: Plan
  isCurrent?: boolean
  isPopular?: boolean
  onSelect: (plan: Plan) => void
}

export function PlanCard({ plan, isCurrent, isPopular, onSelect }: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
        isPopular
          ? 'bg-gradient-to-b from-amber-500/10 via-white to-white border-amber-500 shadow-xl shadow-amber-500/10 sm:-translate-y-1'
          : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[11px] uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
          Most Popular
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full capitalize">
            {plan.billingCycle.toLowerCase()}
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight">
            {plan.price === 0 ? '0' : plan.price.toLocaleString()}
          </span>
          <span className="text-stone-500 text-sm font-bold">ETB</span>
          {plan.billingCycle !== 'ONE_TIME' && (
            <span className="text-stone-400 text-xs font-medium ml-1">/ month</span>
          )}
        </div>

        <p className="text-xs text-stone-500 font-medium mt-2">
          {plan.durationDays > 0 ? `Duration: ${plan.durationDays} Days` : 'Ongoing Plan'}
        </p>

        {/* Feature List */}
        <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 font-medium">
              <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-100">
        {isCurrent ? (
          <button
            disabled
            className="w-full py-3 px-4 bg-stone-100 text-stone-400 font-bold rounded-xl text-xs sm:text-sm cursor-default"
          >
            Current Plan
          </button>
        ) : (
          <button
            onClick={() => onSelect(plan)}
            className={`w-full py-3 px-4 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs ${
              isPopular
                ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white'
            }`}
          >
            Choose {plan.name}
          </button>
        )}
      </div>
    </div>
  )
}
