import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { env } from '../config/env'

// ─── Singleton Transporter ────────────────────────────────────────────────────
// Created once; reused for every outgoing email to avoid overhead.
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // Port 465 requires secure TLS; port 587 uses STARTTLS (secure: false)
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  })

  return transporter
}

// ─── SMTP Connection Verification ────────────────────────────────────────────
/**
 * Verify the SMTP connection at startup.
 * Logs success or failure without exposing credentials.
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transport = getTransporter()
  if (!transport) {
    console.warn('⚠️ [Email] SMTP not configured — email delivery is disabled.')
    return false
  }
  try {
    await transport.verify()
    console.log('✅ [Email] SMTP connection verified — Gmail ready to send.')
    return true
  } catch (err) {
    // Log raw error only in development for debugging; never expose in production
    if (env.isDevelopment) {
      console.error('❌ [Email] SMTP verify failed:', err)
    } else {
      console.error('❌ [Email] SMTP connection failed. Check SMTP_* environment variables.')
    }
    return false
  }
}

// ─── Template Engine ──────────────────────────────────────────────────────────
/**
 * Load an HTML email template and replace {{variable}} placeholders.
 */
function renderTemplate(
  templateName: string,
  variables: Record<string, string | number>,
): string {
  const templatePath = path.resolve(
    __dirname,
    '../templates/email',
    templateName,
  )

  let html: string
  try {
    html = fs.readFileSync(templatePath, 'utf-8')
  } catch {
    // Fallback: return a minimal inline template if file isn't found
    html = `<p>Your verification code is: <strong>{{otp}}</strong></p>`
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
 *
 * Development behaviour:
 * - Always logs the OTP to the console (safe for local testing).
 * - If SMTP is not configured, falls back to console logging only.
 *
 * Production behaviour:
 * - Requires full SMTP configuration.
 * - Throws a safe error if SMTP is unavailable.
 * - Never logs the OTP.
 */
export async function sendVerificationOTP({
  to,
  name,
  otp,
  expirationMinutes = 5,
}: SendOTPOptions): Promise<void> {
  // ── Development: always log OTP for local testing ─────────────────────────
  if (env.isDevelopment) {
    console.log('\n══════════════════════════════════════════════')
    console.log(`✉️  [DEV EMAIL OTP]  To: ${to}`)
    console.log(`🔑  Verification Code: ${otp}`)
    console.log('══════════════════════════════════════════════\n')
  }

  const transport = getTransporter()

  // ── No SMTP configured ────────────────────────────────────────────────────
  if (!transport) {
    if (env.isDevelopment) {
      console.warn('⚠️  SMTP not configured — OTP logged to console only (dev mode).')
      return
    }
    throw new Error('Email service is not configured. Please contact support.')
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
  } catch (err) {
    if (env.isDevelopment) {
      console.error('❌ [Email] SMTP sendMail failed (dev mode, code still in console):', err)
      return // In dev, fall back gracefully; OTP already printed above
    }
    // In production: do NOT expose provider error details
    throw new Error('Unable to send the verification email. Please try again.')
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
    if (env.isDevelopment) {
      console.error('❌ [Email] sendMail failed in dev:', err)
    }
  }
}

