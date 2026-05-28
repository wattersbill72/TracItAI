# Issue 004 — Admin Seed Script & Environment Validation

**Phase:** 0 — Foundation  
**Depends on:** Issue 002  
**Branch:** `feature/issue-004-admin-seed`

---

## Objective

Create (1) the one-time admin bootstrap script that seeds the application admin account into Neon Postgres, and (2) the SG baseline seed that populates the `sg_baseline` table with Mark Broadie's published expected-strokes lookup values. Also validate that all environment variables are present and correct before any script or server starts.

---

## Acceptance Criteria

- [ ] `npm run db:seed:admin` creates the admin user exactly once — subsequent runs detect existing admin and skip with a clear message
- [ ] Password is bcrypt hashed at cost factor 12 before storage — plaintext never written to DB
- [ ] Admin account has `is_system_account = true` and `role = 'admin'`
- [ ] Script outputs confirmation: email, role, system account flag — never outputs the password or hash
- [ ] Running against an already-seeded DB prints: `Admin account already exists. Skipping.` and exits 0
- [ ] Script fails clearly if `DATABASE_URL` is not set
- [ ] `npm run db:seed:sg-baseline` populates the `sg_baseline` table with Broadie's expected-strokes values for all lie/distance combinations
- [ ] SG baseline seed is idempotent — re-running does not duplicate rows (upsert on conflict)
- [ ] Baseline covers all lie types: tee, fairway, rough, sand, recovery, green
- [ ] Baseline covers distances from 0 to 600 yards (at meaningful intervals per lie type)

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

## scripts/seed-sg-baseline.ts

Populate the `sg_baseline` table with Broadie's published expected-strokes lookup values from *Every Shot Counts* (2014 + updates). These are widely reproduced and accurate to within 10% for amateur rounds.

The seed script embeds the baseline values as a TypeScript constant and upserts them using Drizzle's `onConflictDoUpdate`. Do not fetch from an external source — the values are a well-known constant.

```typescript
import { db } from '../src/server/db'
import { sgBaseline } from '../src/server/db/schema'
import { sql } from 'drizzle-orm'

// Broadie baseline: expected strokes to hole out from (lie, distance_yards)
// Source: Every Shot Counts (2014) + PGA ShotLink updates
// Format: [lie, distance_yards, expected_strokes]
const BROADIE_BASELINE: [string, number, number][] = [
  // Tee
  ['tee', 100, 2.72], ['tee', 150, 2.94], ['tee', 175, 3.03],
  ['tee', 200, 3.12], ['tee', 225, 3.22], ['tee', 250, 3.32],
  ['tee', 275, 3.41], ['tee', 300, 3.50], ['tee', 350, 3.68],
  ['tee', 400, 3.86], ['tee', 450, 4.04], ['tee', 500, 4.22],
  ['tee', 550, 4.39], ['tee', 600, 4.55],
  // Fairway
  ['fairway', 10, 2.40], ['fairway', 20, 2.60], ['fairway', 30, 2.75],
  ['fairway', 50, 2.91], ['fairway', 75, 3.04], ['fairway', 100, 3.17],
  ['fairway', 125, 3.28], ['fairway', 150, 3.39], ['fairway', 175, 3.50],
  ['fairway', 200, 3.60], ['fairway', 225, 3.71], ['fairway', 250, 3.82],
  // Rough
  ['rough', 10, 2.50], ['rough', 20, 2.65], ['rough', 30, 2.82],
  ['rough', 50, 3.00], ['rough', 75, 3.16], ['rough', 100, 3.30],
  ['rough', 125, 3.43], ['rough', 150, 3.56], ['rough', 175, 3.69],
  ['rough', 200, 3.81], ['rough', 225, 3.93], ['rough', 250, 4.05],
  // Sand
  ['sand', 5, 2.57], ['sand', 10, 2.60], ['sand', 20, 2.73],
  ['sand', 30, 2.88], ['sand', 50, 3.09], ['sand', 75, 3.33],
  ['sand', 100, 3.56], ['sand', 125, 3.76], ['sand', 150, 3.96],
  // Recovery
  ['recovery', 10, 2.83], ['recovery', 20, 3.04], ['recovery', 30, 3.22],
  ['recovery', 50, 3.55], ['recovery', 75, 3.92], ['recovery', 100, 4.27],
  // Green (distance in yards, 1 yard = 3 feet)
  ['green', 1, 1.83], ['green', 2, 1.94], ['green', 3, 2.02],
  ['green', 5, 2.14], ['green', 8, 2.26], ['green', 10, 2.33],
  ['green', 15, 2.43], ['green', 20, 2.51], ['green', 25, 2.57],
  ['green', 30, 2.63], ['green', 40, 2.72], ['green', 50, 2.80],
  ['green', 60, 2.88],
]

async function seedSGBaseline() {
  console.log(`Seeding ${BROADIE_BASELINE.length} SG baseline entries...`)
  await db
    .insert(sgBaseline)
    .values(
      BROADIE_BASELINE.map(([lie, distanceYards, expectedStrokes]) => ({
        lie,
        distanceYards,
        expectedStrokes: expectedStrokes.toString(),
      }))
    )
    .onConflictDoUpdate({
      target: [sgBaseline.lie, sgBaseline.distanceYards],
      set: { expectedStrokes: sql`excluded.expected_strokes` },
    })
  console.log('SG baseline seeded successfully.')
  process.exit(0)
}

seedSGBaseline().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
```

Add to `package.json`:
```json
"db:seed:sg-baseline": "tsx scripts/seed-sg-baseline.ts"
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
