import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import jwt from 'jsonwebtoken'

/**
 * Require a valid JWT access token.
 *
 * Reads the token from the Authorization header (Bearer scheme).
 * On success, attaches { id, role } to req.user.
 * On failure, returns 401 — never exposes JWT internals.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required.' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Session expired. Please log in again.' })
      return
    }
    res.status(401).json({ success: false, message: 'Invalid authentication token.' })
  }
}

/**
 * Optionally read a JWT access token.
 * If provided and valid, attaches { id, role } to req.user.
 * If absent or invalid, proceeds without failing.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role }
  } catch {
    // Silently ignore invalid/expired tokens for optional auth
  }

  next()
}
