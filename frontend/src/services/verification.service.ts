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
