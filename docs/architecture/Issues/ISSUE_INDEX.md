# TracItAI — Issue Index for Claude Code

**Read ARCHITECTURE.md first. Always. Then work issues in sequence.**

**Version:** 1.1 — Updated to reflect no Arccos API in v1. Course data via Golf Intelligence API + manual entry. Shot data via voice (Whisper/Nova) + form. SG calculated in-app.

---

## Working conventions

- One issue = one branch = one PR
- Branch naming: `feature/issue-{NNN}-{slug}`
- Never start an issue until all dependencies are merged
- All acceptance criteria must pass before closing an issue
- Run `npm run typecheck && npm run lint` before every commit — zero errors
- Run `npm run db:migrate` after any schema changes
- Never hardcode env vars — always `env.VARIABLE_NAME` from `src/lib/env.ts`
- All API routes wrap with `withAuth()` or `withAdmin()` — never raw handlers on protected routes
- Fire `trackEvent()` at every event listed in the architecture doc telemetry table
- SG calculation uses `src/lib/sg.ts` — never inline, always the shared engine

---

## Phase 0 — Foundation

| Issue | File | Description | Depends on |
|---|---|---|---|
| 001 | `issue-001-project-scaffold.md` | Vite + React + TS + Tailwind + Vercel config | — |
| 002 | `issue-002-database-setup.md` | Neon Postgres + Drizzle ORM + full schema + SG baseline seed | 001 |
| 003 | `issue-003-ui-primitives.md` | Design system + component library | 001 |
| 004 | `issue-004-admin-seed.md` | Admin bootstrap seed script | 002 |

## Phase 1 — Auth

| Issue | File | Description | Depends on |
|---|---|---|---|
| 005 | `issue-005-auth-middleware.md` | JWT middleware + token infrastructure | 002 |
| 006 | `issue-006-login-logout.md` | Login + logout + refresh API + UI | 005 |
| 007 | `issue-007-waitlist.md` | Waitlist signup flow | 005, 006 |
| 008 | `issue-008-invite-system.md` | Invite system — create, send, register | 007 |
| 009 | `issue-009-password-reset.md` | Password reset flow | 006 |
| 010 | `issue-010-auth-state.md` | Frontend auth state — Zustand + API client | 006, 007, 008, 009 |
| 011 | `issue-011-user-settings.md` | User settings + password change | 010 |

## Phase 2 — Landing + Admin

| Issue | File | Description | Depends on |
|---|---|---|---|
| 012 | `issue-012-landing-page.md` | Public landing page | 003 |
| 013 | `issue-013-admin-users.md` | Admin console — user management | 010 |
| 014 | `issue-014-admin-waitlist.md` | Admin console — waitlist + invites | 013 |
| 015 | `issue-015-admin-telemetry.md` | Admin console — telemetry dashboard | 013 |

## Phase 3 — Core UI Shell

| Issue | File | Description | Depends on |
|---|---|---|---|
| 016 | `issue-016-dashboard-shell.md` | Dashboard shell + protected layout + routing | 010, 003 |
| 017 | `issue-017-navigation.md` | AppShell navigation + mobile responsiveness | 016 |
| 018 | `issue-018-settings-page.md` | User settings page full implementation | 011, 017 |

## Phase 4 — Course Library

| Issue | File | Description | Depends on |
|---|---|---|---|
| 019 | `issue-019-golf-intelligence-api.md` | Golf Intelligence API client + course search | 016 |
| 020 | `issue-020-course-setup.md` | Course setup — scorecard pull + manual entry + tee management | 019 |
| 021 | `issue-021-course-library-ui.md` | Course library UI + hole override per session | 020 |

## Phase 5 — Round + Shot Entry

| Issue | File | Description | Depends on |
|---|---|---|---|
| 022 | `issue-022-round-creation.md` | Round creation flow — course select, tee, camera setup | 021 |
| 023 | `issue-023-sg-engine.md` | SG calculation engine — Broadie baseline + category logic | 002 |
| 024 | `issue-024-shot-entry-form.md` | Post-round form entry — scorecard UI, hole-by-hole, mobile | 022, 023 |
| 025 | `issue-025-voice-metadata.md` | Voice metadata extraction — Nova prompt + shot record creation | 022, 023 |
| 026 | `issue-026-round-view.md` | Round view — scorecard summary, hole list, SG display | 024, 025 |

## Phase 6 — Clip Import Pipeline

