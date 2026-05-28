# Issue 049 — Session History List

**Phase:** 10 — Range + Short Game  
**Depends on:** Issue 048  
**Branch:** `feature/issue-049-session-history`

---

## Objective

Build the full session history page showing all session types with filters.

---

## Acceptance Criteria

- [ ] `/sessions` added to router
- [ ] All session types shown: round, range, short game
- [ ] Filters: type (all/round/range/short game), date range
- [ ] Each row: date, type icon, course/intention, key stat, view + delete actions
- [ ] Pagination or infinite scroll
- [ ] Delete session: confirmation modal, cascades to shots and clips (soft delete)

---

## Session list rows

```
📅 May 25  ⛳ Round   Meadow Springs · White  Score: 87 (+15)  [→][⋯]
📅 May 22  🏌 Range   Ball position focus      14 shots         [→][⋯]
📅 May 20  ⛳ Round   Canyon Lakes · Blue     Score: 84 (+12)  [→][⋯]
📅 May 18  🎯 Short   Chipping + putting       40 shots         [→][⋯]
```

---

## API spec

### GET /api/sessions?type=all|round|range|short_game&page=1
```typescript
{ sessions: Array<{ id, type, sessionDate, courseName, intention, keyStat, shotCount }>, total, page, pages }
```

### DELETE /api/sessions/[id]
```typescript
// Soft delete — sets deleted_at timestamp
// 200
{ success: true }
```
