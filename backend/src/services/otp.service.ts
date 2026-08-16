import { generateOTP, hashOTP, otpExpiresAt, verifyOTP, isOTPExpired } from '../utils/otp'
import { sendVerificationOTP as sendEmailOTP } from './email.service'
import { sendSMS } from './sms.service'
import type { VerificationMethod } from '../types/auth.types'

export interface DispatchOTPOptions {
  method: VerificationMethod
  destination: string
  otp: string
  name: string
}

/**
 * Dispatch an OTP via the user's selected verification method (EMAIL or PHONE).
 */
export async function dispatchOTP({
  method,
  destination,
  otp,
  name,
}: DispatchOTPOptions): Promise<void> {
  if (method === 'EMAIL') {
    await sendEmailOTP({ to: destination, otp, name })
    return
  }

  if (method === 'PHONE') {
    const smsMessage = `Your Vintage Marketplace verification code is: ${otp}. This code expires in 5 minutes. Do not share this code.`
    await sendSMS(destination, smsMessage)
    return
  }

  throw new Error(`Unsupported verification method: ${method}`)
}

export { generateOTP, hashOTP, otpExpiresAt, verifyOTP, isOTPExpired }
