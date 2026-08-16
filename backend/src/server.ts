import 'dotenv/config'
import app from './app'
import { connectDatabase } from './config/database'
// Import models so Sequelize registers them before sync
import { env } from './config/env'
import { seedAdvertisementPlans } from './scripts/seed-ad-plans'

async function start(): Promise<void> {
  try {
    await connectDatabase()
    await seedAdvertisementPlans()

    app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${env.PORT}`)
      console.log(`   Environment: ${env.NODE_ENV}`)
      console.log(`   Health:      http://localhost:${env.PORT}/api/health\n`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()
