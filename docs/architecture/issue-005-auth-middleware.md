# Issue 005 — JWT Auth Middleware & Token Infrastructure

**Phase:** 1 — Auth  
**Depends on:** Issue 002  
**Branch:** `feature/issue-005-auth-middleware`

---

## Objective

Build the core JWT authentication infrastructure: token generation, validation, refresh rotation, and the middleware wrapper that protects all API routes. This is the security foundation — everything in Phase 1 depends on it.

---

## Acceptance Criteria

- [ ] `generateTokens(userId, role)` returns a signed JWT (15min) and refresh token (30 day)
- [ ] `validateJWT(token)` returns decoded payload or throws typed error
- [ ] `withAuth(handler)` middleware wraps any Vercel Function and injects `req.user`
- [ ] `withAdmin(handler)` middleware extends withAuth — additionally rejects non-admin with 403
- [ ] Refresh token rotation: each use invalidates old token and issues new one
- [ ] Refresh token stored as bcrypt hash in DB — raw token only ever in httpOnly cookie
- [ ] All token errors return `{ error: string, code: string }` — never expose internals

---

## Files to create

### src/server/middleware/auth.ts

```typescript
export function generateTokens(userId: string, role: string): Promise<{ accessToken: string, refreshToken: string }>
export function validateJWT(token: string): JWTPayload   // throws AuthError on invalid
export function withAuth(handler: AuthedHandler): VercelHandler
export function withAdmin(handler: AuthedHandler): VercelHandler
export function setRefreshCookie(res: VercelResponse, token: string): void
export function clearRefreshCookie(res: VercelResponse): void

interface JWTPayload {
  sub: string       // user id
  role: 'admin' | 'user'
  iat: number
  exp: number
}

interface AuthedRequest extends VercelRequest {
  user: { id: string, role: 'admin' | 'user' }
}
```

### src/server/services/tokenService.ts

DB operations for refresh tokens:
- `createRefreshToken(userId, rawToken)` — hashes and stores
- `validateAndRotateRefreshToken(rawToken)` — validates, revokes old, returns userId
- `revokeAllUserTokens(userId)` — used on password reset

---

## Token configuration

```typescript
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '30d'
const REFRESH_COOKIE_NAME = 'tracitai_refresh'
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 60 * 60 * 24 * 30,
}
```

---

## Error codes

```typescript
export type AuthErrorCode =
  | 'TOKEN_MISSING'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'INSUFFICIENT_ROLE'
  | 'REFRESH_TOKEN_INVALID'
  | 'REFRESH_TOKEN_EXPIRED'
```
