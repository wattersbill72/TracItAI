# Issue 042 — Trends Data API

**Phase:** 9 — Trends Dashboard  
**Depends on:** Issue 036  
**Branch:** `feature/issue-042-trends-api`

---

## Objective

Build all aggregation queries that power the trends dashboard. All queries filter by `user_id` — never cross-user.

---

## Acceptance Criteria

- [ ] All endpoints below implemented and tested
- [ ] Date range filter applied consistently across all queries
- [ ] Minimum sample size enforced for correlations (20 shots)
- [ ] All queries optimized — no N+1 patterns, use indexed columns
- [ ] Empty results return empty arrays, not errors

---

## API endpoints

### GET /api/trends/summary?range=7|30|90|season
```typescript
{ totalRounds, avgScore, firPct, girPct, avgPutts, sgTotal, sgOffTee, sgApproach, sgAroundGreen, sgPutting }
```

### GET /api/trends/attribute?key=[tagKey]&range=30
```typescript
{ data: Array<{ roundDate: string, rate: number, count: number }> }
```

### GET /api/trends/correlations
```typescript
{ correlations: Array<{ cause: string, effect: string, correlation: number, sampleSize: number }> }
```

### GET /api/trends/by-club
```typescript
{ clubs: Array<{ club, rounds, avgDistance, pullRate, mishitRate, topTag }> }
```

### GET /api/trends/sg-trend?range=90
```typescript
{ data: Array<{ roundDate, sgTotal, sgOffTee, sgApproach, sgAroundGreen, sgPutting }> }
```

---

## Correlation engine

For each common tag pair (e.g. `ball_too_far_back` + `early_release`), compute across all shots with confirmed tags. Minimum 20 shots required. Return pairs above 40% correlation ordered by strength.
