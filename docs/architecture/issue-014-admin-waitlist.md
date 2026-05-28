# Issue 014 — Admin Console — Waitlist & Invite Management

**Phase:** 2 — Landing + Admin  
**Depends on:** Issue 013  
**Branch:** `feature/issue-014-admin-waitlist`

---

## Objective

Build the admin waitlist and invite management interface. Core workflow: review waitlist → approve → invite email sent automatically.

---

## Acceptance Criteria

- [ ] `/admin/waitlist` shows all waitlist entries with status (pending/invited/rejected)
- [ ] One-click "Invite" on pending entry: creates invite, sends email, marks waitlist entry 'invited'
- [ ] One-click "Reject" on pending entry: marks rejected (no email sent)
- [ ] `/admin/invites` shows all sent invites: email, sent date, expiry, status (pending/used/expired)
- [ ] "Send invite" form for arbitrary email (not from waitlist)
- [ ] Expired invites can be resent (new token, new email)
- [ ] Pending invite count shown as badge in admin nav

---

## API specs

### GET /api/admin/waitlist
```typescript
{ entries: Array<{ id, email, name, message, status, createdAt, actionedAt }> }
```

### POST /api/admin/waitlist/[id]/invite
```typescript
// 201
{ invite: { id, email, expiresAt } }
```

### POST /api/admin/waitlist/[id]/reject
```typescript
// 200
{ success: true }
```

### GET /api/admin/invites
```typescript
{ invites: Array<{ id, email, createdAt, expiresAt, usedAt, status: 'pending'|'used'|'expired' }> }
```

### POST /api/admin/invites
```typescript
{ email: string, name?: string }
// 201
{ invite: { id, email, expiresAt } }
```

### POST /api/admin/invites/[id]/resend
```typescript
// 200
{ invite: { id, email, expiresAt } }
```
