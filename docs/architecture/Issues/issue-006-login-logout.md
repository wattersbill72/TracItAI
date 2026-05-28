# Issue 006 — Login & Logout API + UI

**Phase:** 1 — Auth  
**Depends on:** Issue 005  
**Branch:** `feature/issue-006-login-logout`

---

## Objective

Implement login, logout, and token refresh API endpoints plus the login page UI.

---

## Acceptance Criteria

- [ ] `POST /api/auth/login` authenticates user, returns access token + sets refresh cookie
- [ ] `POST /api/auth/logout` revokes refresh token, clears cookie
- [ ] `POST /api/auth/refresh` rotates refresh token, returns new access token
- [ ] Login page at `/login` with email + password fields
- [ ] Failed login shows inline error — never reveal whether email or password is wrong ("Invalid credentials")
- [ ] Successful login redirects to `/dashboard`
- [ ] Already-authed users visiting `/login` redirected to `/dashboard`
- [ ] Rate limiting: 5 failed attempts per IP per 15 minutes → 429
- [ ] `trackEvent('auth.login_failed')` on failure
- [ ] `trackEvent('auth.login')` on success

---

## API specs

### POST /api/auth/login
```typescript
// Request
{ email: string, password: string }
// Success 200
{ accessToken: string, user: { id: string, name: string, role: string } }
// + Set-Cookie: tracitai_refresh=...
// Error 401
{ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }
// Error 429
{ error: 'Too many attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' }
```

### POST /api/auth/logout
```typescript
// Reads refresh cookie
// Success 200
{ success: true }
// + clears refresh cookie
```

### POST /api/auth/refresh
```typescript
// Reads refresh cookie
// Success 200
{ accessToken: string }
// + new refresh cookie (rotation)
// Error 401
{ error: 'Session expired', code: 'REFRESH_TOKEN_INVALID' }
```

---

## Login page — src/app/auth/LoginPage.tsx

- TracItAI logo centered top
- Card: email input, password input, "Forgot password?" link, Login button
- "Don't have an account?" → links to `/waitlist`
- Error alert on failed attempt
- Loading state on button during request

---

## Rate limiting

Use an in-memory Map with IP + timestamp tracking for v1. Key: `sha256(ip)`. Document the in-memory limitation — does not persist across function restarts.
