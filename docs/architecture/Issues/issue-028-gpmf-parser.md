# Issue 028 — GPMF Metadata Parser

**Phase:** 6 — Clip Import Pipeline  
**Depends on:** Issue 027  
**Branch:** `feature/issue-028-gpmf-parser`

---

## Objective

Build the GPMF telemetry parser as a Python Vercel Function. Extracts device name, capture timestamp, gyroscope orientation, and GPS from GoPro MP4 files.

---

## Acceptance Criteria

- [ ] Python Vercel Function at `api/clips/parse-gpmf.py` processes clip by Blob URL
- [ ] Extracts: DVNM (device name), GPSU (UTC timestamp), GYRO (gyroscope), GPS5 (GPS if present)
- [ ] Device name used as primary angle signal: "DTL" → dtl (0.95), "FO"/"face_on" → face_on (0.95)
- [ ] Gyroscope resting orientation (first 30 frames) computed and stored
- [ ] Capture timestamp extracted — stored for future matching
- [ ] Results written to `clips`: `gpmf_device_name`, `capture_timestamp`, `camera_angle`, `angle_confidence`
- [ ] Handles: no GPMF track, corrupt GPMF, missing GPS gracefully — does not fail pipeline
- [ ] Triggered by Job A after clip confirm

---

## Python function structure

```python
def extract_gpmf(mp4_bytes: bytes) -> dict:
    """Returns: { device_name, capture_timestamp, gyro_orientation, gps_available, gps_first_point }"""

def classify_angle(device_name: str | None, gyro: list | None) -> tuple[str, float]:
    """
    Logic:
    1. Device name 'DTL' → ('dtl', 0.95)
    2. Device name 'FO', 'FACE', 'face_on' → ('face_on', 0.95)
    3. Gyro Y-axis resting value → orientation-based classification
    4. No signals → ('unknown', 0.0)
    """
```

---

## Camera naming convention (document in camera setup UI)

> Name your cameras in GoPro Quik:
> - DTL camera: **"DTL"**
> - Face-on camera: **"FO"**
> The app detects these automatically from video metadata.

---

## Notes for Claude Code

- Use `gpmf-parser` Python library or `gopro-telemetry` npm package — choose whichever has better MP4 stream support
- Download clip to `/tmp` for processing, clean up after
- If no GPMF track: set `angle_confidence = 0.0`, `camera_angle = 'unknown'`, continue pipeline
