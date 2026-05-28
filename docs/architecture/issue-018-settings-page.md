# Issue 018 — User Settings Page (Full Implementation)

**Phase:** 3 — Core UI Shell  
**Depends on:** Issue 011, 017  
**Branch:** `feature/issue-018-settings-page`

---

## Objective

Build the complete user settings page inside the AppShell with profile editing, password change, and connected services status.

---

## Acceptance Criteria

- [ ] `/settings` renders inside AppShell
- [ ] Profile section: name (editable), email (read-only with explanation), Save button
- [ ] Password section: current password, new password with strength indicator, confirm
- [ ] Inline success/error feedback — no page reload on either form
- [ ] Password strength indicator: weak/fair/strong
- [ ] "Connected services" section: Arccos (Coming soon), Golf Intelligence (Active)
- [ ] Danger zone: "Request account deletion" → confirmation modal → sends request to admin, does not self-delete in v1

---

## Settings page layout

```
Settings
├── Profile
│     Name: [input]
│     Email: bill@example.com (read-only)
│     [Save changes]
│
├── Password
│     Current password: [input]
│     New password: [input + strength bar]
│     Confirm: [input]
│     [Update password]
│
├── Connected services
│     Golf Intelligence API    [Active ✓]
│     Arccos                   [Coming soon]
│
└── Danger zone
      [Request account deletion]
```

---

## Password strength rules

- Weak: <8 chars
- Fair: ≥8 chars with numbers or mixed case
- Strong: ≥10 chars with uppercase + lowercase + numbers + symbol

---

## Notes for Claude Code

- `POST /api/users/me/deletion-request` emails admin — user informed request will be reviewed
- Do not implement actual account deletion in v1
- All API calls use the typed `api` client from Issue 010
