# Issue 046 — Range Session

**Phase:** 10 — Range + Short Game  
**Depends on:** Issue 027, 025  
**Branch:** `feature/issue-046-range-session`

---

## Objective

Build the range session module. No course or hole data — entry via voice or simplified form. Shots grouped by club, not hole.

---

## Acceptance Criteria

- [ ] `/range` creates and manages range sessions
- [ ] Session creation: date, camera setup, "working on" field (free text intention)
- [ ] Shot entry: club, drill/intention, swing thought — no hole number required
- [ ] Shots grouped by club in session view
- [ ] Voice entry works identically to round mode
- [ ] Clip import works identically — camera angle classification unchanged
- [ ] No SG calculation (no target distance reference for range)
- [ ] `trackEvent('session.range_created')`

---

## Range session view layout

```
Range Session — May 25, 2026
Working on: 6-iron ball position and early release
2 cameras configured

━━━━━━━━━━━━━━━━━━━
6-IRON (14 shots)
  Shot 1: Ball back · Early release detected   [→]
  Shot 2: Ball center · Committed              [→]

DRIVER (8 shots)
  ...

[+ Add shots]  [↑ Import clips]
```

---

## API addition

### POST /api/sessions (range)
```typescript
{ type: 'range', sessionDate, intention?: string, camerasConfigured?: boolean }
// 201
{ session: { id, type, sessionDate, intention } }
```
