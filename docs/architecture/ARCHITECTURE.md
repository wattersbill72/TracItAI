# TracItAI — Application Architecture Document

**Version:** 1.1  
**Date:** May 28, 2026  
**Author:** Bill (Founder) — Architecture by Sr. Application Architect session  
**Status:** Approved for Development  
**Changelog v1.1:** Removed Arccos API dependency. Added Golf Intelligence course API, dual-mode shot entry (voice + form), built-in SG calculation engine, course/hole schema.

---

## ⚠️ SECURITY NOTICE — READ BEFORE SHARING THIS DOCUMENT

This document contains the bootstrap admin credential below. **Remove it immediately after first login and account setup.**

| Role | Email | Password |
|---|---|---|
| Application Admin | `admin@tracitai.com` | `ThisIsTracItAIBills1stGolfApp` |

**Delete this table from this file once the admin account is created and a personal admin account is established.**

---

## 1. Product Overview

**TracItAI** is a golf performance analytics web application that combines GoPro video footage with manually entered round data to deliver automated swing analysis, shot tracing, and multi-round coaching insights. The application uses computer vision (MediaPipe pose estimation, TrackNet ball tracking), speech transcription (Whisper), and LLM-powered metadata extraction (AWS Bedrock Nova) to produce a self-coaching dataset that improves with every round.

Shot data is entered via two parallel methods: **voice spoken into the GoPro mic** (transcribed automatically by Whisper, structured by Nova) and **a post-round scorecard form** (mobile-friendly, designed for the 19th hole). Both methods are first-class — neither is a fallback.

Strokes gained is calculated in-app using Mark Broadie's published baseline lookup tables. Arccos SG data can be manually entered as an override if available. The Arccos API integration is architected for future addition when API access becomes available.

Course data is sourced from the Golf Intelligence API (search free, scorecard pull cached permanently). Manual entry with hole-level overrides handles courses not in the database or temporary conditions (tee under repair, temporary greens, etc.).

### Core feature modules

| Module | Description |
|---|---|
| **Course Library** | Golf Intelligence API search + manual entry, cached per course/tee |
| **Round Setup** | Create round, select course/tee, select session cameras |
| **Shot Entry — Voice** | Whisper transcribes GoPro audio → Nova extracts structured shot data |
| **Shot Entry — Form** | Post-round scorecard form, hole-by-hole, mobile-optimized |
| **Clip Import** | Upload GoPro clips, auto-classify angle/hole/shot via GPMF + Whisper + Nova |
| **CV Processing** | MediaPipe swing analysis + TrackNet ball flight, run async on Modal |
| **Shot Review** | Per-shot video player with traced arc overlay and auto-detected tag panel |
| **SG Calculator** | Built-in Broadie baseline engine — calculates SG per shot and per category |
| **Range Sessions** | Standalone practice session logging without round data |
| **Short Game** | Chipping and putting session tracking with distinct camera angles |
| **Trends Dashboard** | Multi-round patterns, root cause correlations, strokes gained overlays |
| **Admin Console** | User management, telemetry, waitlist/invite management |
| **Landing Page** | Public-facing promotional page with waitlist and invite signup |

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Notes |
|---|---|---|
| Framework | Vite + React + TypeScript | Same pattern as principal-track app |
| Styling | Tailwind CSS | Responsive — desktop, iPad, iPhone |
| State | Zustand | Lightweight, no Redux overhead |
| Data fetching | TanStack Query | Server state, caching, polling for async jobs |
| Routing | React Router v7 | Public routes + protected routes |
| Forms | React Hook Form + Zod | Validation schema shared with API |
| Charts | Recharts | Trends dashboard, telemetry |

### Backend / API
| Layer | Technology | Notes |
|---|---|---|
| Hosting | Vercel | Pro plan — Fluid compute, extended function duration |
| API routes | Vercel Functions (Node.js/Python) | TypeScript for most; Python for GPMF + FFmpeg functions |
| Auth | Custom JWT + Neon Postgres | IAM-aware, role-based, no third-party auth vendor |
| Email | Resend | Transactional — invites, password reset, waitlist confirmation |
| Video storage | Vercel Blob | Raw clips + processed segments; migrate to S3/Azure later |
| Database | Neon Postgres (Serverless) | All structured data |
| ORM | Drizzle ORM | Type-safe, Neon-native, schema-as-code |

