import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env'
import type { JwtPayload } from '../types/auth.types'

/**
 * Sign a short-lived access token (15 min).
 * Payload contains only sub (user id) and role — nothing sensitive.
 */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'vintage-marketplace',
  })
}

/**
 * Verify and decode an access token.
 * Throws jwt.JsonWebTokenError or jwt.TokenExpiredError on failure.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'vintage-marketplace',
  }) as JwtPayload
}

/**
 * Sign a long-lived refresh token (7 days).
 */
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'vintage-marketplace',
  })
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
    issuer: 'vintage-marketplace',
  }) as JwtPayload
}

/**
 * Generate a cryptographically secure opaque refresh token (64 bytes hex).
 * This is a random value; the actual payload is stored server-side.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex')
}

/**
 * Hash a refresh token with SHA-256 before storing it in the database.
 * We never store the raw refresh token value.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
