import rateLimit from 'express-rate-limit'

const rateLimitResponse = (message: string) => ({
  success: false,
  message,
})

/**
 * Global API rate limiter — applied to all routes.
 * Generous limit; per-endpoint limiters below are stricter.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests. Please try again later.'),
})

/**
 * Registration endpoint limiter.
 * 10 attempts per IP per 15 minutes.
 */
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many registration attempts from this IP. Please try again in 15 minutes.',
  ),
})

/**
 * OTP verification limiter.
 * 20 per IP per 15 minutes (users may have multiple registrations in parallel).
 */
export const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many verification attempts. Please try again later.',
  ),
})

/**
 * Resend OTP limiter.
 * 5 per IP per 15 minutes.
 */
export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many resend requests. Please try again later.',
  ),
})

/**
 * Login limiter.
 * 15 per IP per 15 minutes — balanced for usability.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many login attempts from this IP. Please try again in 15 minutes.',
  ),
})

/**
 * Refresh token limiter.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many refresh requests.'),
})

/**
 * Listing creation limiter — protects against spam listings.
 */
export const createListingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many listing creation attempts. Please try again later.'),
})

/**
 * Listing update/delete/status limiter.
 */
export const listingMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many listing updates. Please try again later.'),
})

/**
 * Advertisement creation limiter.
 */
export const createAdLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many advertisement submissions. Please try again later.'),
})

/**
 * Advertisement impression/click tracking limiter — prevents bot flooding.
 * 120 tracking events per IP per 1 minute window.
 */
export const adTrackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Tracking rate limit exceeded.'),
})

/**
 * Message sending limiter — protects against chat spam and flood abuse.
 * 30 messages per IP/user per 1 minute window.
 */
export const messageRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many messages sent. Please slow down and wait a minute.'),
})

/**
 * Fayda verification rate limiter.
 * 10 attempts per IP/user per 1 hour window.
 */
export const faydaVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many Fayda verification attempts. Please wait an hour before trying again.',
  ),
})

