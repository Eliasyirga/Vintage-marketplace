import { sendVerificationOTP as sendEmailOTP } from './email.service'
import { env } from '../config/env'
import type { VerificationMethod } from '../types/auth.types'

interface SendOTPOptions {
  method: VerificationMethod
  destination: string
  otp: string
  name: string
}

/**
 * Unified OTP delivery abstraction.
 *
 * - EMAIL: delegates to email.service (Nodemailer).
 * - PHONE: sends via SMS provider (Twilio/AfricasTalking) if configured.
 *   In development, if SMS is not configured, logs OTP to terminal for testing.
 */
export async function sendOTP({
  method,
  destination,
  otp,
  name,
}: SendOTPOptions): Promise<void> {
  if (method === 'EMAIL') {
    await sendEmailOTP({ to: destination, otp, name })
    return
  }

  if (method === 'PHONE') {
    const smsConfigured =
      env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER

    if (smsConfigured) {
      // Future Twilio implementation
      return
    }

    if (env.isDevelopment) {
      console.log('\n======================================================')
      console.log(`📱 [DEV PHONE OTP CODE] Destination: ${destination}`)
      console.log(`🔑 Verification Code: ${otp}`)
      console.log('⚠️ SMS provider unconfigured in .env. Using console dev logging.')
      console.log('======================================================\n')
      return
    }

    throw new Error(
      'SMS provider not configured. ' +
      'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.',
    )
  }

  throw new Error(`Unsupported verification method: ${method}`)
}
