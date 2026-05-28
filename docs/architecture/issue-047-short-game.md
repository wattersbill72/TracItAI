# Issue 047 — Short Game Session

**Phase:** 10 — Range + Short Game  
**Depends on:** Issue 046  
**Branch:** `feature/issue-047-short-game`

---

## Objective

Build the short game session module for chipping and putting practice. Distinct shot types, distances, club picker, and camera guidance.

---

## Acceptance Criteria

- [ ] `/short-game` creates and manages short game sessions
- [ ] Shot types: chip | pitch | flop | bunker | putt
- [ ] Distance slider: 0–50 yds chipping, 0–60 ft putting
- [ ] Club picker: wedges only for chip/pitch, putter for putt
- [ ] Camera setup notes: "Face-on camera is most useful for short game"
- [ ] Putter path metric (from CV) replaces ball arc for putting
- [ ] No ball flight arc for very short shots — handled gracefully

---

## Short game session view

```
Short Game — May 25, 2026

CHIPPING (22 shots)
  PW from 30 yds: 8 shots
  SW from 15 yds: 6 shots

PUTTING (18 shots)
  10–15 ft: 6 shots · Made: 4 (67%)
  5–10 ft: 8 shots · Made: 7 (88%)
```
