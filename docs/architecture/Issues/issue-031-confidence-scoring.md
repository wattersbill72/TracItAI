# Issue 031 — Confidence Scoring + Clarification Queue

**Phase:** 6 — Clip Import Pipeline  
**Depends on:** Issue 030  
**Branch:** `feature/issue-031-confidence-scoring`

---

## Objective

Build the confidence scoring system that combines all classification signals into a score per clip-to-shot assignment, and routes low-confidence assignments to the clarification queue.

---

## Acceptance Criteria

- [ ] `src/server/services/confidenceService.ts` computes overall confidence from weighted signals
- [ ] Signals and weights:
  - GPMF device name match: 0.40
  - Gyroscope orientation match: 0.20
  - Voice transcript hole/shot confirmation: 0.25
  - Timestamp proximity to confirmed clips: 0.15
- [ ] Score ≥ 0.75 → auto-create `shot_clips` record
- [ ] Score 0.50–0.74 → `clarification_queue` entry
- [ ] Score < 0.50 → `clarification_queue` entry, high-priority
- [ ] Clarification entries include all signals and their individual scores
- [ ] User resolutions feed back to improve future scoring
- [ ] Camera naming patterns stored per user to calibrate weights

---

## Confidence service interface

```typescript
interface ClassificationSignals {
  gpmfDeviceName: string | null
  gyroOrientation: number[] | null
  transcriptHole: number | null
  transcriptShotNum: number | null
  captureTimestamp: Date | null
  sessionDate: Date
}

interface ConfidenceResult {
  overallScore: number
  angleClassification: 'dtl' | 'face_on' | 'unknown'
  angleConfidence: number
  holeAssignment: number | null
  holeConfidence: number
  signals: SignalBreakdown[]
  action: 'auto_match' | 'clarification_needed' | 'high_priority_review'
}

export function scoreClipAssignment(signals: ClassificationSignals): ConfidenceResult
```
