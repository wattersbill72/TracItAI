# Issue 037 — Clarification Queue UI

**Phase:** 7 — Shot Review  
**Depends on:** Issue 031, 036  
**Branch:** `feature/issue-037-clarification-ui`

---

## Objective

Build the clarification queue UI for resolving low-confidence clip assignments. Every resolved clarification improves future classification.

---

## Acceptance Criteria

- [ ] Clarification queue accessible from: clip import tab, round view badge, dashboard notification
- [ ] Each card: clip thumbnail, filename, confidence %, reason for uncertainty
- [ ] Angle selection: DTL | Face-on | Discard
- [ ] Hole selection: buttons for each hole in the session
- [ ] "Learn from this answer" checkbox: checked by default
- [ ] Dismiss without answering: moves to bottom of queue
- [ ] After resolving: `shot_clips` record created or clip marked discarded
- [ ] Empty state: "All clips classified!"
- [ ] "Accept all suggestions" bulk action
- [ ] Keyboard navigation on desktop: arrows for angle, number keys for hole

---

## Clarification card

```
GH010147.MP4                     [52% confidence ⚠]
2m14s · 11:14 AM

Timestamp matches Hole 5 or 6 — both within 4 minutes.
GPMF gyro suggests DTL but first-frame pose is ambiguous.

Camera angle:
  [DTL ✓]  [Face-on]  [Discard]

Hole:
  [H1][H2][H3][H4][H5][H6✓][H7][H8][H9]
  [H10]...[H18]

  ☑ Use my answer to improve future classification

[Skip for now]          [Confirm →]
```
