# Issue 052 — Performance Audit + Optimization

**Phase:** 11 — Polish  
**Depends on:** All previous phases  
**Branch:** `feature/issue-052-performance`

---

## Objective

Audit and optimize bundle size, database queries, and loading performance across the application.

---

## Acceptance Criteria

- [ ] Initial JS bundle < 300KB (use dynamic imports for heavy pages)
- [ ] Recharts dynamically imported — not in initial bundle
- [ ] Video clip URLs not loaded until user opens shot detail
- [ ] All database queries checked for N+1 patterns
- [ ] Missing indexes added where query plans show seq scans
- [ ] Neon connection pooling enabled for high-concurrency endpoints
- [ ] Thumbnail images resized server-side (not full-resolution in lists)
- [ ] Lighthouse score ≥ 90 on all core pages
- [ ] TanStack Query cache configured appropriately per data type

---

## Dynamic import targets

```typescript
// Heavy pages — load on demand
const TrendsDashboard = lazy(() => import('./app/trends/TrendsDashboard'))
const ClipImport = lazy(() => import('./app/import/ClipImport'))
const AdminTelemetry = lazy(() => import('./app/admin/TelemetryDashboard'))
```

---

## Cache TTL guidance

| Data type | Cache TTL | Reasoning |
|---|---|---|
| Course scorecard | 24 hours | Rarely changes |
| Session list | 30 seconds | User may add sessions |
| Shot detail | 5 minutes | CV results arrive async |
| Trends data | 5 minutes | Expensive queries |
| Telemetry | 60 seconds | Admin dashboard |
| User profile | 5 minutes | Infrequent changes |

---

## Database query audit checklist

- [ ] `GET /api/sessions` — paginated, uses index on `user_id + created_at`
- [ ] `GET /api/sessions/[id]` — single join query, not N+1 per hole
- [ ] `GET /api/trends/*` — all use date-range indexed queries
- [ ] `GET /api/clips` — filtered by `user_id + session_id`, both indexed
