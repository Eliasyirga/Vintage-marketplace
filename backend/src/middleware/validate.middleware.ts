import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

/**
 * Zod request validation middleware factory.
 * Validates req.body against the provided schema.
 * Returns a 400 with field-level error messages on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      })
      return
    }
    req.body = result.data
    next()
  }
}
