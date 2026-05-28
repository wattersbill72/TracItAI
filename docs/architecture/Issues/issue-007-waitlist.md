# Issue 007 — Waitlist Signup Flow

**Phase:** 1 — Auth  
**Depends on:** Issue 005, 006  
**Branch:** `feature/issue-007-waitlist`

---

## Objective

Implement the public waitlist signup — the primary CTA for non-invited users.

---

## Acceptance Criteria

- [ ] `POST /api/auth/waitlist` inserts record, sends confirmation email, returns success
- [ ] Duplicate email returns graceful message — not an error (don't reveal whether email exists)
- [ ] Confirmation email sent via Resend with TracItAI branding
- [ ] Waitlist page at `/waitlist`: name (required), email (required), message (optional, 280 char)
- [ ] Success state: replaces form with confirmation message — no page reload
- [ ] `trackEvent('waitlist.signup')` on submission

---

## Confirmation email template

```
Subject: You're on the TracItAI waitlist 🏌️

Hi [name],

You're on the list. We'll be in touch when your spot opens up.

TracItAI helps golfers like you combine GoPro footage with 
Arccos data to build a real coaching dataset — every round, 
every swing, every pattern.

We'll send your invite to this address: [email]

— The TracItAI team
```

---

## API spec

### POST /api/auth/waitlist
```typescript
// Request
{ email: string, name: string, message?: string }
// Success 200 (even if duplicate — don't leak existence)
{ success: true, message: "You're on the list. Check your email." }
// Error 400 (validation only)
{ error: 'Invalid email address', code: 'VALIDATION_ERROR' }
```
