# Issue 040 — Ball Flight Detection (YOLO + ByteTrack)

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

## Implementation

**Use: YOLOv8 nano + ByteTrack**

- `pip install ultralytics` (already in Modal image)
- ByteTrack (`pip install lapx`) for multi-frame trajectory consistency
- YOLOv8 nano trained on sports ball detection — use `ultralytics` pretrained weights or fine-tune on golf ball frames if accuracy is insufficient
- Document model weights version and source in code comments

This was chosen over TrackNetV3 because: ultralytics is already a Modal image dependency, pip install is straightforward, licensing is clear (AGPL for ultralytics — acceptable for this use case), and documentation is excellent.

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