### AI / Processing Services
| Service | Provider | Purpose |
|---|---|---|
| Transcription | OpenAI Whisper API | Audio extraction → transcript from GoPro clips |
| Metadata extraction | AWS Bedrock Nova Lite | Structured JSON from transcripts (hole, club, distance, conditions) |
| Coaching insights | AWS Bedrock Nova Pro | Multi-round pattern analysis, root cause correlations |
| CV processing | Modal (serverless CPU) | MediaPipe pose landmarks + TrackNet ball tracking |
| Course data | Golf Intelligence API | Course search (free) + scorecard pull (1 credit, cached) |
| SG calculation | Built-in (Broadie tables) | Expected strokes lookup table — no external API |

### Future integration (not in v1)
| Service | Notes |
|---|---|
| Arccos On-Course Data API | Schema and architecture ready — add when API access granted |

---

## 3. IAM — Identity & Access Management

### Philosophy
TracItAI implements a custom IAM layer backed by Neon Postgres. No third-party auth vendor (Auth0, Clerk, Supabase Auth) is used — this keeps the architecture portable, cost-free at personal scale, and under full control for future multi-tenancy. Passwords are hashed with **bcrypt (cost factor 12)**. Sessions use signed **JWT access tokens (15 min TTL)** and **refresh tokens (30 day TTL, stored in httpOnly cookies)**.

### Roles

| Role | Code | Description |
|---|---|---|
| Application Admin | `admin` | Full system access. Manages users, views telemetry, sends invites, approves waitlist. Cannot be self-service created — seeded only. |
| Standard User | `user` | Access to own data only. Full access to all golf feature modules. |

> **Multi-user readiness:** The schema and middleware are designed for row-level data isolation from day one. Every data table includes a `user_id` foreign key. API routes enforce ownership checks on every query. Adding new roles (e.g. `coach`, `readonly`) requires only a schema enum addition and middleware update.

### Auth Flows

#### 1. Waitlist signup (public)
```
User submits email on landing page
  → POST /api/auth/waitlist
  → Insert into waitlist table (email, created_at, status: 'pending')
  → Send confirmation email via Resend
  → Admin reviews waitlist in Admin Console
  → Admin approves → generates invite token → sends invite email
```

#### 2. Invite-based account creation
```
Admin sends invite (or user uses invite link)
  → GET /invite/[token] — validates token, not expired (48hr TTL)
  → User fills name + password
  → POST /api/auth/register
  → Creates user record, hashes password, marks invite used
  → Issues JWT + refresh token
  → Redirects to dashboard
```

#### 3. Login
```
POST /api/auth/login (email + password)
  → bcrypt.compare()
  → Issue JWT (15min) + refresh token (30 day, httpOnly cookie)
  → Return user profile + role
```

#### 4. Token refresh
```
POST /api/auth/refresh
  → Reads httpOnly refresh token cookie
  → Validates against DB (rotation: old token invalidated on use)
  → Issues new JWT + new refresh token
```

#### 5. Password reset (self-service)
```
User requests reset → POST /api/auth/forgot-password (email)
  → Generate reset token (32 byte random, 1hr TTL)
  → Store hashed token in password_reset_tokens table
  → Send email via Resend with reset link
  → User clicks link → GET /reset-password/[token]
  → POST /api/auth/reset-password (token + new password)
  → Invalidate all refresh tokens for user (force re-login everywhere)
```

#### 6. Admin bootstrap (one-time seed)
```
npm run db:seed:admin
  → Creates admin@tracitai.com with hashed password
  → Role: 'admin'
  → Marked as system account (cannot be deleted via UI)
```

### Database Schema — Auth Tables

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_account BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actioned_at TIMESTAMPTZ
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Application Telemetry

### Telemetry events captured

