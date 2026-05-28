# Issue 030 — Bedrock Nova Shot Metadata Extraction

**Phase:** 6 — Clip Import Pipeline  
**Depends on:** Issue 029, 025  
**Branch:** `feature/issue-030-nova-extraction`

---

## Objective

Use AWS Bedrock Nova Lite to extract structured shot data from Whisper transcripts. Create draft shot records ready for user confirmation.

---

## Acceptance Criteria

- [ ] Nova Lite called with transcript + session context (course, tee, hole data)
- [ ] Returns structured JSON array of shot objects per clip
- [ ] Draft shot records created in `shots` table with `entry_method = 'voice'`
- [ ] Each shot has a `confidence` score
- [ ] Low-confidence fields set to null — not guessed
- [ ] Multiple shots in one clip handled correctly
- [ ] Uses the Nova prompt from Issue 025 verbatim — do not create a new prompt
- [ ] Triggered automatically after Whisper transcription completes (Job C)

---

## Draft shot lifecycle

```
Nova extraction → draft shot (entry_method='voice', user_confirmed=null)
User confirms  → shot saved (user_confirmed=true)
User edits     → modified shot saved (user_confirmed=true)
User discards  → shot deleted
```

---

## API specs

### GET /api/sessions/[id]/draft-shots
```typescript
{ drafts: Array<{ id, clipId, clipFilename, holeNumber, shotNumber, club, distanceYards, lie, shotResult, conditions, swingThoughts, confidence, voiceTranscript }> }
```

### POST /api/shots/[id]/confirm
```typescript
{ action: 'confirm' | 'discard', holeNumber?, shotNumber?, club?, distanceYards?, lie?, shotResult?, pinDistanceFeet? }
// 200
{ shot: { id, sgTotal, ... } | null }
```
