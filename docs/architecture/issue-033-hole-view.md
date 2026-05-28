# Issue 033 — Hole View — Shot List + Scorecard Summary

**Phase:** 7 — Shot Review  
**Depends on:** Issue 026, 032  
**Branch:** `feature/issue-033-hole-view`

---

## Objective

Build the hole-level view: shot list, scorecard summary, clip thumbnails, and hole navigation.

---

## Acceptance Criteria

- [ ] `/rounds/[id]/holes/[n]` renders hole view
- [ ] Hole header: number, par, yards, HCP, score, FIR, GIR, putts
- [ ] Previous/next hole navigation (keyboard arrows on desktop)
- [ ] Shot list: all shots in order, club, distance, SG, result, thumbnail if clip matched
- [ ] Click shot row → `/shots/[id]`
- [ ] Untagged shots highlighted — encourage tagging
- [ ] SG bar per shot: visual positive/negative indicator
- [ ] Hole-level SG summary
- [ ] "Add shot" button for missed shots
- [ ] "Edit hole summary" inline edit
- [ ] Clips section: all clips matched to this hole with status

---

## Hole view layout

```
← Hole 6      Hole 7 of 18      Hole 8 →

Par 4 · 387 yds · HCP 11
Score: 5 (+1)  FIR: ✗ Left  GIR: ✗  Putts: 2
SG: −0.7  (Off tee −0.3  Approach −0.4  Putting 0.0)

━━━━━━━━━━━━━━━━━━━━━━━
SHOTS
[thumb] Shot 1 · Driver · 247 yds · Left rough
        SG: −0.3 | Pull · Early release (auto)    [→]

[thumb] Shot 2 · PW · 42 yds · Green
        SG: −0.4 | No tags yet               ⚠   [→]

[    ] Shot 3 · PT · 34 ft · Holed
        SG: +0.0 | 2 putts                        [→]

[+ Add missed shot]

━━━━━━━━━━━━━━━━━━━━━━━
CLIPS (2)
GH010142.MP4 · DTL · 2m14s    ✓ CV complete
GH010143.MP4 · Face-on · 2m31s ✓ CV complete
```

---

## API spec

### GET /api/sessions/[id]/holes/[n]
```typescript
{ hole: { number, par, yards, handicapIndex, summary: { score, fairwayHit, gir, putts, penaltyStrokes }, shots: Array<{ id, shotNumber, club, distanceYards, lie, shotResult, sgTotal, sgCategory, tagCount, hasUnconfirmedTags, clipThumbnailUrl }>, clips: Array<{ id, filename, cameraAngle, durationSeconds, cvProcessingStatus }>, sgSummary: { total, offTee, approach, aroundGreen, putting } } }
```