| Event | Trigger | Data captured |
|---|---|---|
| `page_view` | Route change | path, user_id (if authed), device_type, timestamp |
| `auth.login` | Successful login | user_id, ip_hash, timestamp |
| `auth.login_failed` | Failed login attempt | email_hash, ip_hash, timestamp |
| `auth.register` | Account created | user_id, invite_id, timestamp |
| `round.created` | New round started | user_id, course_id, timestamp |
| `round.shot_entry_form` | Form-based entry used | user_id, round_id, hole_count |
| `round.shot_entry_voice` | Voice entry processed | user_id, round_id, shot_count |
| `round.import_started` | Clip upload initiated | user_id, clip_count, timestamp |
| `round.import_completed` | Processing finished | user_id, round_id, duration_ms |
| `cv.job_dispatched` | Modal job submitted | user_id, clip_id, camera_angle |
| `cv.job_completed` | Modal job returned | user_id, clip_id, duration_ms, confidence |
| `course.api_lookup` | Golf Intelligence API called | user_id, course_name, found (bool) |
| `course.manual_entry` | Course entered manually | user_id, course_name |
| `error.api` | Vercel Function throws | path, error_code, user_id, timestamp |

### Telemetry schema

```sql
CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  properties JSONB,
  ip_hash TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_event_type ON telemetry_events(event_type);
CREATE INDEX idx_telemetry_user_id ON telemetry_events(user_id);
CREATE INDEX idx_telemetry_created_at ON telemetry_events(created_at);
```

---

## 5. Data Architecture

### Course data schema

```sql
-- Courses (cached from Golf Intelligence or manually entered)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  golf_intelligence_id TEXT,              -- null if manually entered
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'USA',
  total_holes INTEGER NOT NULL DEFAULT 18,
  is_manually_entered BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tee boxes per course
CREATE TABLE course_tees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tee_name TEXT NOT NULL,                 -- 'white', 'blue', 'black', 'red', etc.
  tee_color TEXT,                         -- for UI display
  total_yards INTEGER,
  course_rating NUMERIC(4,1),
  slope_rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, tee_name)
);

-- Hole data per tee
CREATE TABLE course_holes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tee_id UUID NOT NULL REFERENCES course_tees(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  par INTEGER NOT NULL CHECK (par BETWEEN 3 AND 5),
  yards INTEGER,
  handicap_index INTEGER CHECK (handicap_index BETWEEN 1 AND 18),
  is_modified BOOLEAN NOT NULL DEFAULT false,
  modification_note TEXT,                 -- 'tee under repair', 'temporary green', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tee_id, hole_number)
);
```

### Golf data schema

