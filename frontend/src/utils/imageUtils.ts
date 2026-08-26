import type { SyntheticEvent } from 'react'

// Reliable CDN high-res vintage fallback placeholders by category
const CATEGORY_FALLBACKS: Record<string, string> = {
  electronics:
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
  cameras:
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  fashion:
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  watches:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  'home-decor':
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  collectibles:
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  books:
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
  art:
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  default:
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
}

const DEFAULT_FALLBACK = CATEGORY_FALLBACKS.default

/**
 * Resolves API origin dynamically from environment variable or production Render default
 */
export function getApiOrigin(): string {
  const apiUrl =
    (import.meta.env.VITE_API_URL as string) ||
    'https://vintage-marketplace-6.onrender.com/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

/**
 * Normalizes any image URL (Cloudinary, backend upload, Unsplash, or local fallback)
 * so that it is always loadable by the browser over HTTPS.
 */
export function resolveImageUrl(url?: string | null, category?: string): string {
  if (!url || url.trim() === '' || url === '/placeholder.png') {
    if (category && CATEGORY_FALLBACKS[category.toLowerCase()]) {
      return CATEGORY_FALLBACKS[category.toLowerCase()]
    }
    return DEFAULT_FALLBACK
  }

  const trimmed = url.trim()

  // If local host upload url from dev or old seed data, rewrite to public Render domain in production
  if (trimmed.startsWith('http://localhost:5000/uploads/')) {
    const relativePath = trimmed.replace('http://localhost:5000', '')
    if (import.meta.env.DEV) {
      return relativePath
    }
    return `${getApiOrigin()}${relativePath}`
  }

  // If relative upload path (/uploads/...)
  if (trimmed.startsWith('/uploads/')) {
    if (import.meta.env.DEV) {
      return trimmed
    }
    return `${getApiOrigin()}${trimmed}`
  }

  // If Cloudinary URL, ensure automatic quality and format transforms are applied
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    if (!trimmed.includes('/f_auto,q_auto')) {
      return trimmed.replace('/image/upload/', '/image/upload/f_auto,q_auto,c_limit,w_1200/')
    }
    return trimmed
  }

  return trimmed
}

/**
 * Error event handler for <img> tags.
 * Replaces failed images with a guaranteed reliable fallback Unsplash vintage image.
 */
export function handleImageError(
  e: SyntheticEvent<HTMLImageElement, Event>,
  category?: string,
) {
  const target = e.currentTarget
  const fallback =
    category && CATEGORY_FALLBACKS[category.toLowerCase()]
      ? CATEGORY_FALLBACKS[category.toLowerCase()]
      : DEFAULT_FALLBACK

  // Prevent infinite loop if fallback also errors
  if (target.src !== fallback) {
    target.onerror = null
    target.src = fallback
  }
}
