import type { Advertisement, AdPlacement } from '../types/monetization'

export const DEFAULT_CLOUDINARY_CLOUD_NAME = 'vmhpsvzq'

/** Cloud name from Vite env, or extracted once from a Cloudinary secure_url, or fallback to project default. */
let cachedCloudName: string | null =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || DEFAULT_CLOUDINARY_CLOUD_NAME

function extractCloudNameFromUrl(url: string): string | null {
  const match = url.match(/res\.cloudinary\.com\/([^/]+)\//)
  return match?.[1] ?? null
}

function resolveCloudName(fallbackUrl?: string): string {
  if (cachedCloudName) return cachedCloudName
  if (fallbackUrl?.includes('res.cloudinary.com')) {
    const extracted = extractCloudNameFromUrl(fallbackUrl)
    if (extracted) {
      cachedCloudName = extracted
      return extracted
    }
  }
  return DEFAULT_CLOUDINARY_CLOUD_NAME
}

/** Backend API origin (without /api suffix) — used to resolve local upload paths. */
export function resolveApiOrigin(): string {
  const apiUrl =
    (import.meta.env.VITE_API_URL as string) || 'https://vintage-marketplace-6.onrender.com/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

/** Curated high-res vintage ad fallback images by placement */
export const AD_PLACEMENT_FALLBACKS: Record<AdPlacement | 'DEFAULT', string> = {
  MARKETPLACE_BANNER:
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1400&q=85',
  MARKETPLACE_FEATURED:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85',
  MARKETPLACE_SIDEBAR:
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=85',
  DEFAULT:
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=85',
}

export function getFallbackAdImageUrl(placement?: AdPlacement | string): string {
  if (placement && placement in AD_PLACEMENT_FALLBACKS) {
    return AD_PLACEMENT_FALLBACKS[placement as AdPlacement]
  }
  return AD_PLACEMENT_FALLBACKS.DEFAULT
}

function isCloudinaryAsset(ad: Advertisement): boolean {
  if (ad.image?.includes('res.cloudinary.com')) return true
  if (ad.imagePublicId?.startsWith('vintage-marketplace/')) return true
  return false
}

function isLocalUploadUrl(url: string): boolean {
  return (
    (url.includes('/uploads/') || url.includes('localhost:5000')) &&
    !url.includes('cloudinary.com')
  )
}

/** Normalize local or relative upload URLs to an absolute URL the browser can fetch. */
export function resolveAdImageUrl(url: string): string {
  if (!url) return ''

  if (url.includes('localhost:5000/uploads/')) {
    const relativePath = url.replace(/https?:\/\/localhost:5000/, '')
    if (import.meta.env.DEV) return relativePath
    return `${resolveApiOrigin()}${relativePath}`
  }

  const uploadsMatch = url.match(/(\/uploads\/.*)$/)
  if (uploadsMatch) {
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
 * - Public IDs are automatically resolved with default cloud name
 * - Local disk uploads are served from the API origin (/uploads/...)
 * - Fallbacks provide guaranteed display for existing ads
 */
export function buildCloudinaryUrl(ad: Advertisement, width: number = 1200): string {
  const image = ad.image?.trim()
  const publicId = ad.imagePublicId?.trim()
  const transforms = `f_auto,q_auto,w_${width},c_fill`

  // 1. If public ID exists, construct Cloudinary URL directly
  if (publicId) {
    const cloudName = resolveCloudName(image)
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
  }

  if (!image) {
    return getFallbackAdImageUrl(ad.placement)
  }

  // 2. Local disk uploads
  if (isLocalUploadUrl(image)) {
    return resolveAdImageUrl(image)
  }

  // 3. Cloudinary full URL
  if (isCloudinaryAsset(ad)) {
    if (image.includes('cloudinary.com') && image.includes('/upload/')) {
      if (!image.includes('/f_auto,q_auto')) {
        return image.replace('/upload/', `/upload/${transforms}/`)
      }
      return image
    }
  }

  // 4. Absolute external URLs (e.g. Unsplash or direct HTTPS)
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return resolveAdImageUrl(image)
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
