import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

/**
 * Centralised error handler.
 * - Strips stack traces in production.
 * - Returns consistent { success, message } JSON.
 * - Never leaks SQL, paths, secrets, or internal errors.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500
  let message = 'An unexpected error occurred.'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err instanceof Error) {
    // Attach statusCode if it was set directly on the error object
    const e = err as Error & { statusCode?: number }
    statusCode = e.statusCode ?? 500
    message = e.statusCode ? e.message : 'An unexpected error occurred.'

    // Log server errors in development for debugging
    if (env.isDevelopment && !e.statusCode) {
      console.error('[ERROR]', err)
    }
  }

  // Never expose internals in production for 5xx errors
  if (statusCode >= 500 && env.isProduction) {
    message = 'An unexpected error occurred.'
  }

  const payload: { success: false; message: string; errors?: unknown } = {
    success: false,
    message,
  }

  const e = err as Error & { errors?: unknown }
  if (statusCode === 400 && e.errors) {
    payload.errors = e.errors
  }

  res.status(statusCode).json(payload)
}
