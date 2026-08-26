import nodemailer from 'nodemailer'
import dns from 'dns'
import fs from 'fs'
import path from 'path'
import { env } from '../config/env'

// Ensure IPv4 lookup precedence in this worker
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first')
}

/**
 * Custom DNS lookup function that strictly enforces IPv4.
 * This completely prevents Linux/Render containers from attempting IPv6 connections (ENETUNREACH).
 */
function forceIpv4Lookup(
  hostname: string,
  options: any,
  callback?: (err: NodeJS.ErrnoException | null, address: string, family: number) => void,
) {
  const cb = typeof options === 'function' ? options : callback
  return dns.lookup(hostname, { family: 4, all: false }, (err, address, family) => {
    if (cb) {
      cb(err, address, family)
    }
  })
}

// ─── HTTP API Delivery (HTTPS Port 443 — Immune to PaaS / Render Port Blocking) ──

async function sendViaResend({
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
  const from = env.EMAIL_FROM || 'Vintage Marketplace <onboarding@resend.dev>'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text: text || undefined,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(`Resend API error (${res.status}): ${JSON.stringify(errorData)}`)
  }
}

async function sendViaBrevo({
  to,
  name,
  subject,
  html,
  text,
}: {
  to: string
  name?: string
  subject: string
  html: string
  text?: string
}): Promise<void> {
  const senderEmail = env.SMTP_USER || 'noreply@vintagemarketplace.com'
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Vintage Marketplace', email: senderEmail },
      to: [{ email: to, name: name || to.split('@')[0] }],
      subject,
      htmlContent: html,
      textContent: text || undefined,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(`Brevo API error (${res.status}): ${JSON.stringify(errorData)}`)
  }
}

// ─── Singleton Transporter & Builder ──────────────────────────────────────────
let transporter: nodemailer.Transporter | null = null

export function isSMTPConfigured(): boolean {
  return !!(
    env.RESEND_API_KEY ||
    env.BREVO_API_KEY ||
    (env.SMTP_USER && env.SMTP_PASSWORD && (env.SMTP_HOST || env.SMTP_USER.includes('@gmail.com')))
  )
}

function buildTransport(port: number): nodemailer.Transporter {
  const cleanPassword = env.SMTP_PASSWORD.replace(/\s+/g, '')
  const hostLower = (env.SMTP_HOST || '').toLowerCase()
  const userLower = (env.SMTP_USER || '').toLowerCase()
  const isGmail = hostLower.includes('gmail') || userLower.includes('@gmail.com')

  const host = isGmail ? (env.SMTP_HOST || 'smtp.gmail.com') : env.SMTP_HOST
  const isSecure = port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure, // 465 = true (implicit TLS), 587 = false (STARTTLS)
    requireTLS: port === 587,
    auth: {
      user: env.SMTP_USER,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false,
      servername: host,
    },
    lookup: forceIpv4Lookup, // Strictly force IPv4
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
    pool: false,
  } as nodemailer.TransportOptions)
}

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter
  if (!isSMTPConfigured()) return null
  const defaultPort = env.SMTP_PORT || 587
  transporter = buildTransport(defaultPort)
  return transporter
}

// ─── Email Connection Verification ───────────────────────────────────────────
/**
 * Verify the email delivery configuration at startup or on-demand.
 * Checks Resend/Brevo HTTP API or tests SMTP connection.
 */
