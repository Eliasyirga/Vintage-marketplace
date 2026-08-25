export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
export type VerificationMethod = 'EMAIL' | 'PHONE'

/**
 * Safe user object returned in API responses.
 * Never includes: password_hash, OTP, raw tokens, or internal DB fields.
 */
export interface SafeUser {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isFaydaVerified: boolean
  avatarUrl: string | null
  lastLoginAt: Date | null
  createdAt: Date
}

export interface RegisterInput {
  fullName: string
  email?: string
  phone?: string
  password: string
  confirmPassword: string
  verificationMethod: VerificationMethod
}

export interface LoginInput {
  identifier: string // email or phone
  password: string
}

export interface VerifyOtpInput {
  registrationId: string
  otp: string
}

export interface ResendOtpInput {
  registrationId: string
}

export interface ChangeMethodInput {
  registrationId: string
  verificationMethod: VerificationMethod
  email?: string
  phone?: string
}

export interface JwtPayload {
  sub: string   // user UUID
  role: UserRole
  iat?: number
  exp?: number
}

export interface ForgotPasswordInput {
  identifier: string
}

export interface ResetPasswordInput {
  resetId: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordResult {
  resetId: string
  maskedDestination: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthResponse {
  user: SafeUser
  accessToken: string
  refreshToken?: string
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: UserRole
      }
    }
  }
}
