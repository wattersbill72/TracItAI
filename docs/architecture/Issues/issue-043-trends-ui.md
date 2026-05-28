# Issue 043 — Trends Dashboard UI

**Phase:** 9 — Trends Dashboard  
**Depends on:** Issue 042  
**Branch:** `feature/issue-043-trends-ui`

---

## Objective

Build the full trends dashboard UI using Recharts. Implement the design from the architecture conversation mockups exactly.

---

## Acceptance Criteria

- [ ] `/trends` renders inside AppShell
- [ ] Date range selector: Last 7d | 30d | 90d | Season
- [ ] Club filter dropdown applies to all charts
- [ ] 4-card KPI summary row with trend indicators
- [ ] Pull rate + early release dual-line chart (different line styles)
- [ ] SG trend line chart per category
- [ ] Coaching patterns cards (from Issue 044)
- [ ] Club breakdown table with inline bar charts
- [ ] Root cause correlation table
- [ ] Disabled state with tooltip if < 3 rounds
- [ ] All charts responsive

---

## KPI cards

```
Pull rate     FIR%      GIR%      Avg score
31%           54%       41%       87
↓ improving  ↑ +8%     → stable  → stable
```

---

## Dual-line chart (Recharts)

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
// Pull rate: solid red line
// Early release: dashed amber line
// X: round dates, Y: percentage
```

---

## Correlation table layout

```
Root cause correlations
Ball too far back → Early release     [73% ████████] green
Early release    → Pull / thin        [68% ███████ ] green
Open stance      → Pull               [54% █████   ] amber
Lateral sway     → Thin / fat         [51% █████   ] amber
```
