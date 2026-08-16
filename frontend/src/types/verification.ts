export type VerificationType = 'EMAIL' | 'PHONE' | 'NATIONAL_ID' | 'FACE'
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface UserVerificationItem {
  id: string
  userId: string
  verificationType: VerificationType
  status: VerificationStatus
  verifiedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    status: string
  }
}
