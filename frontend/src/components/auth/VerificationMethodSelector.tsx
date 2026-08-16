import { Mail, Phone } from 'lucide-react'
import type { VerificationMethod } from '../../types/auth'

interface VerificationMethodSelectorProps {
  selectedMethod: VerificationMethod
  onChange: (method: VerificationMethod) => void
  disabled?: boolean
}

export function VerificationMethodSelector({
  selectedMethod,
  onChange,
  disabled = false,
}: VerificationMethodSelectorProps) {
  return (
    <div className="w-full mb-6">
      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
        Verification Method
      </label>
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/80">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('EMAIL')}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
            selectedMethod === 'EMAIL'
              ? 'bg-white text-amber-900 shadow-md border border-amber-200/70 shadow-amber-950/5 ring-1 ring-black/5'
              : 'text-stone-500 hover:text-stone-800 hover:bg-white/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Mail className={`w-4 h-4 ${selectedMethod === 'EMAIL' ? 'text-amber-600' : 'text-stone-400'}`} />
          <span>Email</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('PHONE')}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
            selectedMethod === 'PHONE'
              ? 'bg-white text-amber-900 shadow-md border border-amber-200/70 shadow-amber-950/5 ring-1 ring-black/5'
              : 'text-stone-500 hover:text-stone-800 hover:bg-white/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Phone className={`w-4 h-4 ${selectedMethod === 'PHONE' ? 'text-amber-600' : 'text-stone-400'}`} />
          <span>Phone Number</span>
        </button>
      </div>
    </div>
  )
}
