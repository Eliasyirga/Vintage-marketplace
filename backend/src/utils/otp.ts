import crypto from 'crypto'

const OTP_EXPIRY_MINUTES = 5

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses crypto.randomInt which is CSPRNG-backed — never Math.random().
 * Range: 100000–999999 (always exactly 6 digits, no leading zeros).
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

/**
 * Hash an OTP using SHA-256.
 * We only ever store the hash — the plaintext OTP is sent to the user
 * and immediately discarded from server memory.
 */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

/**
 * Verify a submitted OTP against its stored SHA-256 hash.
 * Uses timingSafeEqual to prevent timing-based side-channel attacks.
 */
export function verifyOTP(submittedOtp: string, storedHash: string): boolean {
  const submittedHash = hashOTP(submittedOtp)
  // Both must be equal length for timingSafeEqual
  if (submittedHash.length !== storedHash.length) return false
  return crypto.timingSafeEqual(
    Buffer.from(submittedHash),
    Buffer.from(storedHash),
  )
}

/**
 * Compute OTP expiry timestamp (now + 5 minutes).
 */
export function otpExpiresAt(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

/**
 * Check whether an OTP expiry timestamp has passed.
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}
