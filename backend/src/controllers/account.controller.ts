import type { Request, Response, NextFunction } from 'express'
import * as accountService from '../services/account.service'

/**
 * GET /api/account/overview
 * Returns unified overview stats for buyer, seller, listings, orders, and verifications.
 */
export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const data = await accountService.getAccountOverview(userId)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/account/profile
 * Updates basic account profile (full name, avatar).
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const { fullName, avatarUrl } = req.body
    const updatedUser = await accountService.updateAccountProfile(userId, { fullName, avatarUrl })
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/account/avatar
 * Uploads an avatar image to Cloudinary (vintage-marketplace/profiles/{userId})
 */
export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const file = req.file as Express.Multer.File | undefined
    if (!file) {
      res.status(400).json({ success: false, message: 'Please select an avatar image to upload.' })
      return
    }

    const result = await accountService.uploadAvatar(userId, file)
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/account/avatar
 * Removes the user's avatar image
 */
export async function removeAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const result = await accountService.removeAvatar(userId)
    res.status(200).json({
      success: true,
      message: result.message,
      data: { user: result.user },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/account/deactivate
 * Soft-deactivates the account while preserving transactions for legal compliance.
 */
export async function deactivateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const result = await accountService.deactivateAccount(userId)

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    res.status(200).json({ success: true, message: result.message })
  } catch (err) {
    next(err)
  }
}
