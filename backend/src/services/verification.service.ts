import { UserVerification } from '../models'
import type { VerificationType, VerificationStatus } from '../models/UserVerification'
import { AppError } from '../middleware/error.middleware'

/**
 * Get all verifications for a user (safe fields only — no document_reference).
 */
export async function getUserVerifications(userId: string) {
  const verifications = await UserVerification.findAll({
    where: { user_id: userId },
    attributes: ['id', 'user_id', 'verification_type', 'status', 'verified_at', 'rejection_reason', 'created_at', 'updated_at'],
    order: [['created_at', 'ASC']],
  })
  return verifications.map((v) => v.toSafeObject())
}

/**
 * Request a verification (creates PENDING entry if none exists).
 * For EMAIL/PHONE, these should be handled by the auth system.
 * For NATIONAL_ID/FACE, this creates a pending request for admin to review.
 *
 * document_reference: a safe storage path for any supporting document (NOT raw ID numbers).
 * In production this would be an encrypted S3 key.
 */
export async function requestVerification(
  userId: string,
  verificationType: VerificationType,
  documentReference?: string,
) {
  const allowedTypes: VerificationType[] = ['EMAIL', 'PHONE', 'NATIONAL_ID', 'FACE']
  if (!allowedTypes.includes(verificationType)) {
    throw new AppError('Invalid verification type.', 400)
  }

  // Check if already exists
  const existing = await UserVerification.findOne({
    where: { user_id: userId, verification_type: verificationType },
  })

  if (existing) {
    if (existing.status === 'VERIFIED') {
      throw new AppError('You are already verified for this type.', 409)
    }
    if (existing.status === 'PENDING') {
      throw new AppError('Your verification request is already pending.', 409)
    }
    // REJECTED or UNVERIFIED — allow re-request
    existing.status = 'PENDING'
    existing.rejection_reason = null
    existing.verified_at = null
    if (documentReference) existing.document_reference = documentReference
    await existing.save()
    return existing.toSafeObject()
  }

  const verification = await UserVerification.create({
    user_id: userId,
    verification_type: verificationType,
    status: 'PENDING',
    document_reference: documentReference || null,
  })

  return verification.toSafeObject()
}

/**
 * Admin: get all pending verifications.
 */
export async function getPendingVerifications(filters: { page?: number; limit?: number; status?: VerificationStatus }) {
  const { User } = await import('../models')
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(50, filters.limit ?? 20)
  const offset = (page - 1) * limit

  const where: any = {}
  if (filters.status) where.status = filters.status
  else where.status = 'PENDING'

  const { count, rows } = await UserVerification.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'status'],
      },
    ],
    // Never return document_reference in list view
    attributes: ['id', 'user_id', 'verification_type', 'status', 'verified_at', 'rejection_reason', 'created_at', 'updated_at'],
    order: [['created_at', 'ASC']],
    limit,
    offset,
  })

  return {
    verifications: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      limit,
    },
  }
}

/**
 * Admin: approve a verification.
 * Updates status to VERIFIED and sets verified_at + verified_by.
 * NEVER exposes document_reference.
 */
export async function approveVerification(verificationId: string, adminId: string) {
  const verification = await UserVerification.findByPk(verificationId)
  if (!verification) throw new AppError('Verification record not found.', 404)
  if (verification.status === 'VERIFIED') throw new AppError('Already verified.', 409)

  verification.status = 'VERIFIED'
  verification.verified_at = new Date()
  verification.verified_by = adminId
  verification.rejection_reason = null
  await verification.save()

  return verification.toSafeObject()
}

/**
 * Admin: reject a verification with a reason.
 */
export async function rejectVerification(verificationId: string, adminId: string, reason: string) {
  if (!reason?.trim()) throw new AppError('Rejection reason is required.', 400)

  const verification = await UserVerification.findByPk(verificationId)
  if (!verification) throw new AppError('Verification record not found.', 404)

  verification.status = 'REJECTED'
  verification.rejection_reason = reason.trim()
  verification.verified_by = adminId
  await verification.save()

  return verification.toSafeObject()
}
