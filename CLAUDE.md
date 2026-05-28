# CLAUDE.md

Operating contract for Claude Code sessions in this repo. Read this file at the start of every session.

Keep solutions simple and direct. Edit existing code; don't rewrite. User instructions always override this file.

You are a senior full-stack developer.

There is no local Chrome browser or Claude plugin for Chrome available. Read from code to understand issues and address bug fixes. Do not try to run a local dev server inside a Claude Code session.

## Instructions

- When working with an issue: read the spec from `/docs/architecture/Issues/issue-{number}-{slug}.md`, create a requirements markdown file, build the solution, commit to main, and push so Vercel can pick it up and build it.
- When not presented with an issue number: create a new issue file in `/docs/architecture/Issues/` first, then proceed as above.
- After pushing, stop and confirm completion before picking up the next issue.
- Requirements files go in `/docs/requirements/issue-{number}-{slug}.md`.
- Commit messages follow: `feat(#xxx): brief description` or `fix(#xxx): brief description`.

## Session Startup

- Run `git worktree prune` to clean stale references before starting work.
- Read this file first.
- Read `/docs/architecture/ARCHITECTURE.md` for the full system spec.
- Read `/docs/architecture/Issues/issue-{number}-{slug}.md` for the canonical spec of the issue being worked.
- Read any existing files in `/docs/requirements/` to understand prior decisions before touching code.
- Before starting any issue, check `git status` to confirm clean working state.

## Context Management

- If context usage exceeds 50%, run `/compact` before continuing.
- After completing each issue, run `/compact` before picking up the next.

## TracItAI — Product Overview

TracItAI is a golf performance analytics web application that combines GoPro video footage with manually entered round data to deliver automated swing analysis, shot tracing, and multi-round coaching insights.

Core modules: Course Library, Round Setup, Shot Entry (voice + form), Clip Import, CV Processing, Shot Review, SG Calculator, Range Sessions, Short Game, Trends Dashboard, Admin Console, Landing Page.

## Technology Stack

- **Framework:** Vite + React + TypeScript — SPA deployed to Vercel; API routes are Vercel Functions in `/api/`
- **Styling:** Tailwind CSS — responsive: desktop, iPad, iPhone. No third-party component libraries.
- **State:** Zustand (auth + UI state) + TanStack React Query (server state)
- **Routing:** React Router v7
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts — dynamically imported, not in initial bundle
- **Database ORM:** Drizzle ORM with `@neondatabase/serverless`
- **Database:** Neon Postgres — `DATABASE_URL` (all queries)
- **Auth:** Custom JWT — 15-min access tokens + 30-day refresh tokens (httpOnly cookies). No Auth0, Clerk, or NextAuth.
- **Email:** Resend — all transactional email. `noreply@tracitai.com`.
- **Video storage:** Vercel Blob — all clip storage. No S3 or Azure storage code in v1.
- **AI — Transcription:** OpenAI Whisper API
- **AI — Extraction:** AWS Bedrock Nova Lite (`amazon.nova-lite-v1:0`)
- **AI — Coaching insights:** AWS Bedrock Nova Pro (`amazon.nova-pro-v1:0`)
- **CV Processing:** Modal (serverless) — MediaPipe pose + YOLO + ByteTrack ball flight
- **Course data:** Golf Intelligence API (search free, scorecard pull 1 credit, cached permanently)
- **SG calculation:** Built-in Broadie baseline engine — `src/lib/sg.ts` — pure functions, no DB calls
- **Deployment:** Vercel Pro — Fluid compute enabled

Do not introduce new dependencies without confirming first.

## Scope

- Only modify files relevant to the current issue.
- Do not refactor unrelated code while implementing a fix.
- If you notice an unrelated bug, create a new issue file in `/docs/architecture/Issues/` for it rather than fixing it inline.
- Every new API route MUST use `withAuth()` or `withAdmin()` middleware and scope all queries by the caller's `userId`. Bypassing this is a critical bug.
- Golf Intelligence API key is server-side only — never in the client bundle.
- All env vars accessed via `env.VARIABLE_NAME` from `src/lib/env.ts` — never `process.env` directly.
- Vercel Blob for all video — no S3 or Azure storage code in v1.
- Modal for all CV — no local Python scripts.
- Resend for all email — one integration only.
- Voice entry and form entry are equally important — neither is a fallback.

## Worktree Lifecycle

