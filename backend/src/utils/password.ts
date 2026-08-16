import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a plaintext password using bcrypt.
 * Cost factor 12 is a solid production choice (~300ms on modern hardware).
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * Uses bcrypt's constant-time comparison to prevent timing attacks.
 */
export async function comparePassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
