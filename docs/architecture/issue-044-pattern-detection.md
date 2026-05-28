# Issue 044 — Pattern Detection Engine

**Phase:** 9 — Trends Dashboard  
**Depends on:** Issue 042  
**Branch:** `feature/issue-044-pattern-detection`

---

## Objective

Auto-generate coaching pattern cards from correlation data. Runs as a Vercel Cron job (daily) and on-demand after each confirmed round.

---

## Acceptance Criteria

- [ ] `pattern_insights` table added to schema (migration)
- [ ] Pattern engine runs via `POST /api/trends/generate-insights` (internal) and Vercel Cron daily
- [ ] Detects all pattern types listed below
- [ ] Patterns stored with severity: alert | insight | info
- [ ] Dismissed patterns not regenerated for 30 days
- [ ] Minimum sample size: 15 shots for any pattern
- [ ] `GET /api/trends/patterns` returns current active patterns

---

## Schema addition

```sql
CREATE TABLE pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('alert', 'insight', 'info')),
  metric_value NUMERIC(6,3),
  metric_label TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed_at TIMESTAMPTZ
);
```

---

## Pattern types

**Cause-effect correlation** (alert if >60%, insight if 40–60%):
> "Ball too far back predicts early release 73% of the time."

**Back nine degradation** (alert if >10% gap):
> "Pull rate: holes 1–9 24% vs holes 10–18 39%. Consistent across 8 of 12 rounds."

**Mental vs mechanical gap** (insight):
> "Shots tagged 'committed' average +0.18 SG vs 'tentative' at −0.31 SG."

**Club outlier** (alert):
> "Driver pull rate 62% — significantly higher than your iron average of 31%."

**Improvement trend** (info):
> "Early release rate down from 44% to 28% over the last 4 rounds."
