import type { Request, Response, NextFunction } from 'express'
import * as verificationService from '../services/verification.service'
import type { VerificationType } from '../models/UserVerification'

export async function getMyVerifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const verifications = await verificationService.getUserVerifications(userId)
    res.json({ success: true, data: { verifications } })
  } catch (err) {
    next(err)
  }
}

export async function requestVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const { verificationType } = req.body

    if (!verificationType) {
      res.status(400).json({ success: false, message: 'verificationType is required.' })
      return
    }

    const verification = await verificationService.requestVerification(
      userId,
      verificationType as VerificationType,
      req.body.documentReference,
    )

    res.status(201).json({
      success: true,
      message: 'Verification request submitted. Our team will review it.',
      data: { verification },
    })
  } catch (err) {
    next(err)
  }
}
