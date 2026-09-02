import crypto from 'crypto'
import { Op } from 'sequelize'
import { sequelize } from '../config/database'
import { UserVerification, User } from '../models'
import type { VerificationType, VerificationStatus } from '../models/UserVerification'
import { AppError } from '../middleware/error.middleware'
import { env } from '../config/env'
import * as faydaProvider from './fayda/fayda.provider'

// ── Helpers ─────────────────────────────────────────────────────────────────

const FAYDA_STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function generateStateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ── User Verification Queries ────────────────────────────────────────────────

/**
 * Get all verifications for a user (safe fields only — no document_reference, no fayda tokens).
 */
export async function getUserVerifications(userId: string) {
  const verifications = await UserVerification.findAll({
    where: { user_id: userId },
    attributes: [
      'id', 'user_id', 'verification_type', 'status',
      'verified_at', 'rejection_reason', 'created_at', 'updated_at',
    ],
    order: [['created_at', 'ASC']],
  })
  return verifications.map((v) => v.toSafeObject())
}

/**
 * Request a verification (creates PENDING entry if none exists).
 * For EMAIL/PHONE, these should be handled by the auth system.
 * For NATIONAL_ID, this creates a pending request for admin to review.
 *
 * document_reference: a safe storage path for any supporting document (NOT raw ID numbers).
 * In production this would be an encrypted S3 key.
 */
