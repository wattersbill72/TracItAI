# Issue 027 — Vercel Blob Presigned Upload + Clip Record Creation

**Phase:** 6 — Clip Import Pipeline  
**Depends on:** Issue 022  
**Branch:** `feature/issue-027-blob-upload`

---

## Objective

Build the video clip upload mechanism: presigned Vercel Blob URLs, direct browser-to-Blob uploads, upload confirmation, and clip record creation.

---

## Acceptance Criteria

- [ ] `POST /api/clips/upload-url` returns presigned Blob URL for direct browser upload
- [ ] Browser uploads MP4 directly to Vercel Blob — no video passes through Vercel Functions
- [ ] `POST /api/clips/confirm` called after upload — creates clip record, enqueues Job A
- [ ] Multiple clips uploadable concurrently with per-clip progress
- [ ] Supports files up to 4GB
- [ ] Clip record created with `processing_status = 'pending'` immediately on confirm
- [ ] Failed uploads can be retried
- [ ] Only MP4 files accepted — validated client-side AND server-side (MIME + magic bytes)
- [ ] Upload progress shown as percentage per file

---

## Upload flow

```
1. User selects files
2. For each file:
   a. POST /api/clips/upload-url → { uploadUrl, blobUrl, clipId }
   b. PUT uploadUrl (direct to Blob, track progress)
   c. POST /api/clips/confirm → creates DB record, enqueues GPMF job
3. UI: queued → uploading (%) → processing → done
```

---

## API specs

### POST /api/clips/upload-url
```typescript
{ filename: string, fileSizeBytes: number, sessionId: string }
// 201
{ uploadUrl: string, blobUrl: string, clipId: string, expiresAt: string }
// 400: non-MP4
{ error: 'Only MP4 files are accepted', code: 'INVALID_FILE_TYPE' }
```

### POST /api/clips/confirm
```typescript
{ clipId: string, blobUrl: string }
// 201
{ clip: { id, filename, processingStatus: 'pending', blobUrl } }
```

### GET /api/clips/[id]/status
```typescript
{ clip: { id, filename, processingStatus, gpmfStatus, transcriptStatus, metadataStatus, cameraAngle, angleConfidence } }
```

---

## Notes for Claude Code

- Use `@vercel/blob` for presigned URL generation
- MP4 magic bytes: `00 00 00 xx 66 74 79 70` (ftyp box) — validate server-side
- Poll `/api/clips/[id]/status` every 3 seconds until complete