export async function verifyEmailConnection(): Promise<boolean> {
  if (env.RESEND_API_KEY) {
    console.log('✅ [Email] Resend HTTP API configured (HTTPS Port 443 — immune to Render port blocking) — ready to send.')
    return true
  }

  if (env.BREVO_API_KEY) {
    console.log('✅ [Email] Brevo HTTP API configured (HTTPS Port 443 — immune to Render port blocking) — ready to send.')
    return true
  }

  if (!isSMTPConfigured()) {
    console.warn(
      '⚠️ [Email] Email is NOT configured in environment variables.\n' +
      '   Option 1 (Recommended on Render): Add RESEND_API_KEY in Render Environment.\n' +
      '   Option 2: Configure SMTP_USER, SMTP_PASSWORD, and SMTP_HOST.',
    )
    return false
  }

  const primaryPort = env.SMTP_PORT || 587
  const fallbackPort = primaryPort === 587 ? 465 : 587

  // Try primary port (587 STARTTLS by default)
  try {
    const transport = buildTransport(primaryPort)
    await transport.verify()
    transporter = transport
    console.log(`✅ [Email] SMTP connection verified successfully on port ${primaryPort} — ready to deliver emails.`)
    return true
  } catch (err: unknown) {
    const e = err as { code?: string; response?: string; message?: string }
    console.warn(`⚠️ [Email] Port ${primaryPort} connection attempt failed (${e.code ?? e.message}). Trying fallback port ${fallbackPort}...`)

    // Try alternative port (465 SSL)
    try {
      const fallbackTransport = buildTransport(fallbackPort)
      await fallbackTransport.verify()
      transporter = fallbackTransport
      console.log(`✅ [Email] SMTP connection verified successfully on fallback port ${fallbackPort} — ready to deliver emails.`)
      return true
    } catch (fallbackErr: unknown) {
      const fe = fallbackErr as { code?: string; response?: string; message?: string }
      console.error(
        `❌ [Email] SMTP connection failed on both ports (${primaryPort} & ${fallbackPort}):\n` +
        `   Message: ${fe.message}\n` +
        `   Code:    ${fe.code ?? 'N/A'}\n` +
        `   💡 Tip for Render: Render free/starter tiers block all outbound SMTP ports (25, 465, 587).\n` +
        `      To deliver emails instantly without port blocks, add RESEND_API_KEY to your Render Environment (get a free key at https://resend.com).`,
      )

      transporter = null
      return false
    }
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

  const subject = 'Vintage Marketplace — Verify Your Email'

  // 1. Try Resend HTTP API if configured (HTTPS Port 443 — 100% reliable on Render)
  if (env.RESEND_API_KEY) {
    try {
      await sendViaResend({ to, subject, html, text })
      console.log(`✅ [Email] OTP delivered via Resend HTTP API to ${to}`)
      return
    } catch (err: unknown) {
      console.error(`❌ [Email] Resend API send failed:`, err)
      if (env.isProduction) {
        throw new Error('Unable to deliver verification email. Please try again shortly.')
      }
    }
  }

  // 2. Try Brevo HTTP API if configured
  if (env.BREVO_API_KEY) {
    try {
      await sendViaBrevo({ to, name, subject, html, text })
      console.log(`✅ [Email] OTP delivered via Brevo HTTP API to ${to}`)
      return
    } catch (err: unknown) {
      console.error(`❌ [Email] Brevo API send failed:`, err)
      if (env.isProduction) {
        throw new Error('Unable to deliver verification email. Please try again shortly.')
      }
    }
  }

  // 3. Fallback to SMTP
  const transport = getTransporter()

  if (!transport) {
    console.warn(`⚠️ [Email] Cannot send OTP to ${to} — No email provider configured. (Set RESEND_API_KEY or SMTP variables)`)
    if (env.isProduction) {
      throw new Error('Email service is not configured on the server.')
    }
    return
  }

  try {
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
    console.log(`✅ [Email] OTP successfully sent to ${to}`)
  } catch (err: unknown) {
    const e = err as { code?: string; response?: string; responseCode?: number; message?: string }
    const currentPort = (transport as any)?.options?.port || 587
    const altPort = currentPort === 587 ? 465 : 587

    console.warn(`⚠️ [Email] OTP sendMail failed on port ${currentPort} (${e.code ?? e.message}). Retrying on port ${altPort}...`)

    try {
      const altTransport = buildTransport(altPort)
      await altTransport.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      })
      transporter = altTransport
      console.log(`✅ [Email] OTP successfully delivered to ${to} via fallback port ${altPort}`)
      return
    } catch (retryErr: unknown) {
      const re = retryErr as { code?: string; response?: string; message?: string }
      console.error(
        `❌ [Email] OTP sendMail failed on both ports to ${to}:\n` +
        `   Message: ${re.message}\n` +
        `   Code:    ${re.code ?? 'N/A'}\n` +
        `   Reply:   ${re.response ?? 'N/A'}`,
      )
    }

    transporter = null
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

  if (env.RESEND_API_KEY) {
    try {
      await sendViaResend({ to, subject, html, text })
      return
    } catch (err) {
      console.error(`❌ [Email] Resend sendEmail failed:`, err)
    }
  }

  if (env.BREVO_API_KEY) {
    try {
      await sendViaBrevo({ to, subject, html, text })
      return
    } catch (err) {
      console.error(`❌ [Email] Brevo sendEmail failed:`, err)
    }
  }

  const transport = getTransporter()
  if (!transport) {
    console.warn(`⚠️ [Email] Cannot send email to ${to} — Email not configured.`)
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

