import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ChangeMethodInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../types/auth.types'

/**
 * Helper to set secure refresh token cookie.
 */
function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
 * Verify OTP → create real User → return access token & set refresh cookie.
 */
export async function verifyRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as VerifyOtpInput
    const result = await authService.verifyRegistration(input)

    if (result.refreshToken) {
      setRefreshTokenCookie(res, result.refreshToken)
    }

    res.status(200).json({
      success: true,
      message: 'Account verified successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
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

    if (result.refreshToken) {
      setRefreshTokenCookie(res, result.refreshToken)
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/refresh
 * Read refresh token from HttpOnly cookie and issue a fresh access token.
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    const result = await authService.refreshSession(token)

    if (result.refreshToken) {
      setRefreshTokenCookie(res, result.refreshToken)
    }

    res.status(200).json({
      success: true,
      message: 'Session refreshed.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/forgot-password
 * Send password reset code via email or SMS.
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as ForgotPasswordInput
    const result = await authService.forgotPassword(input)

    res.status(200).json({
      success: true,
      message: 'Password reset code has been sent.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/reset-password
 * Verify OTP and reset password.
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as ResetPasswordInput
    const result = await authService.resetPassword(input)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/change-password
 * Change password for authenticated user.
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const input = req.body as ChangePasswordInput
    const result = await authService.changePassword(userId, input)

    res.status(200).json({
      success: true,
      message: result.message,
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  })

  res.status(200).json({ success: true, message: 'Logged out successfully.' })
}
