# Issue 039 — MediaPipe Pose Landmark Extraction

**Phase:** 8 — CV Processing  
**Depends on:** Issue 038  
**Branch:** `feature/issue-039-mediapipe`

---

## Objective

Implement MediaPipe pose estimation within the Modal function. Extract 33 body landmarks per frame, compute swing attribute measurements, and write results as shot tags.

---

## Acceptance Criteria

- [ ] MediaPipe PoseLandmarker (Heavy model) runs on clip frames
- [ ] Samples every 3rd frame (20fps effective from 60fps)
- [ ] Swing phases detected: Address, Top of backswing, Impact, Follow-through
- [ ] Per-phase measurements computed (see below)
- [ ] Results stored as JSONB in `shot_clips.pose_landmarks_dtl` and `pose_landmarks_fo`
- [ ] Auto-detected attributes written as `shot_tags` (source: `auto_cv`) with confidence scores
- [ ] Handles frames where golfer not detected gracefully

---

## Measurements to compute

**At Address:**
- Spine angle (shoulder midpoint → hip midpoint vs vertical)
- Ball position relative to stance (back/center/forward)
- Stance width in normalized units

**At Top:**
- Shoulder rotation degrees from address
- Hip rotation degrees from address
- Wrist position relative to head

**At Impact:**
- Hip/shoulder separation angle
- Head position delta from address (lateral drift)

**Swing mechanics:**
- Early release: wrist unhinge rate approaching impact
- Early extension: hip proximity to address line through impact
- Lateral sway: hip midpoint delta DTL

---

## Key landmarks

```python
LANDMARKS = {
    'left_shoulder': 11, 'right_shoulder': 12,
    'left_elbow': 13, 'right_elbow': 14,
    'left_wrist': 15, 'right_wrist': 16,
    'left_hip': 23, 'right_hip': 24,
    'left_knee': 25, 'right_knee': 26,
    'left_ankle': 27, 'right_ankle': 28,
    'left_heel': 29, 'right_heel': 30,
}
```
