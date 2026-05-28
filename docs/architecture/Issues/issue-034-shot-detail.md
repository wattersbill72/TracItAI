# Issue 034 — Shot Detail — Video Player + Arc Overlay

**Phase:** 7 — Shot Review  
**Depends on:** Issue 033  
**Branch:** `feature/issue-034-shot-detail`

---

## Objective

Build the shot detail page: video review with ball arc overlay, camera angle switcher, shot data summary, and tag panels.

---

## Acceptance Criteria

- [ ] `/shots/[id]` renders inside AppShell
- [ ] HTML5 `<video>` player with controls and fullscreen support
- [ ] Camera angle switcher: DTL | Face-on tabs switch which clip plays
- [ ] Arc overlay: SVG arc rendered over video from `ball_flight_data`
- [ ] Arc overlay toggleable on/off
- [ ] Playback speed: 1x, 0.5x, 0.25x
- [ ] Shot metadata panel: club, distance, lie, result, SG breakdown
- [ ] Auto-detected tag panel (Issue 035) below video
- [ ] Manual tag panel (Issue 036) below auto-detected
- [ ] Previous/next shot navigation within hole
- [ ] "Edit shot data" inline edit
- [ ] Arccos SG override input fields (manual entry of Arccos app values)

---

## Shot detail layout

```
← Shot 1    Hole 7 · Shot 2    Shot 3 →

[  VIDEO PLAYER                          ]
[  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ⏸  ]
[  [DTL] [Face-on]   [0.25x][0.5x][1x]  ]
[  [Arc overlay: ON]                     ]

PW · 42 yds · Rough → Green
SG: −0.4  (Approach)

━━━━━━━━━━━━━━━━━━
AUTO-DETECTED TAGS (Issue 035)
━━━━━━━━━━━━━━━━━━
MANUAL TAGS + NOTES (Issue 036)
━━━━━━━━━━━━━━━━━━
ARCCOS SG OVERRIDE
  Off tee: [  ]  Approach: [  ]
  Around green: [  ]  Putting: [  ]
  [Save Arccos values]
```

---

## Arc overlay rendering

Ball flight data: `{frame, x, y, confidence}[]` from TrackNet.

```typescript
// Convert frame positions to video-relative coordinates
// Draw smooth cubic bezier through detected points
// Color: green (high confidence), amber (medium), skip (low)
// Start dot (address), landing dot, apex marker
// Label: "247 yds · 6-iron"
```

If CV not yet complete: "CV processing..." overlay, poll every 10s.
If CV failed: "Analysis unavailable" + retry button.

---

## API spec

### GET /api/shots/[id]
```typescript
{ shot: { id, holeNumber, shotNumber, club, distanceYards, lie, shotResult, pinDistanceFeet, sgTotal, sgOffTee, sgApproach, sgAroundGreen, sgPutting, sgSource, voiceTranscript, entryMethod, clips: Array<{ id, cameraAngle, trimmedBlobUrl, durationSeconds, ballFlightData, cvProcessingStatus }>, tags: Array<{ id, category, tagKey, tagValue, measuredValue, source, confidence, userConfirmed }> } }
```