```sql
-- Sessions (rounds, range, short game)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('round', 'range', 'short_game')),
  session_date DATE NOT NULL,
  course_id UUID REFERENCES courses(id),          -- null for range/short_game
  tee_id UUID REFERENCES course_tees(id),         -- null for range/short_game
  tee_used TEXT,                                  -- which tee played
  weather_conditions TEXT,
  temperature_f INTEGER,
  wind_description TEXT,
  notes TEXT,
  entry_method TEXT CHECK (entry_method IN ('voice', 'form', 'both')),
  arccos_round_id TEXT,                           -- future: Arccos integration hook
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clips (uploaded video files)
CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  blob_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  camera_angle TEXT CHECK (camera_angle IN ('dtl', 'face_on', 'unknown')),
  angle_confidence NUMERIC(4,3),
  capture_timestamp TIMESTAMPTZ,
  gpmf_device_name TEXT,
  transcript TEXT,
  transcript_confidence NUMERIC(4,3),
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending','processing','complete','failed')),
  processing_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shots (one per swing event)
CREATE TABLE shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID NOT NULL REFERENCES sessions(id),
  hole_number INTEGER,
  shot_number INTEGER,
  club TEXT,
  distance_yards NUMERIC(6,1),
  lie TEXT CHECK (lie IN ('tee','fairway','rough','deep_rough','sand','recovery','fringe','green')),
  shot_result TEXT CHECK (shot_result IN ('fairway','left_rough','right_rough','sand','ob','water','green','holed')),
  shot_shape TEXT CHECK (shot_shape IN ('straight','draw','fade','hook','slice','push','pull')),
  pin_distance_feet NUMERIC(6,1),         -- distance to pin after shot
  -- Strokes gained (calculated by built-in engine)
  sg_total NUMERIC(5,3),
  sg_off_tee NUMERIC(5,3),
  sg_approach NUMERIC(5,3),
  sg_around_green NUMERIC(5,3),
  sg_putting NUMERIC(5,3),
  sg_source TEXT DEFAULT 'calculated'     -- 'calculated' | 'arccos_override' | 'manual'
    CHECK (sg_source IN ('calculated','arccos_override','manual')),
  -- Entry metadata
  entry_method TEXT CHECK (entry_method IN ('voice','form','cv_assisted')),
  voice_transcript TEXT,                  -- raw spoken text for this shot
  shot_timestamp TIMESTAMPTZ,
  arccos_shot_id TEXT,                    -- future: Arccos integration hook
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hole summaries (score, FIR, GIR, putts)
CREATE TABLE hole_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID NOT NULL REFERENCES sessions(id),
  hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  par INTEGER,
  score INTEGER,
  fairway_hit BOOLEAN,
  fairway_miss_direction TEXT CHECK (fairway_miss_direction IN ('left','right')),
  gir BOOLEAN,
  putts INTEGER,
  penalty_strokes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, hole_number)
);

-- Shot clips (many-to-many: shot ↔ clip segment)
CREATE TABLE shot_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
  clip_id UUID NOT NULL REFERENCES clips(id),
  trimmed_blob_url TEXT,
  trim_start_seconds NUMERIC(8,3),
  trim_end_seconds NUMERIC(8,3),
  ball_flight_data JSONB,                 -- TrackNet output: array of {frame, x, y, confidence}
  pose_landmarks_dtl JSONB,              -- MediaPipe output DTL camera
  pose_landmarks_fo JSONB,               -- MediaPipe output face-on camera
  arc_overlay_blob_url TEXT,             -- rendered arc overlay image
  cv_processing_status TEXT DEFAULT 'pending'
    CHECK (cv_processing_status IN ('pending','queued','processing','complete','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shot tags (auto-detected + user confirmed)
CREATE TABLE shot_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
  tag_category TEXT NOT NULL,             -- 'ball_flight', 'setup', 'mechanics', 'mental', 'situation', 'quality'
  tag_key TEXT NOT NULL,                  -- 'pull', 'early_release', 'ball_back', etc.
  tag_value TEXT NOT NULL,               -- the label shown in UI
  measured_value TEXT,                   -- '8° left of target line', '1.5" behind center'
  source TEXT NOT NULL CHECK (source IN ('auto_cv','auto_whisper','auto_nova','user')),
  confidence NUMERIC(4,3),
  user_confirmed BOOLEAN,                -- null=pending, true=confirmed, false=rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clarification queue (low-confidence clip assignments)
CREATE TABLE clarification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  clip_id UUID NOT NULL REFERENCES clips(id),
  signals JSONB,                          -- all classification signals and their weights
  suggested_angle TEXT,
  suggested_hole INTEGER,
  suggested_shots JSONB,
  confidence NUMERIC(4,3),
  resolved_at TIMESTAMPTZ,
  resolution JSONB,                       -- user's answers
  learn_from_resolution BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SG baseline lookup (Broadie tables — seeded at migration time)
CREATE TABLE sg_baseline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lie TEXT NOT NULL,                      -- 'tee', 'fairway', 'rough', 'sand', 'recovery', 'green'
  distance_yards INTEGER NOT NULL,
  expected_strokes NUMERIC(5,3) NOT NULL,
  UNIQUE(lie, distance_yards)
);
```

### Indexes

```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_type ON sessions(type);
CREATE INDEX idx_clips_user_id ON clips(user_id);
CREATE INDEX idx_clips_session_id ON clips(session_id);
CREATE INDEX idx_clips_processing_status ON clips(processing_status);
CREATE INDEX idx_shots_user_id ON shots(user_id);
CREATE INDEX idx_shots_session_id ON shots(session_id);
CREATE INDEX idx_shot_tags_shot_id ON shot_tags(shot_id);
CREATE INDEX idx_hole_summaries_session_id ON hole_summaries(session_id);
CREATE INDEX idx_courses_golf_intelligence_id ON courses(golf_intelligence_id);
CREATE INDEX idx_telemetry_event_type ON telemetry_events(event_type);
CREATE INDEX idx_telemetry_user_id ON telemetry_events(user_id);
CREATE INDEX idx_telemetry_created_at ON telemetry_events(created_at);
```