- For each issue, create a worktree: `git worktree add ../tracitai-track-{number} -b feature/issue-{number}`
- All work for that issue happens in that worktree.
- After pushing, remove the worktree: `git worktree remove ../tracitai-track-{number}`
- Never work directly on main inside a worktree session.

## Issue Selection by Label

- When given a label instead of an issue number, scan `/docs/architecture/Issues/` for files matching that label.
- Present the list and confirm which issue to work on, or if told 'work through all', process sequentially.

## Label Definitions

- `infra` — repo bootstrap, deploy config, environment, CI
- `db` — schema, migrations, Postgres queries
- `ui-ux` — frontend, React components, layout, styling
- `ai` — Whisper, Nova extraction, coaching insights
- `cv` — Modal, MediaPipe, YOLO + ByteTrack, arc overlay
- `golf` — course library, round creation, shot entry, SG engine
- `feature` — net-new product capability
- `enhancement` — improvement to existing capability
- `bug` — defect fix
- `admin` — admin console features
- `pipeline` — clip upload, processing, confidence scoring

## Error Handling

- If a build or test fails, fix it before moving to the next issue.
- If blocked for more than 2 attempts on the same problem, stop and summarize the blocker rather than continuing to guess.
- Never force-push to main.

## Before Committing

- Confirm no `console.log` or debug artifacts left in code.
- Confirm no hardcoded secrets, URLs, or environment-specific values.
- Confirm types compile clean (`npm run typecheck`).
- Confirm every new/modified API route uses `withAuth()` or `withAdmin()` and is scoped to `userId`. Unscoped queries are a critical bug.
- Confirm all env vars are accessed via `env.VARIABLE_NAME` from `src/lib/env.ts`.
- Confirm Golf Intelligence API key never appears in the client bundle.

## Verification

- After implementing, re-read the original issue requirements and confirm each acceptance criterion is met before committing.
- For complex architectural decisions, use ultrathink before proposing a solution.

## Key Files and Folders

- `/docs/architecture/ARCHITECTURE.md` — canonical product + system spec (v1.1)
- `/docs/architecture/Issues/ISSUE_INDEX.md` — issue list with dependencies and build order
- `/docs/architecture/Issues/issue-NNN-slug.md` — individual issue specs
- `/docs/requirements/issue-{number}-{slug}.md` — per-issue working requirements docs
- `src/lib/env.ts` — Zod-validated env vars — always use `env.VARIABLE_NAME`
- `src/lib/sg.ts` — SG calculation engine — pure functions, no DB calls, fully unit-testable
- `src/lib/telemetry.ts` — `trackEvent()` — fire and forget, never throws
- `src/server/db/schema.ts` — Drizzle schema (all tables)
- `src/server/db/index.ts` — Neon client + Drizzle instance
- `src/server/middleware/auth.ts` — `withAuth()` and `withAdmin()` — wraps all protected handlers
- `src/server/services/` — business logic (authService, sgService, courseService, etc.)
- `api/` — Vercel Functions (TypeScript and Python), named by endpoint
- `scripts/seed-admin.ts` — one-time admin bootstrap (`npm run db:seed:admin`)
- `scripts/seed-sg-baseline.ts` — Broadie table seed (`npm run db:seed:sg-baseline`)

## Environment Variables

Required at runtime. All accessed via `env.VARIABLE_NAME` from `src/lib/env.ts`.

```bash
DATABASE_URL=
JWT_SECRET=                        # 32+ byte random string
JWT_REFRESH_SECRET=                # 32+ byte random string, different from above
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@tracitai.com
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-west-2
BEDROCK_MODEL_LITE=amazon.nova-lite-v1:0
BEDROCK_MODEL_PRO=amazon.nova-pro-v1:0
MODAL_TOKEN_ID=
MODAL_TOKEN_SECRET=
MODAL_CALLBACK_SECRET=             # Shared secret for Modal → Vercel callback auth
GOLF_INTELLIGENCE_API_KEY=
GOLF_INTELLIGENCE_BASE_URL=https://api.golfintelligence.com
APP_URL=https://tracitai.com       # Server-side — used in email templates and redirects
```

## SG Calculation Quick Reference

```
SG for a shot = baseline(start_lie, start_distance) − baseline(end_lie, end_distance) − 1
Positive = better than average. Negative = worse.
```

Category assignment:
- `sg_off_tee`: shot_number=1, par 4 or 5
- `sg_approach`: lie in (fairway, rough, recovery) AND pin_distance > 30 yards
- `sg_around_green`: lie in (fringe, sand) OR pin_distance ≤ 30 yards
- `sg_putting`: lie = green
