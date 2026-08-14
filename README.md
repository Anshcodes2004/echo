# Echo — Backend Setup

This document explains how to run the backend locally after cloning the repository and creating an `.env` file.

## Prerequisites

- Node.js (18+ recommended)
- npm or pnpm
- MongoDB (local `mongod` or Atlas)

## Environment

The backend uses environment variables validated by `backend/src/config/env.ts`. Create a `.env` file at the repository `backend/` root and set the following values:
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:8080
MONGODB_URI=mongodb+srv://anshkmsc25_db_user:K1oT2IPNNZDpWRPX@cluster0.2hmetbb.mongodb.net/?appName=Cluster0
DEEPGRAM_API_KEY=44636dfa4e3ee4d7035d9c8145874cd9f7d50895
AI_API_TOKEN=sk-475725c2dad1476abbce8741841d476b
AI_API_BASE_URL=https://ai-api.userfacet.com/v1
AI_MODEL=gpt-4o-mini
MAX_RECORDING_MINUTES=180
JWT_SECRET=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

## Install & Run (development)

STEP 1: create .env inside `backend/`  and copy paste values as mentioned above


STEP 2:
From the repository root:

```bash
cd backend
npm install    # or pnpm install
npm run dev    # runs the TypeScript dev server (tsx watch)
```

STEP 3:
Start the frontend in a separate terminal:

```bash
cd ../frontend
npm install
npm run dev
```

## MongoDB

You can run a local `mongod` or use MongoDB Atlas. Ensure `MONGODB_URI` points to a reachable database before starting the backend.

## E2E / Debug scripts

There are helper scripts under `backend/scripts/` such as `e2e.mjs` and `printRecording.mjs`. They assume a running backend and a valid `.env`.

Run:

```bash
cd backend
node scripts/printRecording.mjs <recordingId>
node scripts/e2e.mjs
```

## Troubleshooting

- "Invalid backend environment configuration": check that all required env variables are present and `JWT_SECRET` is at least 32 characters.
- Port already in use: stop the other process or change `PORT`.
- CORS errors: ensure `CORS_ORIGIN` matches your frontend origin (including port).

## Security

- Never commit `.env` to source control. Store secrets in a secure vault or use environment injection in production.

If you want, I can also add a `.env.example` file with placeholders. Say the word and I'll create it.

# Echo backend

Server-side service for persisted recordings, real-time Deepgram transcription, and structured meeting/personal analysis.

## Setup

1. construct `.env` and set every required value.
2. Run `npm install` in this directory.
3. Run `npm dev`.

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