| Issue | File | Description | Depends on |
|---|---|---|---|
| 027 | `issue-027-blob-upload.md` | Vercel Blob presigned upload + clip record creation | 022 |
| 028 | `issue-028-gpmf-parser.md` | GPMF metadata parser (Python Vercel Function) | 027 |
| 029 | `issue-029-whisper-transcription.md` | FFmpeg audio extraction + Whisper transcription | 028 |
| 030 | `issue-030-nova-extraction.md` | Bedrock Nova shot metadata extraction from transcript | 029, 025 |
| 031 | `issue-031-confidence-scoring.md` | Confidence scoring + clarification queue | 030 |
| 032 | `issue-032-clip-import-ui.md` | Clip import UI — upload, progress, camera angle review, clarification | 031 |

## Phase 7 — Shot Review

| Issue | File | Description | Depends on |
|---|---|---|---|
| 033 | `issue-033-hole-view.md` | Hole view — shot list + scorecard summary | 026, 032 |
| 034 | `issue-034-shot-detail.md` | Shot detail — video player + arc overlay | 033 |
| 035 | `issue-035-auto-tag-panel.md` | Auto-detected tag panel with confidence indicators | 034 |
| 036 | `issue-036-manual-tags.md` | Manual tag panel + note entry + learning loop | 035 |
| 037 | `issue-037-clarification-ui.md` | Clarification queue UI — angle/hole resolution + model learning | 031, 036 |

## Phase 8 — CV Processing

| Issue | File | Description | Depends on |
|---|---|---|---|
| 038 | `issue-038-modal-setup.md` | Modal app setup + job dispatch + status polling | 027 |
| 039 | `issue-039-mediapipe.md` | MediaPipe pose landmark extraction (both camera angles) | 038 |
| 040 | `issue-040-tracknet.md` | YOLO + ByteTrack ball flight detection (DTL camera) | 038 |
| 041 | `issue-041-cv-results.md` | CV results write → shot_clips + shot_tags + arc overlay render | 039, 040 |

## Phase 9 — Trends Dashboard

| Issue | File | Description | Depends on |
|---|---|---|---|
| 042 | `issue-042-trends-api.md` | Trends data API — multi-round aggregation queries | 036 |
| 043 | `issue-043-trends-ui.md` | Trends dashboard — KPI cards + pull rate chart + SG chart | 042 |
| 044 | `issue-044-pattern-detection.md` | Pattern detection — root cause correlation engine | 042 |
| 045 | `issue-045-club-coaching-panel.md` | Club-by-club breakdown + coaching patterns panel | 044 |

## Phase 10 — Range + Short Game

| Issue | File | Description | Depends on |
|---|---|---|---|
| 046 | `issue-046-range-session.md` | Range session — create, voice/form entry, clip import | 027, 025 |
| 047 | `issue-047-short-game.md` | Short game session — chipping + putting, distinct angle config | 046 |
| 048 | `issue-048-practice-comparison.md` | Practice vs on-course comparison view | 043, 047 |
| 049 | `issue-049-session-history.md` | Session history list — all session types, filters | 048 |

## Phase 11 — Polish

| Issue | File | Description | Depends on |
|---|---|---|---|
| 050 | `issue-050-error-empty-states.md` | Error states + empty states across all views | all |
| 051 | `issue-051-mobile-ux.md` | Mobile UX pass — touch targets, swipe, one-thumb form | all |
| 052 | `issue-052-performance.md` | Performance audit — bundle size, query optimization, caching | all |
| 053 | `issue-053-arccos-scaffold.md` | Arccos integration scaffold — schema hooks, settings placeholder | all |

---

## Environment setup checklist (before first run)

```bash
# 1. Copy env example and fill in all values
cp .env.example .env.local

# 2. Run initial migration (creates all tables + seeds SG baseline)
npm run db:migrate
npm run db:seed:sg-baseline

# 3. Seed admin account (one time only)
ADMIN_SEED_PASSWORD="ThisIsTracItAIBills1stGolfApp" npm run db:seed:admin

# 4. Start dev server
npm run dev
```

---

## Key reminders

- Admin password in ARCHITECTURE.md — Bill removes after first login
- No Arccos API code in v1 — schema has hooks (`arccos_round_id`, `arccos_shot_id`) but all integration code is future
- Golf Intelligence API key is server-side only — never in client bundle
- SG calculation is pure functions in `src/lib/sg.ts` — test thoroughly
- All data tables require `user_id` — enforce in every query, never omit
- `is_system_account = true` accounts cannot be deleted or demoted
- Vercel Blob for all video — no S3 or Azure storage code in v1
- Modal for all CV — no local Python scripts
- Resend for all email — one integration only
- Voice entry and form entry are equally important — neither is a fallback
