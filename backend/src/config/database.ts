import { Sequelize } from 'sequelize'
import { env } from './env'

/**
 * Sequelize database connection instance.
 * Supports:
 * 1. Neon PostgreSQL connection string (`DATABASE_URL=postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require`)
 * 2. Individual DB credentials (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
 */
export const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Neon and cloud Postgres instances
        },
      },
      logging: env.isDevelopment ? (sql) => console.log('[DB]', sql) : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      dialectOptions: env.DATABASE_SSL
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
      logging: env.isDevelopment ? (sql) => console.log('[DB]', sql) : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate()
  console.log('✅ Database connection established (PostgreSQL / Neon)')

  try {
    // sync({ alter: true }) in development, sync() in production
    await sequelize.sync({ alter: env.isDevelopment })
    console.log('✅ Database models synchronised')
  } catch (err: any) {
    if (err?.original?.code === '42P07' || err?.name === 'SequelizeDatabaseError') {
      console.warn('⚠️ Index relation already exists during sync. Falling back to standard sync...')
      await sequelize.sync()
      console.log('✅ Database models synchronised')
    } else {
      throw err
    }
  }

  const { seedCategories } = await import('../scripts/seedCategories')
  await seedCategories()

  const { seedListings } = await import('../scripts/seedListings')
  await seedListings()

  const { seedAdmin } = await import('../scripts/seedAdmin')
  await seedAdmin()

  const { seedPlans } = await import('../scripts/seedPlans')
  await seedPlans()
}
