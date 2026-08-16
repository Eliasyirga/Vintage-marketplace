export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
export type VerificationMethod = 'EMAIL' | 'PHONE'

export interface User {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isFaydaVerified: boolean
  isFaceVerified: boolean
  avatarUrl: string | null
  createdAt: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  verificationMethod: VerificationMethod
}

export interface LoginFormData {
  identifier: string
  password: string
}

export interface PendingRegistrationData {
  registrationId: string
  maskedDestination: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}
