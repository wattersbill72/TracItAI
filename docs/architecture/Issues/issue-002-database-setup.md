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

### Course data
- `courses` — id, golf_intelligence_id (text, nullable), name, city, state, country (default 'USA'), total_holes (integer, default 18), is_manually_entered (boolean, default false), created_by (FK→users), created_at
- `course_tees` — id, course_id (FK→courses ON DELETE CASCADE), tee_name, tee_color, total_yards (integer), course_rating (numeric 4,1), slope_rating (integer), created_at. UNIQUE(course_id, tee_name)
- `course_holes` — id, course_id (FK→courses ON DELETE CASCADE), tee_id (FK→course_tees ON DELETE CASCADE), hole_number (integer 1–18), par (integer 3–5), yards (integer), handicap_index (integer 1–18), is_modified (boolean default false), modification_note (text), created_at. UNIQUE(tee_id, hole_number)

### Golf session data
- `sessions` — id, user_id (FK→users), type (enum: round|range|short_game), session_date (date), course_id (nullable FK→courses), tee_id (nullable FK→course_tees), tee_used (text), weather_conditions (text), temperature_f (integer), wind_description (text), notes (text), entry_method (enum: voice|form|both), arccos_round_id (text), created_at
- `hole_summaries` — id, user_id (FK→users), session_id (FK→sessions ON DELETE CASCADE), hole_number (integer 1–18), par (integer), score (integer), fairway_hit (boolean), fairway_miss_direction (enum: left|right, nullable), gir (boolean), putts (integer), penalty_strokes (integer default 0), notes (text), created_at. UNIQUE(session_id, hole_number)
- `clips` — id, user_id (FK→users), session_id (nullable FK→sessions), blob_url, filename, duration_seconds (integer), file_size_bytes (bigint), camera_angle (enum: dtl|face_on|unknown), angle_confidence (numeric 4,3), capture_timestamp (timestamptz), gpmf_device_name (text), transcript (text), transcript_confidence (numeric 4,3), processing_status (enum: pending|processing|complete|failed, default 'pending'), processing_error (text), created_at
- `shots` — id, user_id (FK→users), session_id (FK→sessions), hole_number (integer), shot_number (integer), club (text), distance_yards (numeric 6,1), lie (enum: tee|fairway|rough|deep_rough|sand|recovery|fringe|green), shot_result (enum: fairway|left_rough|right_rough|sand|ob|water|green|holed), shot_shape (enum: straight|draw|fade|hook|slice|push|pull), pin_distance_feet (numeric 6,1), sg_total (numeric 5,3), sg_off_tee (numeric 5,3), sg_approach (numeric 5,3), sg_around_green (numeric 5,3), sg_putting (numeric 5,3), sg_source (enum: calculated|arccos_override|manual, default 'calculated'), entry_method (enum: voice|form|cv_assisted), voice_transcript (text), shot_timestamp (timestamptz), arccos_shot_id (text), created_at
- `shot_clips` — id, shot_id (FK→shots ON DELETE CASCADE), clip_id (FK→clips), trimmed_blob_url (text), trim_start_seconds (numeric 8,3), trim_end_seconds (numeric 8,3), ball_flight_data (jsonb), pose_landmarks_dtl (jsonb), pose_landmarks_fo (jsonb), arc_overlay_blob_url (text), cv_processing_status (enum: pending|queued|processing|complete|failed, default 'pending'), created_at
- `shot_tags` — id, shot_id (FK→shots ON DELETE CASCADE), tag_category (text), tag_key (text), tag_value (text), measured_value (text), source (enum: auto_cv|auto_whisper|auto_nova|user), confidence (numeric 4,3), user_confirmed (boolean nullable), created_at
- `clarification_queue` — id, user_id (FK→users), clip_id (FK→clips), signals (jsonb), suggested_angle (text), suggested_hole (integer), suggested_shots (jsonb), confidence (numeric 4,3), resolved_at (timestamptz), resolution (jsonb), learn_from_resolution (boolean default true), created_at

### SG baseline (Broadie tables — seeded at migration time)
- `sg_baseline` — id, lie (text: tee|fairway|rough|sand|recovery|green), distance_yards (integer), expected_strokes (numeric 5,3). UNIQUE(lie, distance_yards)

### Indexes to create
```sql
-- Auth
idx_refresh_tokens_user_id
-- Telemetry
idx_telemetry_event_type, idx_telemetry_user_id, idx_telemetry_created_at
-- Course data
idx_courses_golf_intelligence_id
-- Sessions
idx_sessions_user_id, idx_sessions_type
-- Clips
idx_clips_user_id, idx_clips_session_id, idx_clips_processing_status
-- Shots
idx_shots_user_id, idx_shots_session_id
-- Shot tags
idx_shot_tags_shot_id
-- Hole summaries
idx_hole_summaries_session_id
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
- Foreign keys should specify `onDelete: 'cascade'` where noted above
- Do not create seed data in this issue — admin seed and SG baseline seed are both in Issue 004
- The `sg_baseline` table is created here (schema + migration) but seeded in Issue 004 via `npm run db:seed:sg-baseline`
- `course_id` and `tee_id` in `sessions` are nullable — range and short_game sessions have no course
- `hole_summaries` has a unique constraint on `(session_id, hole_number)` — one summary row per hole per session
- Drizzle relations: define `relations()` for all FK relationships to enable typed joins
