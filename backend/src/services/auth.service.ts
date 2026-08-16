import { Op } from 'sequelize'
import { sequelize } from '../config/database'
import { User, PendingRegistration } from '../models'
import { dispatchOTP } from './otp.service'
import { hashPassword, comparePassword } from '../utils/password'
import { generateOTP, hashOTP, otpExpiresAt, isOTPExpired, verifyOTP } from '../utils/otp'
import { validateAndNormalizePhone } from '../utils/phone'
import { signAccessToken } from '../utils/jwt'
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ChangeMethodInput,
  SafeUser,
  AuthResponse,
} from '../types/auth.types'

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_OTP_ATTEMPTS = 5
const MAX_OTP_SENDS = 5
const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normaliseEmail(email: string): string {
  return email.toLowerCase().trim()
}

function normalisePhone(phone: string): string {
  const res = validateAndNormalizePhone(phone)
  if (!res.isValid || !res.e164) {
    throw Object.assign(
      new Error('Please enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678).'),
      { statusCode: 400 },
    )
  }
  return res.e164
}

// ─── Registration ─────────────────────────────────────────────────────────────

interface RegisterResult {
  registrationId: string
  maskedDestination: string
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const { fullName, password, verificationMethod } = input

  const email = input.email && input.email.trim() ? normaliseEmail(input.email) : undefined
  const phone = input.phone && input.phone.trim() ? normalisePhone(input.phone) : undefined

  // Check for existing verified users
  if (email) {
    const existing = await User.findOne({ where: { email, is_email_verified: true } })
    if (existing) {
      throw Object.assign(new Error('An account with this email address already exists.'), { statusCode: 409 })
    }
  }

