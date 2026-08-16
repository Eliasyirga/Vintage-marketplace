import { env } from '../config/env'

export interface SendSMSResult {
  success: boolean
  messageId?: string
}

/**
 * SMS Provider Abstraction.
 * Supports Twilio, Africa's Talking, or custom Ethiopian SMS providers.
 *
 * The authentication system delegates all SMS operations through sendSMS(phone, message).
 */
export async function sendSMS(phone: string, message: string): Promise<SendSMSResult> {
  const provider = env.SMS_PROVIDER?.toUpperCase()

  // Development Fallback Logging
  if (env.isDevelopment && !provider) {
    console.log('\n======================================================')
    console.log(`📱 [DEV SMS] Destination: ${phone}`)
    console.log(`💬 Message: ${message}`)
    console.log('⚠️ SMS_PROVIDER unconfigured in .env. Console dev mode active.')
    console.log('======================================================\n')
    return { success: true, messageId: 'dev-simulated-msg-id' }
  }

  if (provider === 'TWILIO') {
    const accountSid = env.TWILIO_ACCOUNT_SID
    const authToken = env.TWILIO_AUTH_TOKEN
    const fromPhone = env.TWILIO_PHONE_NUMBER

    if (!accountSid || (!authToken && !env.TWILIO_API_SECRET) || !fromPhone) {
      if (env.isDevelopment) {
        console.warn('⚠️ Twilio credentials missing in .env. Falling back to console logging.')
        console.log(`📱 [DEV SMS to ${phone}]: ${message}`)
        return { success: true, messageId: 'dev-fallback' }
      }
      throw new Error('Twilio configuration incomplete in .env file.')
    }

    try {
      // Dynamic import to prevent build breakages if twilio SDK is optional
      // Using Twilio REST API directly or optional twilio package
      const auth = Buffer.from(`${accountSid}:${authToken || env.TWILIO_API_SECRET}`).toString('base64')
      const body = new URLSearchParams({
        To: phone,
        From: fromPhone,
        Body: message,
      })

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        },
      )

      if (!response.ok) {
        const errData = (await response.json()) as { message?: string }
        throw new Error(`Twilio SMS failed: ${errData.message || response.statusText}`)
      }

      const resData = (await response.json()) as { sid?: string }
      return { success: true, messageId: resData.sid }
    } catch (err) {
      if (env.isDevelopment) {
        console.warn('⚠️ Could not send SMS via Twilio in dev mode:', err)
        return { success: true, messageId: 'dev-fallback-error' }
      }
      throw err
    }
  }

  if (provider === 'AFRICASTALKING') {
    // Placeholder for Africa's Talking integration for Ethiopian Telecom / regional delivery
    if (env.isDevelopment) {
      console.log(`📱 [DEV Africa's Talking SMS to ${phone}]: ${message}`)
      return { success: true, messageId: 'at-dev-id' }
    }
    throw new Error("Africa's Talking provider not fully configured.")
  }

  if (!provider) {
    throw new Error('SMS service not configured. Please set SMS_PROVIDER in .env file.')
  }

  throw new Error(`Unsupported SMS provider: ${provider}`)
}
