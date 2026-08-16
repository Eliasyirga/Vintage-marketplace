import parsePhoneNumber, { isValidPhoneNumber, CountryCode } from 'libphonenumber-js'

const DEFAULT_COUNTRY: CountryCode = 'ET'

export interface PhoneValidationResult {
  isValid: boolean
  e164: string | null
  error?: string
}

/**
 * Validate and normalize a phone number using libphonenumber-js.
 * Supports Ethiopian phone numbers (09..., 07..., 2519..., +2519...).
 * Returns normalized E.164 string (+251XXXXXXXXX).
 */
export function validateAndNormalizePhone(
  rawPhone: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY,
): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, e164: null, error: 'Phone number is required.' }
  }

  const trimmed = rawPhone.trim()
  
  // Prep environment if standard Ethiopian 251 without '+' prefix is passed
  let target = trimmed
  if (/^251[79]\d{8}$/.test(target)) {
    target = `+${target}`
  }

  try {
    const phoneNumber = parsePhoneNumber(target, defaultCountry)
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        isValid: true,
        e164: phoneNumber.format('E.164'),
      }
    }
  } catch {
    // Falls through to return invalid
  }

  return {
    isValid: false,
    e164: null,
    error: 'Please enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678).',
  }
}

/**
 * Helper to get normalized E.164 phone string or throw an error.
 */
export function normalizePhoneOrThrow(rawPhone: string, defaultCountry: CountryCode = DEFAULT_COUNTRY): string {
  const result = validateAndNormalizePhone(rawPhone, defaultCountry)
  if (!result.isValid || !result.e164) {
    throw Object.assign(new Error(result.error || 'Invalid phone number format.'), { statusCode: 400 })
  }
  return result.e164
}
