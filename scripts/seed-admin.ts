import { db } from '../src/server/db/index'
import { users } from '../src/server/db/schema'
import bcrypt from 'bcryptjs'

async function seedAdmin() {
  const password = process.env.ADMIN_SEED_PASSWORD
  if (!password) throw new Error('ADMIN_SEED_PASSWORD env var required')

  const passwordHash = await bcrypt.hash(password, 12)

  await db
    .insert(users)
    .values({
      email: 'admin@tracitai.com',
      passwordHash,
      name: 'Admin',
      role: 'admin',
      isSystemAccount: true,
    })
    .onConflictDoNothing()

  console.log('Admin seeded: admin@tracitai.com')
}

seedAdmin().catch(console.error)
