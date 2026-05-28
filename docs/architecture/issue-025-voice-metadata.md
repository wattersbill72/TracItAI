# Issue 025 — Voice Metadata Extraction

**Phase:** 5 — Round + Shot Entry  
**Depends on:** Issue 022, 023  
**Branch:** `feature/issue-025-voice-metadata`

---

## Objective

Build the voice-to-shot-data pipeline: extract audio from GoPro clips, transcribe via Whisper, parse structured shot data via Bedrock Nova, and create draft shot records for user confirmation.

---

## Acceptance Criteria

- [ ] Audio extraction runs as a Vercel Python Function using FFmpeg-static
- [ ] Whisper API returns timestamped transcript
- [ ] Nova Lite prompt extracts structured shot data — handles natural language variations and multiple shots per clip
- [ ] Draft shot records created with `entry_method = 'voice'` and confidence score
- [ ] Low-confidence extractions (<0.70) flagged for review
- [ ] High-confidence (≥0.70) pre-populated in review UI — not auto-saved
- [ ] Voice transcript stored on shot record
- [ ] `trackEvent('round.shot_entry_voice')` on completion

---

## Nova Lite extraction prompt

```
You are extracting golf shot data from a spoken transcript recorded during a golf round.

Session context:
- Course: {{courseName}}
- Date: {{sessionDate}}
- Tees: {{teeName}} ({{teeYards}} yards)
- Hole data: {{holeDataJSON}}

Transcript: "{{transcript}}"

Extract ALL golf shots mentioned. For each shot return:
{
  "hole": number | null,
  "shot_number": number | null,
  "club": string | null,
  "distance_yards": number | null,
  "lie": string | null,
  "shot_result": string | null,
  "conditions": string[] | null,
  "swing_thoughts": string | null,
  "confidence": number
}

Return ONLY a JSON array. No preamble, no explanation.
Null any field you cannot extract with reasonable confidence.
```

---

## Recommended spoken convention

> *"Hole seven, shot one, six iron, two forty seven yards, into the wind — came off it a bit, pulled it left"*

Convention is flexible — Nova handles natural language.

---

## Voice entry review UI

```
Voice-extracted shots — review before saving

Hole 7 · Shot 1 (GH010142.MP4)    Confidence: 87%
  Club: 6-iron ✓  Distance: 247 yds ✓  Lie: Fairway ✓
  Conditions: into wind ✓  Thought: "came off it"
  [Save shot] [Edit] [Discard]

[Save all high-confidence shots]
```

---

## API specs

### POST /api/clips/[id]/extract-voice-data
```typescript
// Async — returns immediately
// 202
{ jobId: string, status: 'processing' }
```

### GET /api/sessions/[id]/voice-extractions
```typescript
{ extractions: Array<{ clipId, clipFilename, shots: Array<{ hole, shotNumber, club, distanceYards, lie, shotResult, conditions, swingThoughts, confidence, transcript }> }> }
```

### POST /api/sessions/[id]/shots/from-voice
```typescript
{ clipId, holeNumber, shotNumber, club, distanceYards?, lie, shotResult?, pinDistanceFeet?, swingThoughts?, voiceTranscript }
// 201
{ shot: { id, sgTotal, ... } }
```
