import 'dotenv/config'
import http from 'http'
import app from './app'
import { connectDatabase } from './config/database'
import { env } from './config/env'
import { seedAdvertisementPlans } from './scripts/seed-ad-plans'
import { initSocketServer } from './socket/socket.service'

async function start(): Promise<void> {
  try {
    await connectDatabase()
    await seedAdvertisementPlans()

    const server = http.createServer(app)
    initSocketServer(server)

    // Periodic cleanup of expired item reservations (every 60s)
    setInterval(async () => {
      try {
        const { cleanupExpiredReservations } = await import('./services/order.service')
        await cleanupExpiredReservations()
      } catch (err) {
        console.error('⚠️ [Cron] Reservation cleanup error:', err)
      }
    }, 60 * 1000)

    server.listen(env.PORT, () => {
      console.log(`\n🚀 Server & Socket.IO running on http://localhost:${env.PORT}`)
      console.log(`   Environment: ${env.NODE_ENV}`)
      console.log(`   Health:      http://localhost:${env.PORT}/api/health\n`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()
