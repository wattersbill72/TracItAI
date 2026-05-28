# Issue 004 — Admin Seed Script & Environment Validation

**Phase:** 0 — Foundation  
**Depends on:** Issue 002  
**Branch:** `feature/issue-004-admin-seed`

---

## Objective

Create the one-time admin bootstrap script that seeds the application admin account into Neon Postgres. Also validate that all environment variables are present and correct before any script or server starts.

---

## Acceptance Criteria

- [ ] `npm run db:seed:admin` creates the admin user exactly once — subsequent runs detect existing admin and skip with a clear message
- [ ] Password is bcrypt hashed at cost factor 12 before storage — plaintext never written to DB
- [ ] Admin account has `is_system_account = true` and `role = 'admin'`
- [ ] Script outputs confirmation: email, role, system account flag — never outputs the password or hash
- [ ] Running against an already-seeded DB prints: `Admin account already exists. Skipping.` and exits 0
- [ ] Script fails clearly if `DATABASE_URL` is not set

---

## scripts/seed-admin.ts

```typescript
import bcrypt from 'bcryptjs'
import { db } from '../src/server/db'
import { users } from '../src/server/db/schema'
import { eq } from 'drizzle-orm'

const ADMIN_EMAIL = 'admin@tracitai.com'
// Password sourced from environment at seed time
// Set ADMIN_SEED_PASSWORD in your local .env before running
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD

async function seedAdmin() {
  if (!ADMIN_PASSWORD) {
    console.error('ERROR: ADMIN_SEED_PASSWORD environment variable not set')
    process.exit(1)
  }

  // Check if admin already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1)

  if (existing.length > 0) {
    console.log('Admin account already exists. Skipping.')
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const [admin] = await db
    .insert(users)
    .values({
      email: ADMIN_EMAIL,
      passwordHash,
      name: 'TracItAI Admin',
      role: 'admin',
      isActive: true,
      isSystemAccount: true,
    })
    .returning({ id: users.id, email: users.email, role: users.role })

  console.log('✅ Admin account created:')
  console.log(`   Email: ${admin.email}`)
  console.log(`   Role: ${admin.role}`)
  console.log(`   ID: ${admin.id}`)
  console.log(`   System account: true`)
  console.log('')
  console.log('⚠️  IMPORTANT: Remove the admin password from ARCHITECTURE.md now.')
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
```

---

## How to run

```bash
# Set the password in your shell (do not add to .env file)
ADMIN_SEED_PASSWORD="ThisIsTracItAIBills1stGolfApp" npm run db:seed:admin
```

---

## .env.example additions

Add to `.env.example`:
```bash
# Admin seed — only needed for initial setup, never commit actual value
# Run: ADMIN_SEED_PASSWORD="your-password" npm run db:seed:admin
ADMIN_SEED_PASSWORD=
```

---

## Validation utility — src/lib/env.ts additions

Ensure the env validation schema is complete per the architecture document. The app should fail fast at startup if any required variable is missing — not at the point of first use.

Add a `validateEnv()` function that is called:
1. At the top of every Vercel Function handler
2. In `vite.config.ts` at build time for client-exposed vars

---

## Notes for Claude Code

- Use `tsx` to run the script: `tsx scripts/seed-admin.ts`
- Add `tsx` as a dev dependency if not already present
- The plaintext password `ThisIsTracItAIBills1stGolfApp` must never appear in any source file, migration, or log — only in this architecture document (which Bill will sanitize) and passed via env var at runtime
- After seeding, Bill will log in as admin, create his personal account, grant it admin role via the Admin Console, then change the bootstrap admin password or deactivate it
