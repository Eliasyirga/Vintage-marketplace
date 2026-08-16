import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { CONDITION_LABELS, type ListingCondition } from '../../types/listing'

interface ConditionSelectorProps {
  value: ListingCondition
  onChange: (condition: ListingCondition) => void
  error?: string
}

const CONDITIONS: ListingCondition[] = [
  'BRAND_NEW',
  'LIKE_NEW',
  'LIGHTLY_USED',
  'FAIR',
  'HEAVILY_USED',
]

export function ConditionSelector({ value, onChange, error }: ConditionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-stone-800 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        Item Condition <span className="text-amber-600">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONDITIONS.map((condKey) => {
          const item = CONDITION_LABELS[condKey]
          const isSelected = value === condKey

          return (
            <button
              key={condKey}
              type="button"
              onClick={() => onChange(condKey)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div>
                <span className="text-sm font-bold text-stone-900 block">
                  {item.title}
                </span>
                <span className="text-xs text-stone-600 mt-1 block leading-relaxed">
                  {item.description}
                </span>
              </div>

              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${
                  isSelected
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-stone-300 bg-stone-100'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  )
}
