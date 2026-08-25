/**
 * Upload service — dual-mode (Cloudinary when configured, local disk as fallback).
 *
 * Cloudinary asset organization:
 *  - Listings:       vintage-marketplace/listings/{listingId}
 *  - Advertisements: vintage-marketplace/advertisements/{adId}
 *  - Profiles:       vintage-marketplace/profiles/{userId}
 *
 * Local disk fallback organization:
 *  - Listings:       uploads/listings/{listingId}
 *  - Advertisements: uploads/advertisements/{adId}
 *  - Profiles:       uploads/profiles/{userId}
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { env } from '../config/env'
import * as cloudinaryService from './cloudinary.service'

// ── Image metadata returned to callers ────────────────────────────────────────

export interface UploadedImage {
  url: string
  publicId: string
  filename: string
  width?: number
  height?: number
  format?: string
  bytes?: number
}

// ── MIME / format validation ───────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export function isAllowedImageMime(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
}

/**
 * Magic-byte header validation — defence-in-depth against crafted files where
 * only the Content-Type header has been spoofed.
 */
export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return true

  // WEBP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  )
    return true

  return false
}

// ── Local disk helpers (dev fallback) ─────────────────────────────────────────

export function ensureUploadDirectory(subFolder = 'listings'): string {
  const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR, subFolder)
  fs.mkdirSync(uploadDir, { recursive: true })
  return uploadDir
}

export function buildPublicImageUrl(filename: string, subFolder = 'listings'): string {
  return `${env.API_PUBLIC_URL}/uploads/${subFolder}/${filename}`
}

// ── Core upload helpers ────────────────────────────────────────────────────────

function validateUploadedFile(file: Express.Multer.File): void {
  if (!file) {
    throw Object.assign(new Error('No image file received.'), { statusCode: 400 })
  }

  if (!isAllowedImageMime(file.mimetype)) {
    throw Object.assign(new Error('Only JPEG, PNG, and WEBP images are allowed.'), {
      statusCode: 400,
    })
  }

  if (file.size > env.MAX_IMAGE_SIZE_BYTES) {
    throw Object.assign(new Error('Each image must be 5 MB or smaller.'), { statusCode: 400 })
  }

  const buffer: Buffer | undefined = file.buffer
  if (buffer && !validateImageMagicBytes(buffer)) {
    throw Object.assign(
      new Error('File content does not match a valid image format (JPEG, PNG, WEBP).'),
      { statusCode: 400 },
    )
  }
}

