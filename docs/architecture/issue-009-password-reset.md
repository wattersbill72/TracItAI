# Issue 009 — Password Reset Flow

**Phase:** 1 — Auth  
**Depends on:** Issue 006  
**Branch:** `feature/issue-009-password-reset`

---

## Objective

Implement self-service password reset: request → email sent → user clicks link → new password → all sessions invalidated.

---

## Acceptance Criteria

- [ ] `POST /api/auth/forgot-password` sends reset email (always returns success — don't leak email existence)
- [ ] Reset token: 32 random bytes, stored as SHA-256 hash, expires in 1 hour
- [ ] `POST /api/auth/reset-password` validates token, updates password, invalidates all refresh tokens for user
- [ ] `/forgot-password` page with email input
- [ ] `/reset-password/[token]` page with new password + confirm inputs
- [ ] After successful reset: redirect to `/login` with message "Password updated. Please log in."
- [ ] Expired/used token: clear error with link back to `/forgot-password`
- [ ] `trackEvent('auth.password_reset')` on success

---

## Reset email template

```
Subject: Reset your TracItAI password

Hi [name],

Click below to reset your password. This link expires in 1 hour.

[Reset my password →]

If you didn't request this, you can ignore this email.

— The TracItAI team
```

---

## API specs

### POST /api/auth/forgot-password
```typescript
{ email: string }
// Always 200 (never reveal whether email exists)
{ success: true, message: 'If that email is registered, you will receive a reset link.' }
```

### POST /api/auth/reset-password
```typescript
{ token: string, password: string }
// 200
{ success: true }
// 400
{ error: 'Reset link expired or already used', code: 'TOKEN_INVALID' }
```
