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
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border transition-all duration-200 ${
        isPopular
          ? 'bg-stone-900 border-amber-500 shadow-2xl shadow-amber-500/10 scale-105'
          : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <span className="text-xs text-stone-400 bg-stone-800 px-2.5 py-1 rounded-full capitalize">
            {plan.billingCycle.toLowerCase()}
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-amber-500">
            {plan.price === 0 ? '0' : plan.price.toLocaleString()}
          </span>
          <span className="text-stone-400 text-sm font-medium">ETB</span>
          {plan.billingCycle !== 'ONE_TIME' && (
            <span className="text-stone-500 text-xs ml-1">/ month</span>
          )}
        </div>

        <p className="text-xs text-stone-400 mt-2">
          {plan.durationDays > 0 ? `Duration: ${plan.durationDays} Days` : 'Ongoing Plan'}
        </p>

        {/* Feature List */}
        <div className="mt-6 pt-6 border-t border-stone-800 space-y-3">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-sm text-stone-300">
              <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-800">
        {isCurrent ? (
          <button
            disabled
            className="w-full py-3 px-4 bg-stone-800 text-stone-400 font-semibold rounded-xl text-sm cursor-default"
          >
            Current Plan
          </button>
        ) : (
          <button
            onClick={() => onSelect(plan)}
            className={`w-full py-3 px-4 font-semibold rounded-xl text-sm transition shadow-lg ${
              isPopular
                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 shadow-amber-500/20'
                : 'bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-white'
            }`}
          >
            Choose {plan.name}
          </button>
        )}
      </div>
    </div>
  )
}
