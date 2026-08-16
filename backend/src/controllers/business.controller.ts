import type { Request, Response, NextFunction } from 'express'
import * as businessService from '../services/business.service'

export async function getMyBusinessProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const profile = await businessService.getBusinessProfile(userId)
    const limits = await businessService.getSellerListingLimit(userId)

    res.json({
      success: true,
      data: {
        profile: profile ? profile.toSafeObject() : null,
        limits,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function updateMyBusinessProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const {
      businessName,
      description,
      logo,
      businessPhone,
      businessEmail,
      address,
      city,
      businessCategory,
      tinNumber,
    } = req.body

    if (!businessName) {
      res.status(400).json({ success: false, message: 'Business name is required.' })
      return
    }

    const profile = await businessService.upsertBusinessProfile(userId, {
      businessName,
      description,
      logo,
      businessPhone,
      businessEmail,
      address,
      city,
      businessCategory,
      tinNumber,
    })

    res.json({
      success: true,
      message: 'Business profile updated successfully.',
      data: profile.toSafeObject(),
    })
  } catch (err) {
    next(err)
  }
}
