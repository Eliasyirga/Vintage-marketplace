import { Check } from 'lucide-react'

export type RegistrationStep = 1 | 2 | 3

interface RegistrationProgressProps {
  currentStep: RegistrationStep
}

const STEPS = [
  { step: 1, label: 'Account', description: 'Basic details' },
  { step: 2, label: 'Verify', description: 'OTP code' },
  { step: 3, label: 'Complete', description: 'Ready to buy/sell' },
] as const

export function RegistrationProgress({ currentStep }: RegistrationProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
        />

        {STEPS.map(({ step, label }) => {
          const isDone = currentStep > step
          const isCurrent = currentStep === step

          return (
            <div key={step} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  isDone
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : isCurrent
                      ? 'bg-stone-900 text-amber-400 ring-4 ring-amber-500/20 shadow-lg'
                      : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="w-4 h-4 text-white stroke-[3]" /> : step}
              </div>
              <span
                className={`mt-2 text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'text-stone-900 font-extrabold'
                    : isDone
                      ? 'text-amber-700'
                      : 'text-stone-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
