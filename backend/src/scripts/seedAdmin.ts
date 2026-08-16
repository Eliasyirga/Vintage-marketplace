import bcrypt from 'bcryptjs'
import { connectDatabase } from '../config/database'
import User from '../models/User'

export async function seedAdmin(): Promise<void> {
  const adminEmail = 'admin@vintagethiopia.com'
  const adminPassword = 'Admin12345!'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  let admin = await User.findOne({ where: { email: adminEmail } })

  if (!admin) {
    admin = await User.create({
      full_name: 'System Administrator',
      email: adminEmail,
      phone: '+251900000001',
      password_hash: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_fayda_verified: true,
      is_face_verified: true,
    })
    console.log('✅ Admin user created successfully!')
  } else {
    admin.role = 'ADMIN'
    admin.status = 'ACTIVE'
    admin.password_hash = passwordHash
    admin.is_email_verified = true
    await admin.save()
    console.log('✅ Existing admin user updated with ADMIN role and verified status.')
  }

  console.log('\n--- Admin Credentials ---')
  console.log(`Email:    ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log(`Role:     ${admin.role}`)
  console.log('-------------------------\n')
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to seed admin:', err)
      process.exit(1)
    })
}
