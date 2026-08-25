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

/**
 * Safe incremental schema migration helper.
 * Automatically adds newly introduced columns and ENUM values to existing tables
 * so queries never fail with "column does not exist" on live databases.
 */
export async function runAutoMigrations(): Promise<void> {
  try {
    // 1. Ensure listing_images columns exist
    await sequelize.query(`
      ALTER TABLE IF EXISTS "listing_images"
        ADD COLUMN IF NOT EXISTS "width" INTEGER,
        ADD COLUMN IF NOT EXISTS "height" INTEGER,
        ADD COLUMN IF NOT EXISTS "format" VARCHAR(20),
        ADD COLUMN IF NOT EXISTS "bytes" INTEGER,
        ADD COLUMN IF NOT EXISTS "is_cover" BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT NOW();
    `)

    // 2. Ensure advertisements columns exist
    await sequelize.query(`
      ALTER TABLE IF EXISTS "advertisements"
        ADD COLUMN IF NOT EXISTS "image_public_id" VARCHAR(512),
        ADD COLUMN IF NOT EXISTS "image_width" INTEGER,
        ADD COLUMN IF NOT EXISTS "image_height" INTEGER,
        ADD COLUMN IF NOT EXISTS "image_format" VARCHAR(20),
        ADD COLUMN IF NOT EXISTS "image_bytes" INTEGER;
    `)

    // 3. Ensure advertisement ENUM values exist in PostgreSQL
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_advertisements_placement') THEN
          BEGIN
            ALTER TYPE "enum_advertisements_placement" ADD VALUE IF NOT EXISTS 'MARKETPLACE_BANNER';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
          BEGIN
            ALTER TYPE "enum_advertisements_placement" ADD VALUE IF NOT EXISTS 'MARKETPLACE_FEATURED';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
          BEGIN
            ALTER TYPE "enum_advertisements_placement" ADD VALUE IF NOT EXISTS 'MARKETPLACE_SIDEBAR';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_advertisements_status') THEN
          BEGIN
            ALTER TYPE "enum_advertisements_status" ADD VALUE IF NOT EXISTS 'PAYMENT_VERIFIED';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
          BEGIN
            ALTER TYPE "enum_advertisements_status" ADD VALUE IF NOT EXISTS 'APPROVED';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END IF;
      END $$;
    `)

    // 4. Ensure advertisement_events table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "advertisement_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "advertisement_id" UUID NOT NULL REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "event_type" VARCHAR(20) NOT NULL,
        "session_id" VARCHAR(128),
        "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "ip_hash" VARCHAR(64),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    // 5. Ensure conversation_participants table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "conversation_participants" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "last_read_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "idx_conv_participants_unique" UNIQUE ("conversation_id", "user_id")
      );
    `)

    // 6. Ensure user_blocks table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "user_blocks" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "blocker_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "blocked_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "idx_user_blocks_unique" UNIQUE ("blocker_id", "blocked_user_id")
      );
    `)

    // 7. Ensure message extensions (deleted_at, message_type, updated_at) exist
    await sequelize.query(`
      ALTER TABLE IF EXISTS "messages"
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT NOW();

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type') THEN
          ALTER TABLE "messages" ADD COLUMN "message_type" VARCHAR(20) NOT NULL DEFAULT 'TEXT';
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reports_target_type') THEN
          BEGIN
            ALTER TYPE "enum_reports_target_type" ADD VALUE IF NOT EXISTS 'CONVERSATION';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type') THEN
          BEGIN
            ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'MESSAGE';
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END IF;
      END $$;
    `)

    console.log('✅ Incremental schema auto-migrations applied')
  } catch (err) {
    console.warn('⚠️ Auto-migration note:', err)
  }
}

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate()
  console.log('✅ Database connection established (PostgreSQL / Neon)')

  // Run incremental schema migrations for new columns/enums before sync
  await runAutoMigrations()

  try {
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