---

## 6. Strokes Gained Calculation Engine

### How it works

SG for a shot = `baseline(start_lie, start_distance) - baseline(end_lie, end_distance) - 1`

A positive value means the shot was better than average. Negative means worse.

The `sg_baseline` table is seeded from Mark Broadie's published lookup tables (Every Shot Counts, 2014 + updates). These are widely reproduced and accurate to within 10% of Arccos/ShotLink calculations for amateur rounds.

### Category assignment logic

```
shot.hole_number defined AND shot.shot_number = 1 AND hole.par IN (4,5) → sg_off_tee
shot.lie IN ('fairway','rough','recovery') AND pin_distance > 30 yards → sg_approach
shot.lie IN ('fringe','sand') OR pin_distance <= 30 yards → sg_around_green
shot.lie = 'green' → sg_putting
```

### Arccos override

If the user references the Arccos app after their round and wants to use those SG figures instead of the calculated ones, each session has SG override fields at the round level. Per-shot SG can also be individually overridden. Source is tracked: `'calculated' | 'arccos_override' | 'manual'`.

---

## 7. Shot Data Entry — Dual Mode

### Voice mode (primary)

The golfer speaks into the GoPro mic before and/or after each shot. The pipeline:

1. Clip uploaded → audio extracted (FFmpeg, Vercel Function)
2. Audio → OpenAI Whisper API → timestamped transcript
3. Transcript → Bedrock Nova Lite → structured JSON:
   ```json
   {
     "hole": 7,
     "shot_number": 1,
     "club": "6-iron",
     "distance_yards": 247,
     "lie": "fairway",
     "conditions": ["into_wind"],
     "swing_thoughts": "felt rushed on the downswing",
     "shot_result": "left_rough"
   }
   ```
4. JSON pre-populates shot record → user confirms in review UI

**Recommended spoken convention:**
> *"Hole seven, shot one, six iron, two forty seven yards, into the wind — came off it a bit, pulled it left"*

The convention is flexible — Nova handles natural language. Exact phrasing not required.

### Form mode (parallel)

Post-round or during round on mobile. Scorecard-style UI:
- Select hole → enter score, FIR, GIR, putts
- Expand to add shots: club picker, distance (slider or keyboard), lie selector, result selector, notes
- Designed for one-thumb operation on iPhone
- Auto-advances to next hole on save
- Can be partially filled — missing shots don't block saving what you have

### When both are used

If a hole has both voice-extracted data and form-entered data for the same shot, the app flags the conflict and asks which to keep. Form entry wins by default (user was deliberate) unless user indicates voice was more accurate.

---

## 8. Course Data — Golf Intelligence Integration

### Lookup flow

```
User starts new round → types course name
  → GET /api/courses/search?q=Meadow+Springs
  → Calls Golf Intelligence search API (free tier)
  → Returns list of matching courses with IDs
  → User selects course → GET /api/courses/[gi_id]/scorecard
  → Calls Golf Intelligence scorecard API (1 credit, cached permanently)
  → Stored in courses + course_tees + course_holes tables
  → Next round at same course: served from DB — no API call
```

### Manual entry fallback

If course not found in Golf Intelligence API:
- User enters course name, city, state
- Enters holes manually: hole number, par, yards (optional), handicap index (optional)
- All fields editable after creation
- `is_manually_entered = true` — no Golf Intelligence ID

### Hole-level overrides

At round setup, the user can override any hole for that session:
- Mark tee as under repair → note recorded, yards marked as estimated
- Enter temporary pin position
- Override par for a hole (unusual conditions)
- Overrides are per-session — do not modify the cached course data

---

## 9. Processing Pipeline

### Clip upload → processed shot (async)

