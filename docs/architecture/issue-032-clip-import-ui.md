# Issue 032 — Clip Import UI

**Phase:** 6 — Clip Import Pipeline  
**Depends on:** Issue 031  
**Branch:** `feature/issue-032-clip-import-ui`

---

## Objective

Build the complete clip import UI: file selection, upload progress, processing status, camera angle review, and the clarification queue.

---

## Acceptance Criteria

- [ ] `/import` renders inside AppShell
- [ ] Round selector: choose which session clips belong to
- [ ] Drop zone + browse button — both work on desktop, iPad, iPhone
- [ ] Per-clip progress: queued → uploading (%) → GPMF → transcribing → classifying → done/needs review
- [ ] Processing continues in background — user can navigate away
- [ ] 4 tabs: Upload | Needs review (count badge) | Matched | Model accuracy
- [ ] Clarification queue: angle + hole selection, "Learn from this" checkbox
- [ ] Accept all / reject all / individual decisions
- [ ] Mobile: file picker button replaces drop zone on iPhone

---

## Tab contents

**Tab 1 — Upload**
Drop zone or file picker. Summary bar: X uploaded, Y matched, Z need review. Processing queue list with per-file status.

**Tab 2 — Needs review**
Count badge on tab. Per-clip clarification card: thumbnail, confidence badge, angle buttons, hole buttons, "Learn from this" checkbox, Skip / Confirm actions.

**Tab 3 — Matched**
Table: filename, hole, angle, shots matched, confidence. Click → hole view.

**Tab 4 — Model accuracy**
Progress bars per classification type. Round count. Accuracy trend.

---

## API specs

### GET /api/sessions/[id]/clip-import-status
```typescript
{ total, uploaded, processing, matched, needsReview, failed, clips: Array<{ id, filename, processingStatus, cameraAngle, angleConfidence, matchedHole, matchedShots }> }
```

### POST /api/clarification/[id]/resolve
```typescript
{ cameraAngle: 'dtl' | 'face_on' | 'discard', holeNumber: number | null, learnFromThis: boolean }
// 200
{ shotClip: { id, ... } | null }
```
