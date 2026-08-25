import { v2 as cloudinary } from 'cloudinary'
import { env } from './env'

if (env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: env.CLOUDINARY_URL,
    secure: true,
  })
} else if (env.CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
} else if (env.isDevelopment) {
  console.warn(
    '[Cloudinary] Credentials not configured — images will fall back to local disk storage. ' +
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env to enable Cloudinary.',
  )
}

export { cloudinary }
