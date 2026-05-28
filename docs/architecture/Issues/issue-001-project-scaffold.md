# Issue 001 — Project Scaffold & Repository Setup

**Phase:** 0 — Foundation  
**Depends on:** Nothing — start here  
**Branch:** `feature/issue-001-project-scaffold`

---

## Objective

Bootstrap the TracItAI monorepo with Vite + React + TypeScript, Tailwind CSS, Vercel configuration, and all base tooling. The output is a deployable skeleton — no features, just the correct structure that all subsequent issues build on.

---

## Acceptance Criteria

- [ ] `npm run dev` starts local dev server without errors
- [ ] `npm run build` produces a clean Vite build
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] Project deploys to Vercel preview on push to `develop` branch
- [ ] Folder structure matches spec below exactly
- [ ] All env vars validated at startup via Zod — missing vars throw with a clear message, not a runtime crash

---

## Tech Stack to Install

```bash
# Core
vite react react-dom typescript

# Styling
tailwindcss @tailwindcss/vite autoprefixer

# Routing
react-router-dom@7

# State + data fetching
zustand @tanstack/react-query

# Forms + validation
react-hook-form zod @hookform/resolvers

# DB (Drizzle)
drizzle-orm drizzle-kit @neondatabase/serverless

# Auth utilities
jsonwebtoken bcryptjs
@types/jsonwebtoken @types/bcryptjs

# Email
resend

# Utilities
date-fns clsx tailwind-merge lucide-react

# Dev
eslint prettier typescript-eslint
```

---

## Folder Structure

```
tracitai/
├── src/
│   ├── app/                    # Page components (route-level)
│   │   ├── landing/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # Primitives: Button, Input, Card, Badge, etc.
│   │   └── layout/             # AppShell, Sidebar, Navbar, AdminShell
│   ├── lib/                    # Utilities
│   │   ├── schemas/            # Zod schemas (shared client + server)
│   │   ├── telemetry.ts        # trackEvent() utility
│   │   ├── utils.ts            # clsx/twMerge helpers
│   │   └── env.ts              # Validated env vars (Zod)
│   ├── server/                 # Server-only code
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT validation middleware
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema (all tables)
│   │   │   ├── index.ts        # Neon client + Drizzle instance
│   │   │   └── migrations/     # Drizzle migration files
│   │   └── services/           # Business logic (authService, etc.)
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # Global TypeScript types
├── api/                        # Vercel Functions
│   ├── auth/
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   ├── refresh.ts
│   │   ├── register.ts
│   │   ├── waitlist.ts
│   │   ├── forgot-password.ts
│   │   └── reset-password.ts
│   └── admin/
│       ├── users.ts
│       ├── waitlist.ts
│       └── invites.ts
├── scripts/
│   └── seed-admin.ts           # One-time admin bootstrap script
├── public/
│   └── favicon.svg
├── drizzle.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example                # All env vars with descriptions, no values
├── .env.local                  # Gitignored — local dev values
├── vercel.json
└── package.json
```

---

## vercel.json

```json
{
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs22.x"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## src/lib/env.ts

Validate all environment variables at startup using Zod. Export a typed `env` object used everywhere instead of `process.env` directly.

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  // Email
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@tracitai.com'),
  // OpenAI (Whisper)
  OPENAI_API_KEY: z.string().min(1),
  // AWS Bedrock
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default('us-west-2'),
  BEDROCK_MODEL_LITE: z.string().default('amazon.nova-lite-v1:0'),
  BEDROCK_MODEL_PRO: z.string().default('amazon.nova-pro-v1:0'),
  // Modal (CV processing)
  MODAL_TOKEN_ID: z.string().min(1),
  MODAL_TOKEN_SECRET: z.string().min(1),
  MODAL_CALLBACK_SECRET: z.string().min(1),
  // Golf Intelligence
  GOLF_INTELLIGENCE_API_KEY: z.string().min(1),
  GOLF_INTELLIGENCE_BASE_URL: z.string().url().default('https://api.golfintelligence.com'),
  // App
  APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
```

---

## Notes for Claude Code

- Do not install Clerk, Auth0, NextAuth, or any third-party auth library — auth is custom (see Issue 005)
- Do not use Next.js — this is Vite + React with Vercel Functions in the `/api` directory
- Tailwind v4 syntax if available, otherwise v3 with `tailwind.config.ts`
- Set up path aliases in `tsconfig.json`: `@/*` → `./src/*`
- `.env.example` must document every variable from `src/lib/env.ts` with a one-line comment — no values
- Prettier config: single quotes, 2 space indent, trailing commas, 100 char line width
- Env var naming: server-side vars are plain (e.g. `APP_URL`). `NEXT_PUBLIC_` prefix is Next.js convention and does NOT apply here. Client-side vars exposed to the browser use `VITE_` prefix.
- `GOLF_INTELLIGENCE_API_KEY` and `MODAL_TOKEN_ID/SECRET` are server-only — never in the client bundle
