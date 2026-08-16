import { useRef, useEffect } from 'react'

interface OTPInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export function OTPInput({
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  function handleSingleDigitChange(index: number, rawInput: string) {
    if (disabled) return

    // If user pasted multi-digit in a single box
    const cleanDigits = rawInput.replace(/\D/g, '')
    if (cleanDigits.length >= 6) {
      const pastedDigits = cleanDigits.slice(0, 6).split('')
      onChange(pastedDigits)
      inputRefs.current[5]?.focus()
      return
    }

    const singleDigit = cleanDigits.slice(-1)
    const newOtp = [...value]
    newOtp[index] = singleDigit
    onChange(newOtp)

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return

    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move focus back and clear previous input
        const newOtp = [...value]
        newOtp[index - 1] = ''
        onChange(newOtp)
        inputRefs.current[index - 1]?.focus()
      } else if (value[index]) {
        // Clear current input
        const newOtp = [...value]
        newOtp[index] = ''
        onChange(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    if (disabled) return
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length > 0) {
      const padded = pastedData.padEnd(6, '').slice(0, 6).split('')
      onChange(padded)
      const nextFocusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextFocusIndex]?.focus()
    }
  }

  return (
    <div className="w-full" onPaste={handlePaste}>
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {Array.from({ length: 6 }).map((_, index) => {
          const digit = value[index] || ''
          return (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              id={`otp-digit-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              disabled={disabled}
              value={digit}
              onChange={(e) => handleSingleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Digit ${index + 1} of 6 verification code`}
              className={`w-11 h-13 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-extrabold rounded-2xl border-2 transition-all duration-150 focus:outline-none ${
                disabled ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed' : ''
              } ${
                error
                  ? 'border-red-400 bg-red-50/50 text-red-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                  : digit
                    ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/20'
                    : 'border-stone-200 bg-white text-stone-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
