import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js'

/**
 * Validate email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validate Ethiopian phone number using libphonenumber-js.
 * Accepts: 0912345678, 0712345678, 251912345678, +251912345678
 */
export function isValidEthiopianPhone(phone: string): boolean {
  if (!phone) return false
  let target = phone.trim()
  if (/^251[79]\d{8}$/.test(target)) {
    target = `+${target}`
  }
  try {
    return isValidPhoneNumber(target, 'ET')
  } catch {
    return false
  }
}

/**
 * Format phone number into readable display style using libphonenumber-js.
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return ''
  let target = phone.trim()
  if (/^251[79]\d{8}$/.test(target)) {
    target = `+${target}`
  }
  try {
    const parsed = parsePhoneNumber(target, 'ET')
    if (parsed) {
      return parsed.formatInternational()
    }
  } catch {
    // Fall back to raw string
  }
  return phone
}

/**
 * Validate password strength (min 8 chars, uppercase, lowercase, number).
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('At least one number')
  return { valid: errors.length === 0, errors }
}
