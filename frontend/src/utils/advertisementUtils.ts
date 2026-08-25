import type { Advertisement } from '../types/monetization'

/** Cloud name from Vite env, or extracted once from a Cloudinary secure_url. */
let cachedCloudName: string | null = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null

function extractCloudNameFromUrl(url: string): string | null {
  const match = url.match(/res\.cloudinary\.com\/([^/]+)\//)
  return match?.[1] ?? null
}

function resolveCloudName(fallbackUrl?: string): string | null {
  if (cachedCloudName) return cachedCloudName
  if (fallbackUrl?.includes('res.cloudinary.com')) {
    cachedCloudName = extractCloudNameFromUrl(fallbackUrl)
  }
  return cachedCloudName
}

/** Backend API origin (without /api suffix) — used to resolve local upload paths. */
function resolveApiOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

function isCloudinaryAsset(ad: Advertisement): boolean {
  if (ad.image?.includes('res.cloudinary.com')) return true
  if (ad.imagePublicId?.startsWith('vintage-marketplace/')) return true
  return false
}

function isLocalUploadUrl(url: string): boolean {
  return url.includes('/uploads/') && !url.includes('cloudinary.com')
}

/** Normalize local or relative upload URLs to an absolute URL the browser can fetch. */
export function resolveAdImageUrl(url: string): string {
  if (!url) return url

  const uploadsMatch = url.match(/(\/uploads\/.*)$/)
  if (uploadsMatch) {
    // In dev, serve via Vite proxy (/uploads → API server)
    if (import.meta.env.DEV) return uploadsMatch[1]
    return `${resolveApiOrigin()}${uploadsMatch[1]}`
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${resolveApiOrigin()}${url}`
  return url
}

/**
 * Build a display URL for an advertisement image.
 * - Cloudinary assets get optimized delivery transforms
 * - Local disk uploads are served from the API origin (/uploads/...)
 * - External URLs (e.g. seed data) are returned unchanged
 */
export function buildCloudinaryUrl(ad: Advertisement, width: number = 1200): string {
  const image = ad.image?.trim()
  if (!image) return ''

  // Local disk uploads must never be routed through Cloudinary
  if (isLocalUploadUrl(image)) {
    return resolveAdImageUrl(image)
  }

  const transforms = `f_auto,q_auto,w_${width},c_fill`

  if (isCloudinaryAsset(ad)) {
    if (ad.imagePublicId) {
      const cloudName = resolveCloudName(image)
      if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${ad.imagePublicId}`
      }
    }

    if (image.includes('cloudinary.com') && image.includes('/upload/')) {
      return image.replace('/upload/', `/upload/${transforms}/`)
    }
  }

  return image
}

/** Derive CTA label from the advertisement destination URL. */
export function getAdCtaText(targetUrl: string): string {
  const lower = (targetUrl || '').toLowerCase()
  if (lower.includes('/listings/') || lower.includes('/listing/')) return 'View Product'
  if (lower.includes('/seller/') || lower.includes('/store/')) return 'View Store'
  if (lower.includes('/shop')) return 'Shop Now'
  if (lower.includes('/advertise')) return 'Advertise Now'
  return 'Learn More'
}

/** Whether the URL is a safe internal marketplace route. */
export function isInternalAdUrl(targetUrl: string): boolean {
  if (!targetUrl) return false
  if (targetUrl.startsWith('/')) return true
  try {
    const parsed = new URL(targetUrl)
    return parsed.pathname.startsWith('/listings/') ||
      parsed.pathname.startsWith('/listing/') ||
      parsed.pathname.startsWith('/seller/') ||
      parsed.pathname.startsWith('/store/') ||
      parsed.pathname.startsWith('/advertise')
  } catch {
    return false
  }
}

/** Normalize to a path suitable for React Router `<Link>`. */
export function getInternalAdPath(targetUrl: string): string {
  if (targetUrl.startsWith('/')) return targetUrl
  try {
    const parsed = new URL(targetUrl)
    return parsed.pathname + parsed.search + parsed.hash
  } catch {
    return targetUrl
  }
}
