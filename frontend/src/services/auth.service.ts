import api from './api'
import type {
  RegisterFormData,
  LoginFormData,
  PendingRegistrationData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthResponse,
  ApiResponse,
  User,
  VerificationMethod,
} from '../types/auth'

export async function register(
  data: RegisterFormData,
): Promise<ApiResponse<PendingRegistrationData>> {
  const response = await api.post<ApiResponse<PendingRegistrationData>>('/auth/register', data)
  return response.data
}

export async function verifyRegistration(
  registrationId: string,
  otp: string,
): Promise<ApiResponse<AuthResponse>> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/verify-registration', {
    registrationId,
    otp,
  })
  return response.data
}

export async function resendOtp(
  registrationId: string,
): Promise<ApiResponse<{ maskedDestination: string; cooldownSeconds: number }>> {
  const response = await api.post('/auth/resend-registration-otp', { registrationId })
  return response.data
}

export async function changeVerificationMethod(data: {
  registrationId: string
  verificationMethod: VerificationMethod
  email?: string
  phone?: string
}): Promise<ApiResponse<PendingRegistrationData>> {
  const response = await api.post<ApiResponse<PendingRegistrationData>>(
    '/auth/change-registration-method',
    data,
  )
  return response.data
}

export async function login(
  data: LoginFormData,
): Promise<ApiResponse<AuthResponse>> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
  return response.data
}

export async function forgotPassword(
  data: ForgotPasswordData,
): Promise<ApiResponse<{ resetId: string; maskedDestination: string }>> {
  const response = await api.post<ApiResponse<{ resetId: string; maskedDestination: string }>>(
    '/auth/forgot-password',
    data,
  )
  return response.data
}

export async function resetPassword(
  data: ResetPasswordData,
): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/auth/reset-password', data)
  return response.data
}

export async function changePassword(
  data: ChangePasswordData,
): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/auth/change-password', data)
  return response.data
}

export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  const response = await api.get<ApiResponse<{ user: User }>>('/auth/me')
  return response.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

