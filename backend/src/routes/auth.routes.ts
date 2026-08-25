import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { requireAuth } from '../middleware/auth.middleware'
import {
  registerLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  loginLimiter,
  refreshLimiter,
} from '../middleware/rateLimit.middleware'
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  changeMethodSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../schemas/auth.schema'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────────────────

router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register,
)

router.post(
  '/verify-registration',
  verifyOtpLimiter,
  validate(verifyOtpSchema),
  authController.verifyRegistration,
)

router.post(
  '/resend-registration-otp',
  resendOtpLimiter,
  validate(resendOtpSchema),
  authController.resendRegistrationOtp,
)

router.post(
  '/change-registration-method',
  resendOtpLimiter,
  validate(changeMethodSchema),
  authController.changeVerificationMethod,
)

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.login,
)

router.post(
  '/refresh',
  refreshLimiter,
  authController.refreshToken,
)

router.post(
  '/forgot-password',
  verifyOtpLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
)

router.post(
  '/reset-password',
  verifyOtpLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
)

router.post('/logout', authController.logout)

// ── Protected routes ──────────────────────────────────────────────────────────

router.get('/me', requireAuth, authController.me)

router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword,
)

export default router