async function saveToLocalDisk(
  file: Express.Multer.File,
  subFolder = 'listings',
): Promise<UploadedImage> {
  const uploadDir = ensureUploadDirectory(subFolder)
  const extension = path.extname(file.originalname).toLowerCase()
  const safeExt = ALLOWED_EXTENSIONS.has(extension) ? extension : '.jpg'
  const filename = `${crypto.randomUUID()}${safeExt}`
  const destination = path.join(uploadDir, filename)

  if (file.buffer) {
    await fs.promises.writeFile(destination, file.buffer)
  } else if (file.path) {
    await fs.promises.rename(file.path, destination)
  } else {
    throw Object.assign(new Error('Invalid image upload — no file data received.'), {
      statusCode: 400,
    })
  }

  return {
    url: buildPublicImageUrl(filename, subFolder),
    publicId: `${subFolder}/${filename}`,
    filename,
    bytes: file.size,
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Save a listing image under folder `vintage-marketplace/listings/{listingId}`.
 */
export async function saveListingImage(
  file: Express.Multer.File,
  listingId?: string,
): Promise<UploadedImage> {
  validateUploadedFile(file)

  const folderName = listingId
    ? `vintage-marketplace/listings/${listingId}`
    : 'vintage-marketplace/listings'

  if (env.CLOUDINARY_ENABLED) {
    const buffer = file.buffer
    if (!buffer) {
      throw Object.assign(new Error('No file buffer received for Cloudinary upload.'), {
        statusCode: 400,
      })
    }

    const result = await cloudinaryService.uploadImageBuffer(buffer, {
      folder: folderName,
      tags: ['listing', 'marketplace', ...(listingId ? [listingId] : [])],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
      ],
    })

    return {
      url: result.secureUrl,
      publicId: result.publicId,
      filename: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  }

  const localSubfolder = listingId ? `listings/${listingId}` : 'listings'
  return saveToLocalDisk(file, localSubfolder)
}

/**
 * Save an advertisement creative image under `vintage-marketplace/advertisements/{adId}`.
 */
export async function saveAdImage(
  file: Express.Multer.File,
  adId?: string,
): Promise<UploadedImage> {
  validateUploadedFile(file)

  const folderName = adId
    ? `vintage-marketplace/advertisements/${adId}`
    : 'vintage-marketplace/advertisements'

  if (env.CLOUDINARY_ENABLED) {
    const buffer = file.buffer
    if (!buffer) {
      throw Object.assign(new Error('No file buffer received for Cloudinary upload.'), {
        statusCode: 400,
      })
    }

    const result = await cloudinaryService.uploadImageBuffer(buffer, {
      folder: folderName,
      tags: ['advertisement', ...(adId ? [adId] : [])],
      transformation: [
        { width: 1920, height: 1080, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
      ],
    })

    return {
      url: result.secureUrl,
      publicId: result.publicId,
      filename: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  }

  const localSubfolder = adId ? `advertisements/${adId}` : 'ads'
  return saveToLocalDisk(file, localSubfolder)
}

/**
 * Save a seller/user profile avatar image under `vintage-marketplace/profiles/{userId}`.
 */
export async function saveProfileImage(
  file: Express.Multer.File,
  userId: string,
): Promise<UploadedImage> {
  validateUploadedFile(file)

  const folderName = `vintage-marketplace/profiles/${userId}`

  if (env.CLOUDINARY_ENABLED) {
    const buffer = file.buffer
    if (!buffer) {
      throw Object.assign(new Error('No file buffer received for Cloudinary upload.'), {
        statusCode: 400,
      })
    }

    const result = await cloudinaryService.uploadImageBuffer(buffer, {
      folder: folderName,
      tags: ['profile', 'avatar', userId],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', fetch_format: 'auto', quality: 'auto' },
      ],
    })

    return {
      url: result.secureUrl,
      publicId: result.publicId,
      filename: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  }

  return saveToLocalDisk(file, `profiles/${userId}`)
}

/**
 * Delete a single listing image by its publicId (Cloudinary public_id or local filename).
 */
export async function deleteListingImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return

  if (env.CLOUDINARY_ENABLED) {
    await cloudinaryService.deleteAsset(publicId)
    return
  }

  // Local disk deletion
  const filePath = path.resolve(process.cwd(), env.UPLOAD_DIR, publicId)
  try {
    await fs.promises.unlink(filePath)
  } catch {
    // Already removed — ignore
  }
}

/**
 * Delete multiple listing images in parallel.
 */
export async function deleteListingImages(
  publicIds: Array<string | null | undefined>,
): Promise<void> {
  const valid = publicIds.filter((id): id is string => !!id)
  if (!valid.length) return

  if (env.CLOUDINARY_ENABLED) {
    await cloudinaryService.deleteAssets(valid)
    return
  }

  await Promise.all(valid.map((id) => deleteListingImage(id)))
}

/**
 * Delete a single ad creative image by its publicId.
 */
export async function deleteAdImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return

  if (env.CLOUDINARY_ENABLED) {
    await cloudinaryService.deleteAsset(publicId)
    return
  }

  const filePath = path.resolve(process.cwd(), env.UPLOAD_DIR, publicId)
  try {
    await fs.promises.unlink(filePath)
  } catch {
    // Already removed — ignore
  }
}

/**
 * Delete a user profile avatar image by its publicId.
 */
export async function deleteProfileImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return

  if (env.CLOUDINARY_ENABLED) {
    await cloudinaryService.deleteAsset(publicId)
    return
  }

  const filePath = path.resolve(process.cwd(), env.UPLOAD_DIR, publicId)
  try {
    await fs.promises.unlink(filePath)
  } catch {
    // Already removed — ignore
  }
}
