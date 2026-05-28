# Issue 040 — TrackNet Ball Flight Detection

**Phase:** 8 — CV Processing  
**Depends on:** Issue 038  
**Branch:** `feature/issue-040-tracknet`

---

## Objective

Implement ball flight detection on DTL camera clips. Extract ball position per frame to build the arc overlay data.

---

## Acceptance Criteria

- [ ] Ball tracking runs on DTL camera clips only
- [ ] Returns `{frame, x, y, confidence}` per frame where ball detected
- [ ] Ball not detected → `confidence: 0`, not an error
- [ ] Post-processing: smooth trajectory, remove outlier points
- [ ] Arc start (address) and landing point identified
- [ ] Apex frame identified
- [ ] Output: `{frame, x, y, confidence, isApex, isLanding}[]`
- [ ] Handles: ball leaving frame, motion blur at impact, dark backgrounds
- [ ] Falls back gracefully if ball never detected

---

## Implementation options

**Option A: TrackNet** (purpose-built for sports ball tracking)
- nttcom/TrackNetV3 or similar
- Best accuracy for small fast balls

**Option B: YOLO + ByteTrack**
- YOLOv8 nano + ByteTrack for multi-frame consistency
- More general purpose, well-documented

Choose whichever is available via pip without licensing issues. Document the choice in code comments.

---

## Output function signature

```python
def track_ball(video_path: str) -> list[dict]:
    """
    Returns:
    [{
        "frame": int,
        "timestamp_ms": float,
        "x": float,          # normalized 0-1 left to right
        "y": float,          # normalized 0-1 top to bottom
        "confidence": float,
        "is_apex": bool,
        "is_landing": bool
    }]
    """
```
