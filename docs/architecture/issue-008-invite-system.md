# Issue 008 — Invite System

**Phase:** 1 — Auth  
**Depends on:** Issue 007  
**Branch:** `feature/issue-008-invite-system`

---

## Objective

Implement the full invite lifecycle: admin sends invite → email delivered → user clicks link → registers → invite marked used.

---

## Acceptance Criteria

- [ ] `POST /api/admin/invites` creates invite, sends email (admin only)
- [ ] `GET /api/auth/invite/validate/[token]` validates token (not expired, not used)
- [ ] `POST /api/auth/register` creates account from invite token
- [ ] `/invite/[token]` shows registration form if token valid, error if invalid/expired
- [ ] Invite email sent via Resend with 48hr expiry notice
- [ ] Token stored as SHA-256 hash in DB — raw token only in email link
- [ ] `trackEvent('auth.register')` on account creation
- [ ] Invite can be sent to waitlist email or arbitrary email

---

## Invite email template

```
Subject: Your TracItAI invite is here 🏌️

Hi there,

You've been invited to TracItAI — your personal golf analytics platform.

Click below to create your account. This link expires in 48 hours.

[Create my account →]

TracItAI combines your GoPro footage with Arccos shot data 
to give you swing analysis and coaching insights from your 
own game.

See you on the course.
— The TracItAI team
```

---

## Registration form — /invite/[token]

Fields: Name (pre-filled if from waitlist), Password, Confirm password
- Password requirements shown inline: 8+ chars, 1 uppercase, 1 number
- On submit: creates account, auto-logs in, redirects to `/dashboard`
- Invalid/expired token: error card with link to waitlist

---

## API specs

### POST /api/admin/invites
```typescript
// Admin only
{ email: string, name?: string }
// 201
{ invite: { id, email, expiresAt } }
```

### GET /api/auth/invite/validate/[token]
```typescript
// 200
{ valid: true, email: string, name?: string }
// 400
{ error: 'Invite expired or already used', code: 'INVITE_INVALID' }
```

### POST /api/auth/register
```typescript
{ token: string, name: string, password: string }
// 201
{ accessToken: string, user: { id, name, role } }
// 400
{ error: string, code: 'INVITE_INVALID' | 'VALIDATION_ERROR' | 'EMAIL_TAKEN' }
```
