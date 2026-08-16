import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { env } from '../config/env'

export interface UploadedImage {
  url: string
  publicId: string
  filename: string
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function ensureUploadDirectory(): string {
  const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR, 'listings')
  fs.mkdirSync(uploadDir, { recursive: true })
  return uploadDir
}

export function isAllowedImageMime(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType)
}

export function buildPublicImageUrl(filename: string): string {
  return `${env.API_PUBLIC_URL}/uploads/listings/${filename}`
}

/**
 * Persist an uploaded file to local disk.
 * Cloudinary (or another provider) can replace this implementation later
 * without changing listing business logic.
 */
export async function saveListingImage(file: Express.Multer.File): Promise<UploadedImage> {
  if (!isAllowedImageMime(file.mimetype)) {
    throw Object.assign(new Error('Only JPEG, PNG, and WEBP images are allowed.'), { statusCode: 400 })
  }

  if (file.size > env.MAX_IMAGE_SIZE_BYTES) {
    throw Object.assign(new Error('Each image must be 5MB or smaller.'), { statusCode: 400 })
  }

  const uploadDir = ensureUploadDirectory()
  const extension = path.extname(file.originalname).toLowerCase() || '.jpg'
  const safeExtension = ['.jpg', '.jpeg', '.png', '.webp'].includes(extension) ? extension : '.jpg'
  const filename = `${crypto.randomUUID()}${safeExtension}`
  const destination = path.join(uploadDir, filename)

  if (file.buffer) {
    await fs.promises.writeFile(destination, file.buffer)
  } else if (file.path) {
    await fs.promises.rename(file.path, destination)
  } else {
    throw Object.assign(new Error('Invalid image upload.'), { statusCode: 400 })
  }

  return {
    url: buildPublicImageUrl(filename),
    publicId: filename,
    filename,
  }
}

export async function deleteListingImage(publicId: string | null): Promise<void> {
  if (!publicId) return

  const uploadDir = ensureUploadDirectory()
  const filePath = path.join(uploadDir, path.basename(publicId))

  try {
    await fs.promises.unlink(filePath)
  } catch {
    // File may already be removed; ignore
  }
}

export async function deleteListingImages(publicIds: Array<string | null>): Promise<void> {
  await Promise.all(publicIds.map((id) => deleteListingImage(id)))
}