```
1. Browser → Vercel Function → Vercel Blob presigned URL
2. Browser uploads MP4 directly to Vercel Blob
3. Vercel Function: confirm upload → insert clip record → enqueue jobs

Job A — Vercel Function (Python, FFmpeg-static):
  ├── Extract audio track (MP3)
  ├── Generate thumbnail (frame 0)
  ├── GPMF parser: device name, gyro orientation, capture timestamp
  └── Write metadata to clips table

Job B — OpenAI Whisper API:
  ├── POST audio → timestamped transcript
  └── Write transcript to clips table

Job C — AWS Bedrock Nova Lite:
  ├── POST transcript + session context → structured shot JSON
  │   (hole, shot_number, club, distance, lie, conditions, thoughts, result)
  └── Write extracted data + confidence → shots table (draft records)

Job D — Confidence scoring:
  ├── Combine: GPMF device name + gyro orientation + pose geometry + transcript signals
  ├── Score ≥ 0.75 → auto-match → shot_clips record created
  └── Score < 0.75 → insert into clarification_queue

Job E — Modal CV (dispatched per confirmed shot_clip):
  ├── Download trimmed clip from Vercel Blob
  ├── MediaPipe: 33 pose landmarks per frame (both cameras)
  ├── TrackNet: ball position per frame (DTL camera)
  ├── Compute swing attributes + ball arc
  └── Write to shot_clips + shot_tags (auto_cv source)

4. SG calculation runs after shot data is complete (distance + lie known)
5. Frontend polls GET /api/shots/[id]/status → renders as jobs complete
```

---

## 10. Application Routes

### Public routes (no auth required)
| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Promotional — features, waitlist CTA |
| `/waitlist` | `WaitlistForm` | Email + name + optional message |
| `/invite/[token]` | `RegisterForm` | Invite-gated account creation |
| `/login` | `LoginForm` | Email + password |
| `/forgot-password` | `ForgotPasswordForm` | Request reset email |
| `/reset-password/[token]` | `ResetPasswordForm` | New password entry |

### Protected routes (any authenticated user)
| Route | Component | Description |
|---|---|---|
| `/dashboard` | `Dashboard` | Session history, recent activity, quick-add |
| `/rounds/new` | `NewRound` | Course search/select, tee selection, camera setup |
| `/rounds/[id]` | `RoundView` | Scorecard + hole list |
| `/rounds/[id]/enter` | `ShotEntryForm` | Post-round form entry (hole-by-hole) |
| `/rounds/[id]/holes/[n]` | `HoleView` | Shot list + video player |
| `/shots/[id]` | `ShotDetail` | Video + arc + tag panel |
| `/import` | `ClipImport` | Upload clips, match to session |
| `/courses` | `CourseLibrary` | Saved courses list |
| `/courses/new` | `CourseSetup` | Search Golf Intelligence or manual entry |
| `/courses/[id]` | `CourseDetail` | Hole-by-hole scorecard view/edit |
| `/range` | `RangeSession` | Practice session log |
| `/short-game` | `ShortGameSession` | Chipping + putting log |
| `/trends` | `TrendsDashboard` | Multi-round analytics |
| `/settings` | `UserSettings` | Profile, password change |

### Protected routes (admin only)
| Route | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboard` | Telemetry overview |
| `/admin/users` | `UserManagement` | List, activate/deactivate, promote |
| `/admin/waitlist` | `WaitlistManagement` | Approve, reject, invite |
| `/admin/invites` | `InviteManagement` | Send, revoke, resend |
| `/admin/telemetry` | `TelemetryDashboard` | Event charts + API error log |

---

## 11. Environment Variables

```bash
# Neon Postgres
DATABASE_URL=

# Auth
JWT_SECRET=                        # 32+ byte random string
JWT_REFRESH_SECRET=                # 32+ byte random string, different from above

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@tracitai.com

# OpenAI (Whisper)
OPENAI_API_KEY=

# AWS Bedrock
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-west-2
BEDROCK_MODEL_LITE=amazon.nova-lite-v1:0
BEDROCK_MODEL_PRO=amazon.nova-pro-v1:0

# Modal
MODAL_TOKEN_ID=
MODAL_TOKEN_SECRET=

# Golf Intelligence
GOLF_INTELLIGENCE_API_KEY=
GOLF_INTELLIGENCE_BASE_URL=https://api.golfintelligence.com

# App
NEXT_PUBLIC_APP_URL=https://tracitai.com
ADMIN_SEED_PASSWORD=               # Used only at seed time, never stored

