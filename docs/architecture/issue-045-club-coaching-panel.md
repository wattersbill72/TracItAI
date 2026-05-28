# Issue 045 — Club Breakdown + Coaching Patterns Panel

**Phase:** 9 — Trends Dashboard  
**Depends on:** Issue 044  
**Branch:** `feature/issue-045-club-coaching-panel`

---

## Objective

Complete the trends dashboard with club breakdown and coaching pattern panels. Add filter pills and pattern dismiss functionality.

---

## Acceptance Criteria

- [ ] Club breakdown panel: bar chart per club showing pull rate, most common co-tag
- [ ] Coaching patterns panel: displays active `pattern_insights` as cards (alert/insight/info styles)
- [ ] Dismiss button on each pattern card
- [ ] Filter pills: clicking an attribute tag filters all trend data to shots with that tag
- [ ] Active filter shown as dismissable pill in page header
- [ ] Pattern cards match design: left color border (red/green/blue), title, description, metric badge

---

## Club breakdown table

```
Club  Pull rate bar              Stat        Top co-tag
DR    [████████████] 62%         62% pull    OTT path
3W    [███████     ] 38%         38% pull    sway
4i    [████████    ] 44%         44% pull    OTT path
6i    [██████      ] 31%         31% pull    early release
PW    [████        ] 19%         19% pull    —
```

---

## Pattern card design

```
┃ ALERT  Ball too far back is root cause              [73% correlation]
         Ball position predicts early release 73% of the time.
         Fixing ball position may resolve both issues simultaneously.
         [Dismiss for 30 days]

┃ INSIGHT Mental commitment is your biggest SG lever    [+0.49 SG gap]
         Shots tagged committed average +0.18 SG vs tentative at −0.31.

┃ INFO   6-iron is your most consistent club           [Most consistent]
         Tightest dispersion (±12 yds), lowest mishit rate (18%).
```

---

## API specs

### DELETE /api/trends/patterns/[id]
```typescript
// Dismisses a pattern insight for 30 days
// 200
{ success: true }
```
