import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ChangeMethodInput,
} from '../types/auth.types'

/**
 * Helper to set secure refresh token cookie.
 */
function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

/**
 * POST /api/auth/register
 * Create a PendingRegistration and send OTP.
 * Never creates a real User record.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as RegisterInput
    const result = await authService.register(input)

    res.status(201).json({
      success: true,
      message: 'Verification code sent.',
      registrationId: result.registrationId,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/verify-registration
 * Verify OTP → create real User → return access token & session.
 */
export async function verifyRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as VerifyOtpInput
    const result = await authService.verifyRegistration(input)

    res.status(200).json({
      success: true,
      message: 'Account verified successfully.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/resend-registration-otp
 * Resend a new OTP (invalidates the previous one).
 */
export async function resendRegistrationOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as ResendOtpInput
    const result = await authService.resendOTP(input)

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/change-registration-method
 * Switch verification method (EMAIL ↔ PHONE) for a pending registration.
 */
export async function changeVerificationMethod(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as ChangeMethodInput
    const result = await authService.changeVerificationMethod(input)

    res.status(200).json({
      success: true,
      message: 'Verification method updated and new code sent.',
      registrationId: result.registrationId,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/login
 * Authenticate with email or phone + password.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as LoginInput
    const result = await authService.login(input)

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auth/me
 * Return the currently authenticated user's safe profile.
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const user = await authService.getCurrentUser(userId)

    res.status(200).json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/logout
 * Clear session cookies.
 */
export function logout(_req: Request, res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  res.status(200).json({ success: true, message: 'Logged out successfully.' })
}