# Future — Arccos (not active in v1)
# ARCCOS_API_KEY=
# ARCCOS_API_BASE_URL=
```

---

## 12. Deployment Architecture

```
GitHub repo: tracitai/app
  └── main branch → Vercel Production (tracitai.com)
  └── develop branch → Vercel Preview (tracitai-dev.vercel.app)

Vercel Project:
  ├── Framework: Vite (React SPA) + Vercel Functions
  ├── Build: vite build
  ├── Functions runtime: Node.js 22 (TypeScript), Python 3.12
  ├── Fluid compute: enabled (FFmpeg, extended duration)
  └── Blob storage: attached to project

Neon Postgres:
  ├── Production branch: main
  └── Development branch: dev

Modal:
  └── App: tracitai-cv
      ├── Function: process_shot_clip
      └── Image: debian + mediapipe + opencv + torch + ultralytics

AWS:
  └── Bedrock: us-west-2, Nova Lite + Pro
  └── IAM user: tracitai-bedrock (Bedrock-only policy)

Resend:
  └── Domain: tracitai.com (DNS verified)
  └── From: noreply@tracitai.com

Golf Intelligence:
  └── API key: per-credit billing, scorecard calls cached indefinitely
```

---

## 13. Security Considerations

- All API routes validate JWT on every request via middleware
- Row-level ownership enforced: `WHERE user_id = req.user.id` on all data queries
- Admin routes check `req.user.role === 'admin'` in middleware
- Refresh tokens stored as bcrypt hashes — raw token only in httpOnly cookie
- Password reset tokens stored as SHA-256 hashes — 1hr expiry, single use
- IP addresses hashed (SHA-256) before storage — never stored raw
- CORS locked to `tracitai.com` and `*.vercel.app`
- Vercel Blob URLs are signed — not publicly guessable
- Rate limiting on auth endpoints: 5 attempts per IP per 15 minutes
- Admin bootstrap account flagged `is_system_account = true` — cannot be deleted via UI
- Golf Intelligence API key is server-side only — never exposed to client

---

## 14. Development Conventions (for Claude Code)

- **File structure:** `src/app/` pages, `src/components/` UI, `src/lib/` utilities, `src/server/` API handlers, `src/db/` schema + queries
- **API routes:** All under `api/` as Vercel Functions, named `route.ts`
- **Zod schemas:** In `src/lib/schemas/` — shared client and server
- **DB queries:** Drizzle ORM only — no raw SQL except migrations
- **Auth middleware:** `src/server/middleware/auth.ts` — wraps all protected handlers
- **Error responses:** Always `{ error: string, code: string }` — never expose internals
- **Telemetry:** `trackEvent()` from `src/lib/telemetry.ts` — fire and forget, never throws
- **SG engine:** `src/lib/sg.ts` — pure functions, no DB calls, fully unit-testable
- **Issue branch naming:** `feature/issue-{number}-{slug}`
- **Env vars:** Always from `env.VARIABLE_NAME` — never `process.env` directly

---

## 15. v1 Build Order Summary

| Phase | Issues | Description |
|---|---|---|
| **0 — Foundation** | 001–004 | Repo, DB schema + SG baseline seed, env config, UI primitives |
| **1 — Auth** | 005–011 | IAM, JWT, all auth flows, admin seed, frontend state |
| **2 — Landing + Admin** | 012–015 | Landing page, waitlist, admin console, telemetry |
| **3 — Core UI shell** | 016–018 | Dashboard shell, routing, protected layout |
| **4 — Course library** | 019–021 | Golf Intelligence integration, manual entry, hole overrides |
| **5 — Round + shot entry** | 022–026 | Round creation, form entry, voice extraction, SG calculation |
| **6 — Clip import** | 027–032 | Upload flow, GPMF, FFmpeg, Whisper, Nova, confidence scoring |
| **7 — Shot review** | 033–037 | Hole view, shot detail, tag panel, arc overlay, clarification UI |
| **8 — CV processing** | 038–041 | Modal integration, MediaPipe, TrackNet, results write |
| **9 — Trends** | 042–045 | Trends dashboard, pattern detection, correlations |
| **10 — Range + Short game** | 046–049 | Practice session modules |
| **11 — Polish** | 050–053 | Settings, notifications, mobile tuning, error states |
