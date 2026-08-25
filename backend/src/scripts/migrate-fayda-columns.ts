import 'dotenv/config'
import { sequelize } from '../config/database'

async function migrateFaydaColumns() {
  console.log('🔄 Checking and applying Fayda columns to user_verifications table...')

  await sequelize.authenticate()

  // Add columns if they do not exist using raw SQL (safe and idempotent)
  await sequelize.query(`
    ALTER TABLE "user_verifications" 
    ADD COLUMN IF NOT EXISTS "fayda_state_token" VARCHAR(128),
    ADD COLUMN IF NOT EXISTS "fayda_state_expires_at" TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS "fayda_subject_hash" VARCHAR(64);
  `)

  // Add unique index on fayda_subject_hash if not exists
  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_verifications_fayda_subject_hash"
    ON "user_verifications" ("fayda_subject_hash")
    WHERE "fayda_subject_hash" IS NOT NULL;
  `)

  console.log('✅ Fayda columns and index verified in database.')
}

if (require.main === module) {
  migrateFaydaColumns()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err)
      process.exit(1)
    })
}

export { migrateFaydaColumns }
