# Issue 041 — CV Results Write + Arc Overlay Render

**Phase:** 8 — CV Processing  
**Depends on:** Issue 039, 040  
**Branch:** `feature/issue-041-cv-results`

---

## Objective

Write CV processing results to the database and render the ball flight arc overlay image used in the shot detail player.

---

## Acceptance Criteria

- [ ] MediaPipe results written to `shot_clips.pose_landmarks_dtl/fo` as JSONB
- [ ] TrackNet results written to `shot_clips.ball_flight_data` as JSONB
- [ ] Auto-detected swing attributes written as `shot_tags` (source: `auto_cv`)
- [ ] Arc overlay PNG rendered from ball_flight_data — smooth bezier curve
- [ ] Arc overlay uploaded to Vercel Blob as `arc-overlays/[shotClipId].png`
- [ ] `shot_clips.arc_overlay_blob_url` updated
- [ ] `shot_clips.cv_processing_status` set to `complete`
- [ ] Frontend notified via next status poll

---

## Arc overlay rendering

```python
import cv2
import numpy as np

def render_arc_overlay(ball_positions: list[dict], frame_width: int, frame_height: int) -> bytes:
    """
    Transparent PNG with:
    - Smooth cubic bezier arc through detected positions
    - Start circle (address)
    - Landing circle
    - Apex marker
    - Green for high confidence, amber for medium
    Returns PNG bytes
    """
    img = np.zeros((frame_height, frame_width, 4), dtype=np.uint8)  # RGBA transparent
    # Filter to confidence > 0.5
    # Fit bezier curve
    # Draw with anti-aliasing
    # Return PNG bytes via cv2.imencode
```
