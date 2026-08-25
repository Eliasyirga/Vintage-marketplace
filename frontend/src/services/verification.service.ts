import api from './api'
import type { UserVerificationItem, VerificationType } from '../types/verification'

export async function getMyVerifications(): Promise<UserVerificationItem[]> {
  const response = await api.get('/verifications/me')
  return response.data.data.verifications
}

export async function requestVerification(
  verificationType: VerificationType,
  documentReference?: string,
): Promise<UserVerificationItem> {
  const response = await api.post('/verifications/request', {
    verificationType,
    documentReference,
  })
  return response.data.data.verification
}

/**
 * Initiate Fayda OIDC verification.
 * Returns { redirectUrl } where the user's browser should be redirected.
 */
export async function initiateFaydaVerification(): Promise<{ redirectUrl: string }> {
  const response = await api.post<{ success: boolean; data: { redirectUrl: string } }>(
    '/verifications/fayda/initiate',
  )
  return response.data.data
}
