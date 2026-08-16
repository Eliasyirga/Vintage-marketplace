/**
 * Centralised environment configuration.
 * Validates required variables at startup so the server fails fast
 * rather than crashing mysteriously at runtime.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '5000'), 10),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:5173'),

  // Database (Supports Neon PostgreSQL connection string or individual credentials)
  DATABASE_URL: optional('DATABASE_URL', optional('DB_URL', '')),
  DATABASE_SSL: optional('DATABASE_SSL', 'false') === 'true',
  DB_HOST: optional('DB_HOST', 'localhost'),
  DB_PORT: parseInt(optional('DB_PORT', '5432'), 10),
  DB_NAME: optional('DB_NAME', 'vintage_marketplace'),
  DB_USER: optional('DB_USER', 'postgres'),
  DB_PASSWORD: optional('DB_PASSWORD', ''),

  // JWT
  get JWT_SECRET() { return required('JWT_SECRET') },
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
  get REFRESH_TOKEN_SECRET() { return required('REFRESH_TOKEN_SECRET') },
  REFRESH_TOKEN_EXPIRES_IN: optional('REFRESH_TOKEN_EXPIRES_IN', '7d'),

  // Email
  SMTP_HOST: optional('SMTP_HOST', ''),
  SMTP_PORT: parseInt(optional('SMTP_PORT', '587'), 10),
  SMTP_USER: optional('SMTP_USER', ''),
  SMTP_PASSWORD: optional('SMTP_PASSWORD', ''),
  // Gmail SMTP rejects if FROM != the authenticated sender — default to SMTP_USER
  get EMAIL_FROM() {
    const configured = process.env['EMAIL_FROM']
    if (configured) return configured
    // Fall back to "Display Name <user@gmail.com>" format
    const user = process.env['SMTP_USER'] || ''
    return user ? `"Vintage Marketplace" <${user}>` : '"Vintage Marketplace" <noreply@vintagemarketplace.com>'
  },

  // SMS Configuration
  SMS_PROVIDER: optional('SMS_PROVIDER', ''),
  TWILIO_ACCOUNT_SID: optional('TWILIO_ACCOUNT_SID', ''),
  TWILIO_AUTH_TOKEN: optional('TWILIO_AUTH_TOKEN', ''),
  TWILIO_API_KEY: optional('TWILIO_API_KEY', ''),
  TWILIO_API_SECRET: optional('TWILIO_API_SECRET', ''),
  TWILIO_PHONE_NUMBER: optional('TWILIO_PHONE_NUMBER', ''),

  // Uploads / static assets
  API_PUBLIC_URL: optional('API_PUBLIC_URL', 'http://localhost:5000'),
  UPLOAD_DIR: optional('UPLOAD_DIR', 'uploads'),
  MAX_IMAGE_SIZE_BYTES: parseInt(optional('MAX_IMAGE_SIZE_MB', '5'), 10) * 1024 * 1024,

  get isProduction() { return this.NODE_ENV === 'production' },
  get isDevelopment() { return this.NODE_ENV === 'development' },
}
