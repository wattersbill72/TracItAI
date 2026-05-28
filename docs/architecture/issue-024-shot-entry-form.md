# Issue 024 — Post-Round Form Entry

**Phase:** 5 — Round + Shot Entry  
**Depends on:** Issue 022, 023  
**Branch:** `feature/issue-024-shot-entry-form`

---

## Objective

Build the post-round scorecard form: hole-by-hole data entry optimized for mobile. This is a first-class entry method — not a fallback.

---

## Acceptance Criteria

- [ ] `/rounds/[id]/enter` renders shot entry form
- [ ] Hole navigation: previous/next buttons, hole selector, progress indicator
- [ ] Per-hole entry: score, FIR (yes/left/right), GIR, putts, penalty strokes
- [ ] Shot detail expansion: add individual shots with club, distance, lie, result
- [ ] Club picker: full club list with recent clubs shown first
- [ ] Distance entry: slider (0–300 yds) OR keyboard input — both work
- [ ] Hole auto-advances after save, option to stay
- [ ] Progress saved after each hole — partial entry is safe
- [ ] SG calculated automatically as shots are saved (when distance data entered)
- [ ] `trackEvent('round.shot_entry_form')` on completion

---

## Single hole form layout

```
Hole 7 of 18  ← [7] →          [Jump to hole ▼]
Par 4 · 387 yards · HCP 11
━━━━━━━━━━━━━━━━━━━━━━━
Score:   [3] [4] [5✓] [6] [7] [+]
Fairway: [✓ Hit] [← Left] [→ Right] [N/A par 3]
GIR:     [✓ Yes] [✗ No]
Putts:   [−] 2 [+]
Penalty: [−] 0 [+]

▼ Add shots (optional)
  Shot 1: [Club ▼] [247 yds] [Fairway ▼] [Left rough ▼]
  Shot 2: [Club ▼] [42 yds]  [Rough ▼]   [Green ▼]
  [+ Add shot]

Notes: [optional]
[Save hole →]
```

---

## Club picker component

```
Recent: [6i] [PW] [DR]
Woods:   [DR] [3W] [5W]
Hybrids: [2H] [3H] [4H]
Irons:   [4i] [5i] [6i] [7i] [8i] [9i]
Wedges:  [PW] [GW] [SW] [LW]
Other:   [PT] [Unplayable]
```

---

## API specs

### POST /api/sessions/[id]/holes/[n]/summary
```typescript
{ par, score, fairwayHit?, fairwayMissDirection?, gir?, putts?, penaltyStrokes?, notes? }
// 201
{ holeSummary: { id, holeNumber, score, ... } }
```

### POST /api/sessions/[id]/shots
```typescript
{ holeNumber, shotNumber, club, distanceYards?, lie, shotResult?, pinDistanceFeet?, notes?, entryMethod: 'form' }
// 201
{ shot: { id, sgTotal, sgCategory, ... } }
```
