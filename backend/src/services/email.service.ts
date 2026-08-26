import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { env } from '../config/env'

// ─── Singleton Transporter ────────────────────────────────────────────────────
let transporter: nodemailer.Transporter | null = null

export function isSMTPConfigured(): boolean {
  return !!(env.SMTP_USER && env.SMTP_PASSWORD && (env.SMTP_HOST || env.SMTP_USER.includes('@gmail.com')))
}

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  if (!isSMTPConfigured()) {
    return null
  }

  // Strip any accidental spaces from Gmail App Passwords (e.g. "xxxx xxxx xxxx xxxx" → "xxxxxxxxxxxxxxxx")
  const cleanPassword = env.SMTP_PASSWORD.replace(/\s+/g, '')

  const hostLower = (env.SMTP_HOST || '').toLowerCase()
  const userLower = (env.SMTP_USER || '').toLowerCase()
  const isGmail = hostLower.includes('gmail') || userLower.includes('@gmail.com')

  if (isGmail) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        pass: cleanPassword,
      },
      // Force IPv4 to prevent IPv6 connect timeout hangs on cloud hosts like Render/Railway/AWS
      family: 4,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      pool: false,
    } as nodemailer.TransportOptions)
  } else {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: cleanPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
      family: 4,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      pool: false,
    } as nodemailer.TransportOptions)
  }

  return transporter
}

// ─── SMTP Connection Verification ────────────────────────────────────────────
/**
 * Verify the SMTP connection at startup or on-demand.
 * Logs clear diagnostic messages and tips without exposing credentials.
 */
export async function verifyEmailConnection(): Promise<boolean> {
  transporter = null
  const transport = getTransporter()
  if (!transport) {
    console.warn(
      '⚠️ [Email] SMTP is NOT configured in environment variables.\n' +
      '   Required: SMTP_USER, SMTP_PASSWORD, and SMTP_HOST.\n' +
      '   Emails (including verification OTPs) will NOT be delivered until configured in deployment settings.',
    )
    return false
  }

  try {
    await transport.verify()
    console.log('✅ [Email] SMTP connection verified successfully — ready to deliver emails.')
    return true
  } catch (err: unknown) {
    const e = err as { code?: string; response?: string; responseCode?: number; message?: string }
    console.error(
      `❌ [Email] SMTP connection verification failed:\n` +
      `   Message: ${e.message}\n` +
      `   Code:    ${e.code ?? 'N/A'}\n` +
      `   Reply:   ${e.response ?? 'N/A'}`,
    )

    if (e.response?.includes('535') || e.code === 'EAUTH') {
      console.error(
        '💡 [Email Tip] Authentication failed. If using Gmail:\n' +
        '   1. Ensure 2-Step Verification is turned ON on your Google Account.\n' +
        '   2. Generate an App Password at: https://myaccount.google.com/apppasswords\n' +
        '   3. Use the 16-character App Password for SMTP_PASSWORD (do NOT use your standard account password).',
      )
    }

    transporter = null
    return false
  }
}

// ─── Template Engine ──────────────────────────────────────────────────────────
/**
 * Load an HTML email template and replace {{variable}} placeholders.
 * Checks multiple locations so it works in both dev (src/) and production (dist/).
 */
function renderTemplate(
  templateName: string,
  variables: Record<string, string | number>,
): string {
  const candidatePaths = [
    path.resolve(__dirname, '../templates/email', templateName),
    path.resolve(__dirname, '../../src/templates/email', templateName),
    path.resolve(process.cwd(), 'src/templates/email', templateName),
    path.resolve(process.cwd(), 'dist/templates/email', templateName),
  ]

  let html: string | null = null
  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        html = fs.readFileSync(candidate, 'utf-8')
        break
      }
    } catch {
      // Continue to next candidate
    }
  }

  if (!html) {
    // High quality inline HTML fallback
    html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <tr>
      <td style="background: #1e293b; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: -0.5px;">Vintage Marketplace</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 28px;">
        <p style="margin: 0 0 16px; font-size: 16px;">Hello <strong>{{fullName}}</strong>,</p>
        <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.5;">
          Use the verification code below to confirm your account:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; background: #f1f5f9; padding: 14px 28px; border-radius: 8px; border: 1px dashed #cbd5e1; font-family: monospace;">{{otp}}</span>
        </div>
        <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-align: center;">
          This code expires in <strong>{{expirationMinutes}} minutes</strong>.
        </p>
        <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          For your security, never share this code with anyone. If you didn't request this verification code, please ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }

  // Replace all {{variable}} placeholders
  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, String(value))
  }

  return html
}

// ─── OTP Verification Email ───────────────────────────────────────────────────

interface SendOTPOptions {
  to: string
  name: string
  otp: string
  expirationMinutes?: number
}

/**
 * Send a professionally designed OTP verification email.
 */
export async function sendVerificationOTP({
  to,
  name,
  otp,
  expirationMinutes = 5,
}: SendOTPOptions): Promise<void> {
  if (env.isDevelopment) {
    console.log(`\n🔑 [VERIFICATION OTP] To: ${to} | Code: ${otp}\n`)
  }

  const transport = getTransporter()

  // ── No SMTP configured ────────────────────────────────────────────────────
  if (!transport) {
    console.warn(`⚠️ [Email] Cannot send OTP to ${to} — SMTP is not configured. (Check SMTP_HOST, SMTP_USER, SMTP_PASSWORD)`)
    if (env.isProduction) {
      throw new Error('Email service is not configured on the server. Please check SMTP environment variables.')
    }
    return
  }

  // ── Build HTML template ───────────────────────────────────────────────────
  const html = renderTemplate('verification-otp.html', {
    fullName: name,
    otp,
    expirationMinutes,
    year: new Date().getFullYear(),
  })

  // ── Plain-text fallback ───────────────────────────────────────────────────
  const text = `
Hello ${name},

Your Vintage Marketplace verification code is:

${otp}

This code expires in ${expirationMinutes} minutes.

For your security: Never share this code with anyone.
Vintage Marketplace will never ask for your code by phone or chat.

If you did not create a Vintage Marketplace account, ignore this email.

— Vintage Marketplace
  `.trim()

  // ── Send ──────────────────────────────────────────────────────────────────
  try {
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Vintage Marketplace — Verify Your Email',
      text,
      html,
    })
    console.log(`✅ [Email] OTP successfully sent to ${to}`)
  } catch (err: unknown) {
    const e = err as { code?: string; response?: string; responseCode?: number; message?: string }
    console.error(
      `❌ [Email] OTP sendMail failed to ${to}:\n` +
      `   Message: ${e.message}\n` +
      `   Code:    ${e.code ?? 'N/A'}\n` +
      `   Reply:   ${e.response ?? 'N/A'}`,
    )
    transporter = null // Reset transporter so next attempt re-initializes cleanly

    if (env.isDevelopment) {
      return
    }

    throw new Error('Unable to deliver verification email. Please check that your email address is correct or try again shortly.')
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<void> {
  if (env.isDevelopment) {
    console.log(`✉️ [DEV EMAIL] To: ${to} | Subject: ${subject}`)
  }

  const transport = getTransporter()
  if (!transport) {
    console.warn(`⚠️ [Email] Cannot send email to ${to} — SMTP not configured.`)
    return
  }

  try {
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text: text || subject,
      html,
    })
  } catch (err) {
    console.error(`❌ [Email] sendMail failed for ${to}:`, err)
  }
}
