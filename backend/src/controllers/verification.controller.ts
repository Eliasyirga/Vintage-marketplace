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

export async function initiateFayda(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const result = await verificationService.initiateFaydaVerification(userId)
    res.json({
      success: true,
      message: 'Fayda verification session initiated.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function faydaCallback(req: Request, res: Response, _next: NextFunction) {
  const { code, state, error, error_description } = req.query
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  if (error) {
    const reason = encodeURIComponent(String(error_description || error))
    res.redirect(`${clientUrl}/account/fayda/callback?faydaVerified=false&error=${reason}`)
    return
  }

  if (!code || !state) {
    res.redirect(`${clientUrl}/account/fayda/callback?faydaVerified=false&error=Missing+authorization+code+or+state`)
    return
  }

  try {
    await verificationService.completeFaydaVerification(String(state), String(code))
    res.redirect(`${clientUrl}/account/fayda/callback?faydaVerified=true`)
  } catch (err: any) {
    const reason = encodeURIComponent(err.message || 'Verification failed')
    res.redirect(`${clientUrl}/account/fayda/callback?faydaVerified=false&error=${reason}`)
  }
}
