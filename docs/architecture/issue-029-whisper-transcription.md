# Issue 029 — FFmpeg Audio Extraction + Whisper Transcription

**Phase:** 6 — Clip Import Pipeline  
**Depends on:** Issue 028  
**Branch:** `feature/issue-029-whisper-transcription`

---

## Objective

Extract audio from GoPro clips using FFmpeg and transcribe via OpenAI Whisper API. Store timestamped transcripts for the Nova extraction step.

---

## Acceptance Criteria

- [ ] Vercel Function extracts audio from MP4 using FFmpeg-static (Node.js runtime)
- [ ] Audio extracted as MP3 at 64kbps (sufficient for speech)
- [ ] Audio uploaded to Vercel Blob temporarily (`/tmp-audio/[clipId].mp3`)
- [ ] Whisper API returns transcript with word-level timestamps
- [ ] Full transcript stored in `clips.transcript`
- [ ] Transcript confidence stored in `clips.transcript_confidence`
- [ ] Audio file deleted from Blob after transcript stored
- [ ] Clips with no speech: empty transcript stored, not an error
- [ ] Triggered automatically after GPMF parse completes (Job B)

---

## FFmpeg command

```bash
ffmpeg -i input.mp4 -vn -acodec libmp3lame -ab 64k -ar 22050 output.mp3
```

Using `ffmpeg-static` npm package — binary bundled into Vercel Function.

---

## Whisper API call

```typescript
const transcript = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  response_format: 'verbose_json',
  timestamp_granularities: ['word'],
  language: 'en',
  prompt: 'Golf round commentary. Hole numbers, club names like driver, six iron, pitching wedge, putter. Distances in yards.'
  // Domain-specific prompt improves accuracy significantly
})
```

---

## API spec

### POST /api/clips/[id]/transcribe
```typescript
// Async
// 202
{ status: 'processing', estimatedSeconds: number }
```
