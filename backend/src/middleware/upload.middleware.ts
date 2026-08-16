import multer from 'multer'
import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { isAllowedImageMime } from '../services/upload.service'

const memoryStorage = multer.memoryStorage()

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.MAX_IMAGE_SIZE_BYTES,
    files: 8,
  },
  fileFilter(_req, file, cb) {
    if (!isAllowedImageMime(file.mimetype)) {
      cb(Object.assign(new Error('Only JPEG, PNG, and WEBP images are allowed.'), { statusCode: 400 }))
      return
    }
    cb(null, true)
  },
})

export const listingImagesUpload = upload.array('images', 8)

export function handleMulterError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!err) {
    next()
    return
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: 'Each image must be 5MB or smaller.' })
      return
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({ success: false, message: 'You can upload a maximum of 8 images.' })
      return
    }
    res.status(400).json({ success: false, message: 'Invalid image upload.' })
    return
  }

  const e = err as Error & { statusCode?: number }
  if (e.statusCode) {
    res.status(e.statusCode).json({ success: false, message: e.message })
    return
  }

  next(err)
}

/**
 * Validate image count rules for create/publish operations.
 */
export function validateImageCount(
  files: Express.Multer.File[] | undefined,
  status: 'DRAFT' | 'ACTIVE',
): void {
  const count = files?.length ?? 0

  if (status === 'ACTIVE' && count < 1) {
    throw Object.assign(new Error('At least one image is required to publish a listing.'), {
      statusCode: 400,
    })
  }

  if (count > 8) {
    throw Object.assign(new Error('You can upload a maximum of 8 images.'), { statusCode: 400 })
  }
}

/**
 * Validate combined image count when updating listings.
 */
export function validateTotalImageCount(
  existingCount: number,
  newFilesCount: number,
  removeCount: number,
  targetStatus?: string,
): void {
  const total = existingCount - removeCount + newFilesCount

  if (total > 8) {
    throw Object.assign(new Error('A listing can have at most 8 images.'), { statusCode: 400 })
  }

  if (targetStatus === 'ACTIVE' && total < 1) {
    throw Object.assign(new Error('At least one image is required to publish a listing.'), {
      statusCode: 400,
    })
  }
}
