import type { Request, Response, NextFunction } from 'express'
import type { UserRole } from '../types/auth.types'
import { SellerProfile, User } from '../models'

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

/**
 * Shorthand middleware requiring ADMIN platform role.
 */
export const requireAdmin = authorizeRoles('ADMIN')

/**
 * Middleware requiring the authenticated user to have an active SellerProfile.
 */
export async function requireSeller(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' })
    return
  }

  try {
    const profile = await SellerProfile.findOne({
      where: { user_id: req.user.id, is_active: true },
    })

    if (!profile) {
      res.status(403).json({
        success: false,
        code: 'SELLER_PROFILE_REQUIRED',
        message: 'A seller profile is required to perform this action. Please complete seller onboarding.',
      })
      return
    }

    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Middleware requiring the authenticated user to have at least verified email or phone.
 */
export async function requireVerifiedUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' })
    return
  }

  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'is_email_verified', 'is_phone_verified', 'status'],
    })

    if (!user || user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'User account is not active.' })
      return
    }

    if (!user.is_email_verified && !user.is_phone_verified) {
      res.status(403).json({
        success: false,
        code: 'VERIFICATION_REQUIRED',
        message: 'Please verify your email or phone number to access this feature.',
      })
      return
    }

    next()
  } catch (err) {
    next(err)
  }
}
