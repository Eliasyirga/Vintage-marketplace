import 'dotenv/config'
import { sequelize } from '../config/database'

async function cleanAll() {
  await sequelize.authenticate()
  console.log('✅ Connected to DB. Cleaning any localhost/broken URLs across all tables...')

  const [res1] = await sequelize.query(`
    UPDATE listing_images 
    SET url = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80' 
    WHERE url LIKE '%localhost%' OR url LIKE '%127.0.0.1%'
  `)
  console.log('Listing images updated:', res1)

  const [res2] = await sequelize.query(`
    UPDATE advertisements 
    SET image = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' 
    WHERE image LIKE '%localhost%' OR image LIKE '%127.0.0.1%'
  `)
  console.log('Advertisements updated:', res2)

  const [res3] = await sequelize.query(`
    UPDATE users 
    SET avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' 
    WHERE avatar_url LIKE '%localhost%' OR avatar_url LIKE '%127.0.0.1%'
  `)
  console.log('Users updated:', res3)

  console.log('🎉 Done!')
  process.exit(0)
}

cleanAll().catch((err) => {
  console.error(err)
  process.exit(1)
})
