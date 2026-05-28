# Issue 015 — Admin Console — Telemetry Dashboard

**Phase:** 2 — Landing + Admin  
**Depends on:** Issue 013  
**Branch:** `feature/issue-015-admin-telemetry`

---

## Objective

Build the admin telemetry dashboard. Self-hosted analytics from the `telemetry_events` table. No third-party analytics vendor.

---

## Acceptance Criteria

- [ ] `/admin/telemetry` renders metric cards and charts
- [ ] All data sourced from `telemetry_events` table only
- [ ] Date range filter: Last 7 days | Last 30 days | Last 90 days
- [ ] Charts rendered with Recharts
- [ ] API error log shows last 50 errors with path, code, timestamp
- [ ] Page auto-refreshes every 60 seconds

---

## Metric cards (top row)

| Metric | Query |
|---|---|
| Total users | COUNT from users |
| Active this week | DISTINCT user_id WHERE created_at > now()-7d |
| Rounds imported | COUNT event_type = 'round.import_completed' |
| Waitlist size | COUNT from waitlist WHERE status = 'pending' |

---

## Charts

**Daily active users (line)** — GROUP BY DATE(created_at) WHERE event_type = 'auth.login'

**Rounds imported per day (bar)** — GROUP BY DATE(created_at) WHERE event_type = 'round.import_completed'

**CV job success rate (donut)** — cv.job_completed vs cv.job_failed, last 30 days

**Top API errors (table)** — GROUP BY path, code, last 30 days, ordered by count desc

---

## API spec

### GET /api/admin/telemetry?range=7|30|90
```typescript
{
  summary: { totalUsers, activeThisWeek, roundsImported, waitlistSize },
  dau: Array<{ date: string, count: number }>,
  roundsPerDay: Array<{ date: string, count: number }>,
  cvJobStats: { completed: number, failed: number },
  topErrors: Array<{ path: string, code: string, count: number }>
}
```

---

## Notes for Claude Code

- Use skeleton loaders while data fetches
- All queries filter nulls — exclude anonymous events from user counts
- Telemetry is admin-only — `withAdmin` middleware on all API routes
