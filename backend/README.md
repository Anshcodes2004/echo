# Echo backend

Server-side service for persisted recordings, real-time Deepgram transcription, and structured meeting/personal analysis.

## Setup

1. Copy `.env.example` to `.env` and set every required value.
2. Run `pnpm install` in this directory.
3. Run `pnpm dev`.

The backend starts on `PORT` (default `3001`). MongoDB must be available before startup.

## HTTP API

- `POST /api/recordings` creates a recording session.
- `GET /api/recordings` lists recordings; supports `mode`, `query`, `limit`, and `offset`.
- `GET/PATCH/DELETE /api/recordings/:id` reads, renames, or deletes a recording.
- `POST /api/recordings/:id/finalize` completes analysis for a saved session.
- `GET /api/health` reports readiness.

## Streaming protocol

Open `ws://<host>/ws/transcriptions/<recordingId>` after creating a recording. Send binary Opus audio chunks (from a `MediaRecorder` configured for Opus). The server emits JSON messages:

```text
{ type: "ready", recordingId }
{ type: "transcript", isFinal, startMs, endMs, speaker, text }
{ type: "error", code, message }
{ type: "completed", recordingId, status }
```

Send `{ "type": "stop" }` after the final audio chunk. Final transcript segments are persisted before AI analysis runs. The AI service writes validated, timestamp-traceable JSON and cannot make a failed analysis erase the transcript.
