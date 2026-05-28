# Issue 013 — Admin Console — User Management

**Phase:** 2 — Landing + Admin  
**Depends on:** Issue 010  
**Branch:** `feature/issue-013-admin-users`

---

## Objective

Build the admin user management interface: view all users, activate/deactivate, promote to admin.

---

## Acceptance Criteria

- [ ] `/admin/users` renders user table (admin only — redirect non-admin to /dashboard)
- [ ] Columns: Name, Email, Role, Status, Joined, Last login, Actions
- [ ] Actions: Deactivate (active), Activate (inactive), Promote to admin
- [ ] Cannot deactivate or demote `is_system_account = true` — button disabled with tooltip
- [ ] Cannot deactivate or demote your own account — button disabled with tooltip
- [ ] Confirmation modal before any destructive action
- [ ] Search/filter by email or name (client-side)
- [ ] User count in page header

---

## API specs

### GET /api/admin/users
```typescript
// Admin only
{ users: Array<{
  id, email, name, role, isActive, isSystemAccount,
  createdAt, lastLoginAt, roundCount
}> }
```

### PUT /api/admin/users/[id]
```typescript
{ isActive?: boolean, role?: 'admin' | 'user' }
// 200
{ user: { id, email, name, role, isActive } }
// 403 — cannot modify system account or self
{ error: 'Cannot modify this account', code: 'FORBIDDEN' }
```
