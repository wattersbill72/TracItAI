# Issue 011 — User Settings & Password Change

**Phase:** 1 — Auth  
**Depends on:** Issue 010  
**Branch:** `feature/issue-011-user-settings`

---

## Objective

Implement the user settings page: update name and change password.

---

## Acceptance Criteria

- [ ] `/settings` route renders user settings page (protected)
- [ ] Profile section: name (editable), email (read-only), Save button
- [ ] Password section: current password, new password, confirm new password
- [ ] Password change requires current password verification
- [ ] On password change: all other sessions invalidated (other refresh tokens revoked), current session maintained
- [ ] Success/error feedback inline — no page reload

---

## API specs

### PUT /api/users/me
```typescript
{ name: string }
// 200
{ user: { id, name, email, role } }
```

### PUT /api/users/me/password
```typescript
{ currentPassword: string, newPassword: string }
// 200
{ success: true }
// 400
{ error: 'Current password incorrect', code: 'INVALID_PASSWORD' }
```
