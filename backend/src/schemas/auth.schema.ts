import { z } from 'zod'
import { validateAndNormalizePhone } from '../utils/phone'

// ─── Reusable field validators ────────────────────────────────────────────────

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address.')
  .max(320)
  .optional()
  .or(z.literal(''))

const phoneField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val) return true
      const res = validateAndNormalizePhone(val)
      return res.isValid
    },
    {
      message: 'Please enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678).',
    },
  )

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')

// ─── Registration ─────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(255),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
    verificationMethod: z.enum(['EMAIL', 'PHONE']),
  })
  .superRefine((data, ctx) => {
    // If EMAIL verification chosen, email must be present
    if (data.verificationMethod === 'EMAIL') {
      if (!data.email || data.email.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address.',
          path: ['email'],
        })
      }
    }

    // If PHONE verification chosen, phone must be present
    if (data.verificationMethod === 'PHONE') {
      if (!data.phone || data.phone.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid Ethiopian phone number.',
          path: ['phone'],
        })
      }
    }

    // Password confirmation
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      })
    }
  })

export type RegisterSchema = z.infer<typeof registerSchema>

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Please enter your email or phone number.')
    .max(320),
  password: z.string().min(1, 'Please enter your password.'),
})

export type LoginSchema = z.infer<typeof loginSchema>

// ─── OTP Verification ─────────────────────────────────────────────────────────

export const verifyOtpSchema = z.object({
  registrationId: z.string().uuid('Invalid registration ID.'),
  otp: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits.')
    .regex(/^\d{6}$/, 'Verification code must contain only digits.'),
})

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export const resendOtpSchema = z.object({
  registrationId: z.string().uuid('Invalid registration ID.'),
})

export type ResendOtpSchema = z.infer<typeof resendOtpSchema>

// ─── Change Verification Method ────────────────────────────────────────────────

export const changeMethodSchema = z
  .object({
    registrationId: z.string().uuid('Invalid registration ID.'),
    verificationMethod: z.enum(['EMAIL', 'PHONE']),
    email: emailField,
    phone: phoneField,
  })
  .superRefine((data, ctx) => {
    if (data.verificationMethod === 'EMAIL') {
      if (!data.email || data.email.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address.',
          path: ['email'],
        })
      }
    }
    if (data.verificationMethod === 'PHONE') {
      if (!data.phone || data.phone.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid Ethiopian phone number.',
          path: ['phone'],
        })
      }
    }
  })

export type ChangeMethodSchema = z.infer<typeof changeMethodSchema>

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Please enter your registered email or Ethiopian phone number.')
    .max(320),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    resetId: z.string().uuid('Invalid reset session ID.'),
    otp: z
      .string()
      .length(6, 'Verification code must be exactly 6 digits.')
      .regex(/^\d{6}$/, 'Verification code must contain only digits.'),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      })
    }
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

// ─── Change Password (Authenticated) ──────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      })
    }
  })

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
