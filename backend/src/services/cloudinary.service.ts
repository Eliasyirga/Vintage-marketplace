/**
 * Cloudinary service for image upload, optimization transformations, and deletion.
 *
 * Provides:
 *  - uploadImageBuffer: stream a Multer memory-buffer directly to Cloudinary
 *  - getOptimizedUrl: generate responsive, auto-formatted CDN delivery URLs
 *  - deleteAsset: destroy a single Cloudinary asset by publicId
 *  - deleteAssets: bulk-destroy multiple assets
 *
 * Falls back gracefully to local storage when Cloudinary is not configured.
 */

import { Readable } from 'stream'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { cloudinary } from '../config/cloudinary'
import { env } from '../config/env'

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface ImageTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale'
  gravity?: 'auto' | 'face' | 'center'
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  format?: 'auto' | 'webp' | 'png' | 'jpg'
}

/**
 * Upload an image buffer to Cloudinary using stream upload.
 * Uses memory-efficient piping — the buffer is never written to disk.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: {
    folder: string
    resourceType?: 'image' | 'auto'
    tags?: string[]
    transformation?: Record<string, unknown>[]
  },
): Promise<CloudinaryUploadResult> {
  if (!env.CLOUDINARY_ENABLED) {
    throw Object.assign(
      new Error(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your backend .env.',
      ),
      { statusCode: 500 },
    )
  }

  // Default transformations for optimized marketplace delivery (auto-format, auto-quality)
  const defaultTransformation: Record<string, unknown>[] = [
    { fetch_format: 'auto', quality: 'auto' },
  ]

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType ?? 'image',
        tags: options.tags ?? [],
        transformation: options.transformation ?? defaultTransformation,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          const message = error?.message || 'Cloudinary upload stream failed'
          console.error('[Cloudinary Error]', message)
          reject(Object.assign(new Error(`Image upload failed: ${message}`), { statusCode: 502 }))
          return
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        })
      },
    )

    const readable = Readable.from(buffer)
    readable.on('error', (err) => {
      console.error('[Cloudinary Stream Pipe Error]', err)
      reject(Object.assign(new Error('Failed to read image stream for upload.'), { statusCode: 500 }))
    })
    readable.pipe(uploadStream)
  })
}

/**
 * Generate an optimized Cloudinary delivery URL with dynamic transformations.
 * If Cloudinary is not configured or input is already an absolute non-Cloudinary URL,
 * returns the original URL.
 */
export function getOptimizedUrl(
  publicIdOrUrl: string,
  options: ImageTransformOptions = {},
): string {
  if (!publicIdOrUrl) return ''

  // If it's a local/relative URL or Cloudinary is not enabled, return original
  if (!env.CLOUDINARY_ENABLED || !publicIdOrUrl.includes('cloudinary.com')) {
    return publicIdOrUrl
  }

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
  } = options

  const transformations: string[] = [
    `f_${format}`,
    `q_${quality}`,
  ]

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop && (width || height)) transformations.push(`c_${crop}`)
  if (gravity && (crop === 'fill' || crop === 'thumb')) transformations.push(`g_${gravity}`)

  const transformString = transformations.join(',')

  // Inject transformation segment into Cloudinary URL
  return publicIdOrUrl.replace('/upload/', `/upload/${transformString}/`)
}

/**
 * Delete a single asset from Cloudinary by its public_id.
 * Safe to call with null/undefined — simply returns without error.
 */
export async function deleteAsset(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !env.CLOUDINARY_ENABLED) return
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true })
  } catch (err) {
    // Non-fatal: log and continue so a CDN deletion failure never blocks DB operations
    console.error(`[Cloudinary] Failed to delete asset "${publicId}":`, err)
  }
}

/**
 * Delete multiple Cloudinary assets in parallel.
 */
export async function deleteAssets(publicIds: Array<string | null | undefined>): Promise<void> {
  const valid = publicIds.filter((id): id is string => !!id)
  if (!valid.length || !env.CLOUDINARY_ENABLED) return
  await Promise.all(valid.map((id) => deleteAsset(id)))
}
