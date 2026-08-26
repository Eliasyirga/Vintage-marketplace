import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import { env } from './config/env'
import { globalLimiter } from './middleware/rateLimit.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import accountRoutes from './routes/account.routes'
import categoryRoutes from './routes/category.routes'
import listingRoutes from './routes/listing.routes'
import sellerRoutes from './routes/seller.routes'
import favoriteRoutes from './routes/favorite.routes'
import recentlyViewedRoutes from './routes/recentlyViewed.routes'
import conversationRoutes from './routes/conversation.routes'
import reviewRoutes from './routes/review.routes'
import reportRoutes from './routes/report.routes'
import verificationRoutes from './routes/verification.routes'
import adminRoutes from './routes/admin.routes'
import recommendationRoutes from './routes/recommendation.routes'
import paymentRoutes from './routes/payment.routes'
import monetizationRoutes from './routes/monetization.routes'
import advertisementRoutes from './routes/advertisement.routes'
import businessRoutes from './routes/business.routes'
import transactionRoutes from './routes/transaction.routes'
import sellerAnalyticsRoutes from './routes/sellerAnalytics.routes'
import orderRoutes from './routes/order.routes'
import deliveryRoutes from './routes/delivery.routes'
import meetingRoutes from './routes/meeting.routes'
import { requireAuth } from './middleware/auth.middleware'
import * as listingController from './controllers/listing.controller'
import * as sellerController from './controllers/seller.controller'
import { ensureUploadDirectory } from './services/upload.service'

const app = express()

// ── Security headers ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // allow cookies (refresh tokens)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// ── Request parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })) // body size limit
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Logging ────────────────────────────────────────────────────────────────
if (env.isDevelopment) {
  app.use(morgan('dev'))
}

// ── Global rate limit ──────────────────────────────────────────────────────
app.use(globalLimiter)

// ── Static uploads (local dev / fallback storage) ───────────────────────────
ensureUploadDirectory()
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)))

// ── Health check & Root endpoint ───────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Vintage Marketplace Backend API is live',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Vintage Marketplace API is running',
    timestamp: new Date().toISOString(),
  })
})

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/listings', listingRoutes)
app.get('/api/my-listings', requireAuth, listingController.getMyListings)

// ── Buyer routes ───────────────────────────────────────────────────────────
app.use('/api/favorites', favoriteRoutes)
app.use('/api/recently-viewed', recentlyViewedRoutes)
app.use('/api/conversations', conversationRoutes)

// ── Seller routes ─────────────────────────────────────────────────────────
app.use('/api/sellers', sellerRoutes)
app.get('/api/seller/profile', requireAuth, sellerController.getMyProfile)
app.patch('/api/seller/profile', requireAuth, sellerController.updateMyProfile)
app.use('/api/seller/analytics', sellerAnalyticsRoutes)

// ── Monetization & Marketplace Platform routes ────────────────────────────
app.use('/api/orders', orderRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/monetization', monetizationRoutes)
app.use('/api/advertisements', advertisementRoutes)
app.use('/api/business', businessRoutes)
app.use('/api/transactions', transactionRoutes)

// ── Trust & Safety routes ─────────────────────────────────────────────────
app.use('/api/reviews', reviewRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/verifications', verificationRoutes)

// ── Recommendation routes ─────────────────────────────────────────────────
app.use('/api/recommendations', recommendationRoutes)

// ── Admin routes (every endpoint enforces ADMIN role server-side) ──────────
app.use('/api/admin', adminRoutes)

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorMiddleware)

export default app
