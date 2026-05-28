# Issue 026 — Round View — Scorecard Summary + Hole List

**Phase:** 5 — Round + Shot Entry  
**Depends on:** Issue 024, 025  
**Branch:** `feature/issue-026-round-view`

---

## Objective

Build the round view page: scorecard, hole-by-hole navigation, entry status, and video import status.

---

## Acceptance Criteria

- [ ] `/rounds/[id]` renders round overview inside AppShell
- [ ] Scorecard: 18-hole grid, score/FIR/GIR/putts per hole, totals
- [ ] Color coding: birdie green, par neutral, bogey amber, double+ red
- [ ] Round stats: score vs par, FIR%, GIR%, putts, SG totals if calculated
- [ ] Hole list: click any hole → `/rounds/[id]/holes/[n]`
- [ ] Entry status per hole: complete / partial / not started
- [ ] Video status per hole: clips matched / pending / none
- [ ] Quick actions: "Continue entering data", "Import clips", "Review voice data ([n])"
- [ ] Voice extraction review panel if unreviewed extractions exist
- [ ] Inline round edit: date, weather, conditions

---

## Round view layout

```
Meadow Springs · White tees
May 25, 2026 · Partly cloudy · 72°F         [Edit]

Score: 87 (+15)  FIR: 7/14 (50%)  GIR: 6/18 (33%)  Putts: 34

SG: Off tee −1.2 · Approach −2.4 · Around green −0.8 · Putting +0.3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORECARD
      1   2   3   4   5   6   7   8   9  Out
Par   4   3   4   5   4   3   4   5   4   36
Score 5   3   5   6   4   4   5   5   5   42
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOLES
H1 · Par 4 · 412 yds · Score: 5    ✓ Data   📹 2 clips   [→]
H2 · Par 3 · 187 yds · Score: 3    ✓ Data   📹 1 clip    [→]
H3 · Par 4 · 394 yds · Score: 5    ⚠ Partial  📹 None   [→]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIONS
[+ Enter data]  [↑ Import clips]  [🎤 Review voice (3)]
```

---

## API spec

### GET /api/sessions/[id]
```typescript
{
  session: {
    id, type, sessionDate, weatherConditions, temperatureF, windDescription,
    course: { id, name, city, state },
    tee: { name, totalYards, courseRating, slopeRating },
    holes: Array<{
      number, par, yards,
      summary: { score, fairwayHit, gir, putts, penaltyStrokes } | null,
      shotCount, clipCount, hasUnreviewedVoiceData
    }>,
    stats: { totalScore, scoreToPar, firPct, girPct, avgPutts, sgTotal, sgOffTee, sgApproach, sgAroundGreen, sgPutting },
    unreviewedVoiceExtractionCount
  }
}
```