export async function requestVerification(
  userId: string,
  verificationType: VerificationType,
  documentReference?: string,
) {
  const allowedTypes: VerificationType[] = ['EMAIL', 'PHONE', 'NATIONAL_ID', 'BUSINESS']
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

// ── Fayda OIDC Flow ──────────────────────────────────────────────────────────

/**
 * Step 1: Initiate a Fayda verification for the authenticated user.
 *
 * Creates/updates a UserVerification record with a secure random state token and expiry.
 * Returns the Fayda authorization URL to redirect the user's browser to.
 *
 * Security:
 * - State token is 32 random bytes (hex) — unique per attempt
 * - State expires in 10 minutes — prevents old states from being reused
 * - userId comes from req.user.id (JWT) — never from request body
 */
export async function initiateFaydaVerification(userId: string): Promise<{ redirectUrl: string }> {
  // Cannot start if already verified
  const existing = await UserVerification.findOne({
    where: { user_id: userId, verification_type: 'NATIONAL_ID' },
  })

  if (existing?.status === 'VERIFIED') {
    throw new AppError('Your identity is already Fayda verified.', 409)
  }

  const stateToken = generateStateToken()
  const stateExpiresAt = new Date(Date.now() + FAYDA_STATE_TTL_MS)

  if (existing) {
    // Update existing record with new state
    await existing.update({
      status: 'PENDING',
      fayda_state_token: stateToken,
      fayda_state_expires_at: stateExpiresAt,
      rejection_reason: null,
    })
  } else {
    await UserVerification.create({
      user_id: userId,
      verification_type: 'NATIONAL_ID',
      status: 'PENDING',
      fayda_state_token: stateToken,
      fayda_state_expires_at: stateExpiresAt,
      document_reference: null,
    })
  }

  const redirectUrl = faydaProvider.buildAuthorizationUrl(stateToken)
  return { redirectUrl }
}

/**
 * Step 2: Complete Fayda verification — called after provider callback.
 *
 * Security checks:
 * 1. State token is validated against the UserVerification record (anti-CSRF)
 * 2. State token expiry is checked
 * 3. State token is consumed (cleared) after use — prevents replay
 * 4. Authorization code is exchanged for tokens via the official Fayda endpoint
 * 5. ID token signature is verified using Fayda JWKS
 * 6. fayda_subject_hash uniqueness is checked across all accounts (duplicate prevention)
 * 7. User.is_fayda_verified is set in an atomic DB transaction
 *
 * IMPORTANT: The raw Fayda sub is never stored, logged, or returned to the frontend.
 */
export async function completeFaydaVerification(
  stateToken: string,
  code: string,
): Promise<{ success: boolean; userId: string }> {
  // Find the verification record by state token
  let verification = await UserVerification.findOne({
    where: {
      fayda_state_token: stateToken,
      verification_type: 'NATIONAL_ID',
      status: 'PENDING',
    },
  })

  // In sandbox / demo mode, allow fallback to latest pending verification
  if (!verification && env.FAYDA_SANDBOX_MODE) {
    verification = await UserVerification.findOne({
      where: {
        verification_type: 'NATIONAL_ID',
        status: 'PENDING',
      },
      order: [['created_at', 'DESC']],
    })
  }

  if (!verification) {
    throw new AppError('Invalid or unknown verification state. Please start verification again.', 400)
  }

  // Check state expiry
  if (
    !verification.fayda_state_expires_at ||
    new Date() > verification.fayda_state_expires_at
  ) {
    // Consume the token regardless (prevent replay)
    await verification.update({ fayda_state_token: null, fayda_state_expires_at: null, status: 'EXPIRED' })
    throw new AppError('Verification session expired. Please start verification again.', 410)
  }

  // Consume the state token immediately (prevent replay attacks)
  await verification.update({ fayda_state_token: null, fayda_state_expires_at: null })

  const userId = verification.user_id

  // Exchange authorization code for tokens (raw tokens never stored/logged)
  let tokenResult: Awaited<ReturnType<typeof faydaProvider.exchangeCodeForToken>>
  try {
    tokenResult = await faydaProvider.exchangeCodeForToken(code)
  } catch {
    await verification.update({ status: 'REJECTED', rejection_reason: 'Token exchange with Fayda failed.' })
    throw new AppError('Fayda token exchange failed. Please try again.', 502)
  }

  // Verify ID token and extract sub (raw sub is never stored or logged)
  let claims: Awaited<ReturnType<typeof faydaProvider.verifyIdTokenAndExtractSub>>
  try {
    claims = await faydaProvider.verifyIdTokenAndExtractSub(tokenResult.idToken, userId)
  } catch {
    await verification.update({ status: 'REJECTED', rejection_reason: 'ID token verification failed.' })
    throw new AppError('Fayda identity verification failed. Please try again.', 502)
  }

  // Hash the sub claim for safe storage
  const subHash = faydaProvider.hashFaydaSub(claims.sub)

  // Check that this Fayda identity hasn't been used to verify another account
  const duplicateCheck = await UserVerification.findOne({
    where: {
      fayda_subject_hash: subHash,
      status: 'VERIFIED',
      user_id: { [Op.ne]: userId },
    },
  })

  if (duplicateCheck) {
    await verification.update({ status: 'REJECTED', rejection_reason: 'This Fayda identity is already linked to another account.' })
    throw new AppError('This Fayda identity is already associated with a different account.', 409)
  }

  // Atomically: set verification VERIFIED + set User.is_fayda_verified = true
  const t = await sequelize.transaction()
  try {
    await verification.update(
      {
        status: 'VERIFIED',
        fayda_subject_hash: subHash,
        verified_at: new Date(),
      },
      { transaction: t },
    )

    await User.update(
      { is_fayda_verified: true },
      { where: { id: userId }, transaction: t },
    )

    await t.commit()
  } catch (err) {
    await t.rollback()
    throw new AppError('Failed to record Fayda verification. Please try again.', 500)
  }

  return { success: true, userId }
}

// ── Admin Functions ──────────────────────────────────────────────────────────

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
    // Never return document_reference, fayda_state_token, or fayda_subject_hash in list view
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
 * BUG FIX: Also updates User.is_fayda_verified boolean flag.
 * NEVER exposes document_reference, fayda_state_token, or fayda_subject_hash.
 */
export async function approveVerification(verificationId: string, adminId: string) {
  const verification = await UserVerification.findByPk(verificationId)
  if (!verification) throw new AppError('Verification record not found.', 404)
  if (verification.status === 'VERIFIED') throw new AppError('Already verified.', 409)

  const t = await sequelize.transaction()
  try {
    await verification.update(
      {
        status: 'VERIFIED',
        verified_at: new Date(),
        verified_by: adminId,
        rejection_reason: null,
      },
      { transaction: t },
    )

    // Sync the relevant boolean flag on the User record
    if (verification.verification_type === 'NATIONAL_ID') {
      await User.update(
        { is_fayda_verified: true },
        { where: { id: verification.user_id }, transaction: t },
      )
    }

    await t.commit()
  } catch (err) {
    await t.rollback()
    throw new AppError('Failed to approve verification.', 500)
  }

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
