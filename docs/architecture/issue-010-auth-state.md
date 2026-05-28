# Issue 010 — Frontend Auth State Management

**Phase:** 1 — Auth  
**Depends on:** Issue 006, 007, 008, 009  
**Branch:** `feature/issue-010-auth-state`

---

## Objective

Implement client-side auth state management: Zustand store, automatic token refresh, protected route wrapper, and auth-aware API client.

---

## Acceptance Criteria

- [ ] `useAuthStore` Zustand store holds: `user`, `accessToken`, `isLoading`, `isAuthenticated`
- [ ] Access token automatically refreshed before expiry (at 14 min if 15 min TTL)
- [ ] `<ProtectedRoute>` redirects unauthenticated users to `/login`
- [ ] `<AdminRoute>` redirects non-admin users to `/dashboard`
- [ ] API client (`src/lib/api.ts`) automatically includes `Authorization: Bearer [token]` header
- [ ] API client automatically retries once on 401 → refresh → retry
- [ ] On refresh failure → clears auth state → redirects to `/login`
- [ ] Auth state persists across page refreshes via refresh token cookie — NOT localStorage

---

## src/lib/api.ts

Typed fetch wrapper:
```typescript
export const api = {
  get: <T>(path: string) => Promise<T>,
  post: <T>(path: string, body: unknown) => Promise<T>,
  put: <T>(path: string, body: unknown) => Promise<T>,
  delete: <T>(path: string) => Promise<T>,
}
```

Handles: auth header injection, 401 → refresh → retry, error parsing into typed `ApiError`, JSON serialization.

---

## src/hooks/useAuth.ts

```typescript
export function useAuth() {
  return {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    login: (email: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    refreshToken: () => Promise<void>,
  }
}
```

---

## Notes for Claude Code

- Never store access token in localStorage — memory only (Zustand store)
- Refresh token lives in httpOnly cookie — JS cannot read it, only the browser sends it
- On app load: attempt token refresh immediately — if it fails, user is unauthenticated
- `isLoading = true` while initial refresh is in-flight — prevents flash of unauthenticated content
