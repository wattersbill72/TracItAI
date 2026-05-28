# Requirements — Issue 002: Neon Postgres + Drizzle ORM Setup

**Issue:** 002  
**Branch:** feature/issue-002  
**Phase:** 0 — Foundation  
**Depends on:** Issue 001 (project scaffold)

---

## Objective

Configure the full Drizzle ORM schema for all tables, generate the initial migration, and provide a typed `db` instance. Fix `index.ts` to use `env.DATABASE_URL` instead of raw `process.env`.

---

## Scope

1. **`src/server/db/schema.ts`** — Full schema: all tables, pgEnums, indexes, unique constraints, and Drizzle relations.
2. **`src/server/db/index.ts`** — Fix to use `env.DATABASE_URL` instead of `process.env.DATABASE_URL!`.
3. **`drizzle.config.ts`** — Update to use `env.DATABASE_URL` per spec.
4. **`src/server/db/migrations/`** — Initial migration SQL generated via drizzle-kit generate.

---

## Tables to implement

### Auth (extend existing)
- `users` — convert `role` from inline text enum to `pgEnum`
- `refresh_tokens` — add `idx_refresh_tokens_user_id` index
- `invites` — unchanged
- `waitlist` — convert `status` from inline text enum to `pgEnum`
- `password_reset_tokens` — unchanged

### Telemetry (new)
- `telemetry_events` — with event_type, user_id (nullable FK), properties (jsonb), ip_hash, device_type. Indexes: event_type, user_id, created_at

### Course data (new)
- `courses` — with golf_intelligence_id index
- `course_tees` — UNIQUE(course_id, tee_name)
- `course_holes` — UNIQUE(tee_id, hole_number)

### Golf session data (new)
- `sessions` — indexes: user_id, type
- `hole_summaries` — UNIQUE(session_id, hole_number), index: session_id
- `clips` — indexes: user_id, session_id, processing_status
- `shots` — indexes: user_id, session_id
- `shot_clips`
- `shot_tags` — index: shot_id
- `clarification_queue`

### SG Baseline (new)
- `sg_baseline` — UNIQUE(lie, distance_yards). Seeded in Issue 004.

---

## Enum strategy

Use `pgEnum` for all enum columns per issue spec. Named enums:
- `roleEnum`: `admin | user`
- `waitlistStatusEnum`: `pending | invited | rejected`
- `sessionTypeEnum`: `round | range | short_game`
- `sessionEntryMethodEnum`: `voice | form | both` (for sessions table)
- `shotEntryMethodEnum`: `voice | form | cv_assisted` (for shots table)
- `cameraAngleEnum`: `dtl | face_on | unknown`
- `clipProcessingStatusEnum`: `pending | processing | complete | failed`
- `lieEnum`: tee | fairway | rough | deep_rough | sand | recovery | fringe | green
- `shotResultEnum`: fairway | left_rough | right_rough | sand | ob | water | green | holed
- `shotShapeEnum`: straight | draw | fade | hook | slice | push | pull
- `sgSourceEnum`: `calculated | arccos_override | manual`
- `cvProcessingStatusEnum`: `pending | queued | processing | complete | failed`
- `tagSourceEnum`: `auto_cv | auto_whisper | auto_nova | user`
- `fairwayMissDirectionEnum`: `left | right`

---

## drizzle.config.ts note

The spec imports from `env.ts` which validates ALL env vars. Running `drizzle-kit generate` requires the TypeScript module to load, so all env vars must be set. Use `dotenv-cli` or set vars in shell before running db commands locally:
```
DATABASE_URL=<your-neon-url> npm run db:migrate
```

---

## Decisions

- `bigint('file_size_bytes', { mode: 'number' })` for clips.file_size_bytes — JS number is sufficient for video file sizes.
- `date('session_date')` for sessions — date-only, no time component needed.
- `sg_baseline.lie` uses `text` (not pgEnum) per spec — the SG engine references these as string values.
- Drizzle `relations()` defined for all FK relationships to enable typed joins.
- No seed data in this issue — admin and SG baseline seeds are Issue 004.

---

## Acceptance Criteria

- [x] All tables from architecture doc exist with correct columns, types, constraints
- [x] `src/server/db/index.ts` exports typed `db` using `env.DATABASE_URL`
- [x] Schema fully typed — no `any` types
- [x] pgEnum used for all enum columns
- [x] All specified indexes created
- [x] Drizzle relations defined for all FK relationships
- [x] Migration generated in `src/server/db/migrations/`
- [ ] `npm run db:migrate` applies migrations (user runs with DATABASE_URL set)