  if (phone) {
    const existing = await User.findOne({ where: { phone, is_phone_verified: true } })
    if (existing) {
      throw Object.assign(new Error('An account with this phone number already exists.'), { statusCode: 409 })
    }
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Generate 6-digit OTP using crypto.randomInt (CSPRNG)
  const otp = generateOTP()
  const otpHash = hashOTP(otp)
  const expiresAt = otpExpiresAt()
  const now = new Date()

  // Create pending registration (User record NOT created until OTP verified)
  const pending = await PendingRegistration.create({
    full_name: fullName.trim(),
    email: email ?? null,
    phone: phone ?? null,
    password_hash: passwordHash,
    verification_method: verificationMethod,
    otp_hash: otpHash,
    otp_expires_at: expiresAt,
    otp_attempts: 0,
    otp_send_count: 1,
    last_otp_sent_at: now,
  })

  // Send OTP via selected channel
  const destination = verificationMethod === 'EMAIL' ? email! : phone!
  await dispatchOTP({ method: verificationMethod, destination, otp, name: fullName })

  return {
    registrationId: pending.id,
    maskedDestination: pending.maskedDestination,
  }
}

// ─── OTP Verification ─────────────────────────────────────────────────────────

export async function verifyRegistration(input: VerifyOtpInput): Promise<AuthResponse> {
  const pending = await PendingRegistration.findByPk(input.registrationId)
  if (!pending) {
    throw Object.assign(new Error('Registration session not found. Please start registration again.'), { statusCode: 404 })
  }

  // Check OTP expiration
  if (isOTPExpired(pending.otp_expires_at)) {
    await pending.destroy()
    throw Object.assign(
      new Error('This verification code has expired. Please start registration again.'),
      { statusCode: 400 },
    )
  }

  // Check attempt limit
  if (pending.otp_attempts >= MAX_OTP_ATTEMPTS) {
    await pending.destroy()
    throw Object.assign(
      new Error('Too many incorrect attempts. Please start registration again.'),
      { statusCode: 429 },
    )
  }

  // Verify submitted OTP against stored SHA-256 hash
  const isValid = verifyOTP(input.otp, pending.otp_hash)

  if (!isValid) {
    pending.otp_attempts += 1
    await pending.save()

    const remaining = MAX_OTP_ATTEMPTS - pending.otp_attempts
    if (remaining <= 0) {
      await pending.destroy()
      throw Object.assign(
        new Error('Too many incorrect attempts. Please start registration again.'),
        { statusCode: 429 },
      )
    }

    throw Object.assign(
      new Error(`Incorrect verification code. Please try again (${remaining} attempt(s) remaining).`),
      { statusCode: 400 },
    )
  }

  // ── OTP valid — Create User in a Database Transaction ────────────────
  const transaction = await sequelize.transaction()
  try {
    const userData: Record<string, unknown> = {
      full_name: pending.full_name,
      email: pending.email,
      phone: pending.phone,
      password_hash: pending.password_hash,
      role: 'USER', // Always default to standard USER
      status: 'ACTIVE',
    }

    if (pending.verification_method === 'EMAIL') {
      userData.is_email_verified = true
      userData.is_phone_verified = false
    } else {
      userData.is_phone_verified = true
      userData.is_email_verified = false
    }

    const user = await User.create(userData as any, { transaction })
    
    // Invalidate / delete pending registration record
    await pending.destroy({ transaction })

    await transaction.commit()

    const accessToken = signAccessToken({ sub: user.id, role: user.role })

    return { user: user.toSafeObject() as SafeUser, accessToken }
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

interface ResendResult {
  maskedDestination: string
  cooldownSeconds: number
}

export async function resendOTP(input: ResendOtpInput): Promise<ResendResult> {
  const pending = await PendingRegistration.findByPk(input.registrationId)
  if (!pending) {
    throw Object.assign(new Error('Registration session not found. Please start registration again.'), { statusCode: 404 })
  }

  // Cooldown check (60 seconds)
  const msSinceLastSend = Date.now() - new Date(pending.last_otp_sent_at).getTime()
  if (msSinceLastSend < RESEND_COOLDOWN_MS) {
    const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - msSinceLastSend) / 1000)
    throw Object.assign(
      new Error(`Please wait ${secondsLeft} seconds before requesting a new verification code.`),
      { statusCode: 429 },
    )
  }

  // Maximum resend attempts limit (5)
  if (pending.otp_send_count >= MAX_OTP_SENDS) {
    throw Object.assign(
      new Error('Too many verification codes requested. Please try again later.'),
      { statusCode: 429 },
    )
  }

  // Generate NEW OTP (overwrites old hash — old OTP is immediately invalidated)
  const otp = generateOTP()
  pending.otp_hash = hashOTP(otp)
  pending.otp_expires_at = otpExpiresAt()
  pending.otp_attempts = 0
  pending.otp_send_count += 1
  pending.last_otp_sent_at = new Date()
  await pending.save()

  const destination = pending.destination
  await dispatchOTP({
    method: pending.verification_method,
    destination,
    otp,
    name: pending.full_name,
  })

  return {
    maskedDestination: pending.maskedDestination,
    cooldownSeconds: RESEND_COOLDOWN_MS / 1000,
  }
}

// ─── Change Verification Method ────────────────────────────────────────────────

export async function changeVerificationMethod(input: ChangeMethodInput): Promise<RegisterResult> {
  const pending = await PendingRegistration.findByPk(input.registrationId)
  if (!pending) {
    throw Object.assign(new Error('Registration session not found. Please start registration again.'), { statusCode: 404 })
  }

  const { verificationMethod } = input
  let newEmail: string | null = null
  let newPhone: string | null = null

  if (verificationMethod === 'EMAIL') {
    if (!input.email) throw Object.assign(new Error('Email address is required.'), { statusCode: 400 })
    newEmail = normaliseEmail(input.email)
    const existing = await User.findOne({ where: { email: newEmail, is_email_verified: true } })
    if (existing) {
      throw Object.assign(new Error('An account with this email address already exists.'), { statusCode: 409 })
    }
  } else {
    if (!input.phone) throw Object.assign(new Error('Phone number is required.'), { statusCode: 400 })
    newPhone = normalisePhone(input.phone)
    const existing = await User.findOne({ where: { phone: newPhone, is_phone_verified: true } })
    if (existing) {
      throw Object.assign(new Error('An account with this phone number already exists.'), { statusCode: 409 })
    }
  }

  // Invalidate old OTP & update registration details
  const otp = generateOTP()
  pending.verification_method = verificationMethod
  pending.email = newEmail
  pending.phone = newPhone
  pending.otp_hash = hashOTP(otp)
  pending.otp_expires_at = otpExpiresAt()
  pending.otp_attempts = 0
  pending.last_otp_sent_at = new Date()
  await pending.save()

  const destination = verificationMethod === 'EMAIL' ? newEmail! : newPhone!
  await dispatchOTP({ method: verificationMethod, destination, otp, name: pending.full_name })

  return {
    registrationId: pending.id,
    maskedDestination: pending.maskedDestination,
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<AuthResponse> {
  const raw = input.identifier.trim()

  const isEmail = raw.includes('@')
  const identifier = isEmail ? normaliseEmail(raw) : normalisePhone(raw)

  const whereClause = isEmail ? { email: identifier } : { phone: identifier }
  const user = await User.findOne({ where: whereClause })

  const credentialError = Object.assign(new Error('Invalid email/phone or password.'), { statusCode: 401 })

  if (!user) throw credentialError

  const passwordValid = await comparePassword(input.password, user.password_hash)
  if (!passwordValid) throw credentialError

  if (user.status === 'SUSPENDED') {
    throw Object.assign(new Error('Your account has been suspended. Please contact support.'), { statusCode: 403 })
  }
  if (user.status === 'DEACTIVATED') {
    throw Object.assign(new Error('Your account has been deactivated.'), { statusCode: 403 })
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role })

  return { user: user.toSafeObject() as SafeUser, accessToken }
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await User.findByPk(userId)
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 })
  }
  return user.toSafeObject() as SafeUser
}
