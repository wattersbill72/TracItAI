# Issue 016 — Dashboard Shell + Protected Layout + Routing

**Phase:** 3 — Core UI Shell  
**Depends on:** Issue 010, 003  
**Branch:** `feature/issue-016-dashboard-shell`

---

## Objective

Build the authenticated application shell: routing configuration, protected route wrapper, and the main dashboard landing page.

---

## Acceptance Criteria

- [ ] React Router v7 routes configured for all routes in the architecture doc
- [ ] `<ProtectedRoute>` redirects unauthenticated users to `/login` with `?redirect=` param
- [ ] `<AdminRoute>` redirects non-admin to `/dashboard`
- [ ] After login, user redirected to original intended route (from `?redirect=` param)
- [ ] `/dashboard` renders with correct layout and content
- [ ] Dashboard shows: welcome + user name, recent sessions list (empty state if none), quick action cards
- [ ] Page title updates per route
- [ ] 404 page for unknown routes

---

## Router configuration — src/router.tsx

```
Public: / /login /waitlist /invite/[token] /forgot-password /reset-password/[token]

Protected: /dashboard /rounds/new /rounds/[id] /rounds/[id]/enter
           /rounds/[id]/holes/[n] /shots/[id] /import
           /courses /courses/new /courses/[id]
           /range /short-game /trends /settings

Admin: /admin /admin/users /admin/waitlist /admin/invites /admin/telemetry
```

---

## Dashboard page — src/app/dashboard/Dashboard.tsx

```
AppShell
  └── Main content
        ├── "Welcome back, [name]" + date
        ├── Quick actions (3 cards):
        │     [+ New Round]  [↑ Import Clips]  [📊 View Trends]
        ├── Recent sessions (last 5):
        │     Table: Date | Course | Type | Score | Actions
        │     Empty state if no sessions
        └── Stats summary (if sessions exist):
              FIR% | GIR% | Avg score | Rounds this month
```

---

## Notes for Claude Code

- Placeholder `<ComingSoon>` component for unimplemented routes
- Dashboard stats computed server-side
- AppShell from Issue 003 — import, don't rebuild
