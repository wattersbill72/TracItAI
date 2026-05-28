# Issue 050 — Error States + Empty States

**Phase:** 11 — Polish  
**Depends on:** All previous phases  
**Branch:** `feature/issue-050-error-empty-states`

---

## Objective

Audit every page and add proper empty states and error states. No blank pages, no silent failures.

---

## Acceptance Criteria

- [ ] Every data-heavy page has a skeleton loader (not blank while loading)
- [ ] Every list/table has an empty state with contextual CTA
- [ ] Every API error has a user-facing error message + retry action
- [ ] Network error: retry button + "Check your connection"
- [ ] 404 (shot/round not found): back link
- [ ] 500: "Something went wrong" + retry (error logged to telemetry)

---

## Empty states per page

| Page | Empty state message | CTA |
|---|---|---|
| Dashboard | "No rounds yet" | "Create your first round" |
| /sessions | "No sessions recorded" | "Start a new round" |
| /courses | "No courses saved" | "Search for your home course" |
| /trends | "You need at least 3 rounds to see trends" | "Add more rounds" (trends disabled) |
| Hole view shots | "No shots recorded for this hole" | "Add shots" |
| Clip import matched | "No clips matched yet" | "Upload clips" |
| Admin users | "No users yet" | "Send your first invite" |
| Admin waitlist | "No waitlist entries" | — |

---

## Skeleton loader pattern

Use Tailwind animated pulse for skeletons:
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

Apply to: Dashboard recent sessions, Round view scorecard, Hole view shot list, Trends charts.
