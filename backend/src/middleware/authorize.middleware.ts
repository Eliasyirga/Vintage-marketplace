import type { Request, Response, NextFunction } from 'express'
import type { UserRole } from '../types/auth.types'

/**
 * Role-based authorization middleware factory.
 *
 * Must be used AFTER requireAuth (relies on req.user being set).
 *
 * Usage:
 *   router.get('/admin/users', requireAuth, authorizeRoles('ADMIN'), handler)
 *
 * A USER hitting an ADMIN endpoint receives 403 Forbidden.
 * This is backend-enforced — frontend role checks are UX-only.
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' })
      return
    }

    next()
  }
}
