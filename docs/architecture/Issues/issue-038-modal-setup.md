# Issue 038 — Modal App Setup + Job Dispatch + Status Polling

**Phase:** 8 — CV Processing  
**Depends on:** Issue 027  
**Branch:** `feature/issue-038-modal-setup`

---

## Objective

Set up the Modal serverless compute app, build job dispatch from Vercel Functions, and implement status polling.

---

## Acceptance Criteria

- [ ] Modal app `tracitai-cv` created with: mediapipe, opencv-python, torch, ultralytics
- [ ] `process_shot_clip(clip_url, camera_angle, shot_clip_id, callback_url, auth_token)` Modal function defined
- [ ] `POST /api/cv/dispatch` calls Modal and returns job ID
- [ ] Modal downloads clip from Vercel Blob, processes, POSTs results to callback URL
- [ ] `GET /api/cv/status/[shotClipId]` returns current status
- [ ] Frontend polls every 10 seconds until complete or failed
- [ ] Failed jobs: error stored in `shot_clips`, retry button in UI
- [ ] Modal timeout: 600 seconds
- [ ] `trackEvent('cv.job_dispatched')` and `trackEvent('cv.job_completed')`

---

## Modal function — modal_app/process_clip.py

```python
import modal

app = modal.App("tracitai-cv")

image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "mediapipe>=0.10", "opencv-python-headless", "torch", "ultralytics", "requests", "numpy"
)

@app.function(image=image, cpu=4, memory=8192, timeout=600, retries=1)
def process_shot_clip(clip_url: str, camera_angle: str, shot_clip_id: str, callback_url: str, auth_token: str) -> dict:
    # 1. Download clip from Vercel Blob
    # 2. Run MediaPipe (Issue 039)
    # 3. Run TrackNet (Issue 040)
    # 4. POST results to callback_url
    pass
```

---

## Callback security

`MODAL_CALLBACK_SECRET` env var — 32 byte random. Vercel Function validates `Authorization: Bearer [secret]` on callback endpoint. Never exposed to client.

---

## API specs

### POST /api/cv/dispatch
```typescript
{ shotClipId: string }
// 202
{ jobId: string, status: 'dispatched' }
```

### POST /api/cv/callback (Modal → Vercel, internal)
```typescript
// Authorization: Bearer [MODAL_CALLBACK_SECRET]
{ shotClipId, status: 'complete'|'failed', ballFlightData?, poseLandmarksDtl?, poseLandmarksFo?, error? }
```
