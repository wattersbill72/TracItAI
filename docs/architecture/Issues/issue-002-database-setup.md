# Issue 002 — Neon Postgres + Drizzle ORM Setup

**Phase:** 0 — Foundation  
**Depends on:** Issue 001  
**Branch:** `feature/issue-002-database-setup`

---

## Objective

Configure Neon Postgres connection, define the full Drizzle ORM schema for all tables defined in the architecture document, generate and apply the initial migration, and create a typed query helper layer.

---

## Acceptance Criteria

- [ ] `npm run db:migrate` applies all migrations to Neon without errors
- [ ] `npm run db:studio` opens Drizzle Studio and all tables are visible
- [ ] All tables from the architecture doc exist with correct columns, types, and constraints
- [ ] `src/server/db/index.ts` exports a typed `db` instance used throughout the app
- [ ] Schema is fully typed — no `any` types anywhere in schema or query files
- [ ] Indexes created as specified

---

## drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit'
import { env } from './src/lib/env'

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './src/server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
```

---

## Full Schema — src/server/db/schema.ts

Implement ALL of the following tables using Drizzle ORM syntax.

### Auth tables
- `users` — id, email, password_hash, name, role (enum: admin|user), is_active, is_system_account, created_at, updated_at
- `refresh_tokens` — id, user_id (FK→users), token_hash, expires_at, created_at, revoked_at
- `invites` — id, email, token_hash, created_by (FK→users), expires_at, used_at, created_at
- `waitlist` — id, email, name, message, status (enum: pending|invited|rejected), created_at, actioned_at
- `password_reset_tokens` — id, user_id (FK→users), token_hash, expires_at, used_at, created_at

### Telemetry
- `telemetry_events` — id, event_type, user_id (nullable FK→users), properties (jsonb), ip_hash, device_type, created_at
- Indexes: event_type, user_id, created_at

### Golf data
- `sessions` — id, user_id (FK→users), type (enum: round|range|short_game), session_date, course_name, arccos_round_id, notes, created_at
- `clips` — id, user_id (FK→users), session_id (nullable FK→sessions), blob_url, filename, duration_seconds, camera_angle (enum: dtl|face_on|unknown), angle_confidence (numeric 4,3), capture_timestamp, gpmf_device_name, transcript, processing_status (enum: pending|processing|complete|failed), created_at
- `shots` — id, user_id (FK→users), session_id (FK→sessions), hole_number, shot_number, club, distance_yards (numeric 6,1), arccos_shot_id, gps_lat (numeric 10,7), gps_lng (numeric 10,7), sg_total, sg_off_tee, sg_approach, sg_around_green, sg_putting (all numeric 5,3), shot_timestamp, created_at
- `shot_clips` — id, shot_id (FK→shots), clip_id (FK→clips), trimmed_blob_url, ball_flight_data (jsonb), pose_landmarks_dtl (jsonb), pose_landmarks_fo (jsonb), created_at
- `shot_tags` — id, shot_id (FK→shots), tag_key, tag_value, source (enum: auto_cv|auto_whisper|auto_nova|user), confidence (numeric 4,3), user_confirmed (boolean nullable), created_at
- `clarification_queue` — id, user_id (FK→users), clip_id (FK→clips), signals (jsonb), suggested_angle, suggested_hole, suggested_shots (jsonb), confidence, resolved_at, resolution (jsonb), created_at

### Indexes to create
```sql
-- Performance indexes
idx_sessions_user_id
idx_clips_user_id, idx_clips_session_id, idx_clips_processing_status
idx_shots_user_id, idx_shots_session_id
idx_shot_tags_shot_id
idx_telemetry_event_type, idx_telemetry_user_id, idx_telemetry_created_at
```

---

## src/server/db/index.ts

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { env } from '../../lib/env'

const sql = neon(env.DATABASE_URL)
export const db = drizzle(sql, { schema })
export type DB = typeof db
```

---

## Package.json scripts to add

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed:admin": "tsx scripts/seed-admin.ts"
  }
}
```

---

## Notes for Claude Code

- Use `pgEnum` for all enum columns — do not use plain `text` with check constraints in Drizzle (the SQL DDL in the architecture doc uses CHECK for readability, but Drizzle should use proper enums)
- All `id` columns use `uuid('id').primaryKey().defaultRandom()`
- All `created_at` columns use `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
- Foreign keys should specify `onDelete: 'cascade'` where noted in architecture doc
- Do not create seed data in this issue — that is Issue 004
