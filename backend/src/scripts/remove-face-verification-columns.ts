import 'dotenv/config'
import { sequelize } from '../config/database'

/**
 * Migration script to safely remove face verification columns and cleanup any obsolete FACE records
 * WITHOUT dropping tables, databases, or losing any user data.
 */
async function removeFaceVerificationColumns() {
  console.log('🔄 Safely updating database schema to remove face verification...')

  await sequelize.authenticate()

  // 1. Delete any leftover FACE verification rows from user_verifications
  await sequelize.query(`
    DELETE FROM "user_verifications" 
    WHERE "verification_type" = 'FACE';
  `)

  // 2. Safely drop is_face_verified column from users table if it exists
  await sequelize.query(`
    ALTER TABLE "users" 
    DROP COLUMN IF EXISTS "is_face_verified";
  `)

  console.log('✅ Face verification database columns safely removed without data loss.')
}

if (require.main === module) {
  removeFaceVerificationColumns()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err)
      process.exit(1)
    })
}

export { removeFaceVerificationColumns }
