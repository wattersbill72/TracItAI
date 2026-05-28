# Issue 023 — Strokes Gained Calculation Engine

**Phase:** 5 — Round + Shot Entry  
**Depends on:** Issue 002  
**Branch:** `feature/issue-023-sg-engine`

---

## Objective

Implement the strokes gained calculation engine as pure TypeScript using Mark Broadie's published baseline tables. This is the single source of truth for all SG calculations — no inline calculations anywhere else in the app.

---

## Acceptance Criteria

- [ ] `src/lib/sg.ts` exports all calculation functions — zero DB calls, pure functions only
- [ ] `calculateShotSG(startLie, startDistance, endLie, endDistance)` returns SG for one shot
- [ ] `categorizeShotType(shot, holeData)` returns SG category
- [ ] `calculateRoundSG(shots, holes)` returns totals per category and overall
- [ ] Baseline lookup table embedded as TypeScript constant (not DB lookup) for performance
- [ ] Linear interpolation for distances between table entries
- [ ] Unit tests: par 3 tee shot, fairway approach, greenside chip, putt, penalty shot
- [ ] `npm run db:seed:sg-baseline` seeds the DB table for admin visibility
- [ ] Edge cases handled: distance = 0 (holed), unknown lie, penalty strokes

---

## Broadie baseline table (implement full version)

```typescript
// src/lib/sg-baseline.ts — abbreviated below, implement full 5-yard intervals
export const SG_BASELINE: Record<string, Record<number, number>> = {
  tee:      { 600: 5.00, 550: 4.84, 500: 4.67, 450: 4.50, 400: 4.33, 350: 4.16, 300: 3.99, 250: 3.81, 200: 3.63, 150: 3.44 },
  fairway:  { 250: 3.72, 225: 3.57, 200: 3.41, 175: 3.25, 150: 3.08, 125: 2.91, 100: 2.72, 75: 2.52, 50: 2.30, 25: 2.02 },
  rough:    { 250: 3.92, 225: 3.77, 200: 3.61, 175: 3.45, 150: 3.28, 125: 3.11, 100: 2.92, 75: 2.72, 50: 2.50, 25: 2.18 },
  sand:     { 50: 2.64, 40: 2.52, 30: 2.40, 20: 2.28, 10: 2.16, 5: 2.05 },
  recovery: { 150: 3.80, 100: 3.50, 75: 3.25, 50: 3.00, 25: 2.70 },
  green:    { 50: 2.40, 40: 2.30, 30: 2.17, 20: 2.00, 15: 1.90, 10: 1.77, 8: 1.65, 6: 1.52, 5: 1.46, 4: 1.38, 3: 1.28, 2: 1.14, 1: 1.00 }
}
```

**Note:** These values are illustrative. Research and implement Broadie's actual published tables at full granularity (5-yard intervals for full shots, 1-foot intervals for putting).

---

## Core functions

```typescript
export function getExpectedStrokes(lie: string, distance: number): number
export function calculateShotSG(startLie: string, startDistanceYards: number, endLie: string, endDistanceFeet: number): number
export function categorizeShotType(shotNumber: number, holePar: number, startLie: string, startDistanceYards: number): 'off_tee' | 'approach' | 'around_green' | 'putting'
export function calculateRoundSG(shots: ShotInput[], holes: HoleInput[]): { sgTotal, sgOffTee, sgApproach, sgAroundGreen, sgPutting }
export function isPenaltyShot(lie: string): boolean
```

---

## Category assignment logic

```
shot_number = 1 AND hole.par IN (4,5) → off_tee
lie IN (fairway, rough, recovery) AND pin_distance > 30 yards → approach
lie IN (fringe, sand) OR pin_distance ≤ 30 yards → around_green
lie = green → putting
```

---

## Integration

Called from `src/server/services/shotService.ts` after shot data is saved. Result stored in `shots.sg_*` columns with `sg_source = 'calculated'`.
