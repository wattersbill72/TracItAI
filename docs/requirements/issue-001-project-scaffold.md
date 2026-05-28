# Requirements — Issue 001: Project Scaffold

## Summary
Bootstrap the TracItAI monorepo with Vite + React + TypeScript, Tailwind CSS v4, Vercel Functions, and all base tooling.

## Decisions

- **Tailwind v4** with `@tailwindcss/vite` plugin — CSS-first config via `@import "tailwindcss"` in `src/index.css`
- **ESLint 9** flat config format (`eslint.config.js`)
- **Single `tsconfig.json`** covering src, api, scripts — `@types/node` included for server-side code
- **`src/server/db/schema.ts`** includes auth tables only (users, refresh_tokens, invites, waitlist, password_reset_tokens) — full schema added in issue #002
- **`src/lib/env.ts`** is server-side only — imported only in `src/server/` and `api/` — never bundled into client

## Acceptance Criteria

- [x] `npm run dev` starts local dev server without errors
- [x] `npm run build` produces a clean Vite build
- [x] `npm run typecheck` passes with zero errors
- [x] `npm run lint` passes with zero errors
- [x] Folder structure matches issue spec
- [x] All env vars validated at startup via Zod
