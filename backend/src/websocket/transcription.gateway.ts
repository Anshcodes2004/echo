import type { IncomingMessage } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { env } from "../config/env.js";
import { DeepgramLiveSession } from "../services/deepgram.service.js";
import { RecordingService } from "../services/recording.service.js";

type ClientMessage = { type: "stop" | "ping" };

/** Accepts only binary Opus audio chunks and mirrors transcript events to one browser. */
export class TranscriptionGateway {
  private readonly server = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 });
  private readonly active = new Set<string>();

  constructor(private readonly recordings: RecordingService) {}

  handleUpgrade(request: IncomingMessage, socket: any, head: Buffer) {
    const url = new URL(request.url ?? "", "http://localhost");
    const id = url.pathname.match(/^\/ws\/transcriptions\/([^/]+)$/)?.[1];
    if (!id || this.active.has(id) || !isAllowedOrigin(request.headers.origin)) return socket.destroy();
    this.server.handleUpgrade(request, socket, head, (ws) => void this.open(ws, id));
  }

  private async open(ws: WebSocket, id: string) {
    const recording = await this.recordings.get(id);
    if (!recording || recording.status !== "recording") return ws.close(1008, "Recording is not available for streaming");
    this.active.add(id);
    let stopped = false;
    const finish = async () => {
      if (stopped) return;
      stopped = true;
      await session.close();
      const result = await this.recordings.finalize(id);
      send(ws, { type: "completed", recordingId: id, status: result?.status ?? "failed" });
      ws.close(1000, "Recording finalized");
    };
    const session = new DeepgramLiveSession(recording.mode, recording.transcriptionLanguage, {
      onInterim: (segment) => send(ws, { type: "transcript", isFinal: false, ...segment }),
      onFinal: async (segment) => {
        const updated = await this.recordings.appendFinal(id, segment);
        if (updated) send(ws, { type: "transcript", ...segment });
      },
      onError: (error) => {
        send(ws, { type: "error", code: "DEEPGRAM_ERROR", message: "Transcription connection failed. Your finalized transcript has been preserved." });
        console.error("Deepgram error", error.message);
      },
      onClose: () => undefined,
    });
    const timeout = setTimeout(() => {
      send(ws, { type: "error", code: "RECORDING_LIMIT", message: "Maximum recording duration reached." });
      void finish();
    }, env.MAX_RECORDING_MINUTES * 60_000);

    ws.on("message", (data, isBinary) => {
      if (stopped) return;
      if (isBinary) return session.send(toBuffer(data));
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;
        if (message.type === "stop") void finish();
        if (message.type === "ping") send(ws, { type: "pong" });
      } catch { send(ws, { type: "error", code: "BAD_MESSAGE", message: "Unsupported streaming message." }); }
    });
    ws.on("close", () => { clearTimeout(timeout); this.active.delete(id); if (!stopped) void session.close(); });
    ws.on("error", () => undefined);
    send(ws, { type: "ready", recordingId: id });
  }
}

function send(ws: WebSocket, payload: unknown) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload)); }
function isAllowedOrigin(origin?: string) { return !origin || origin === env.CORS_ORIGIN; }
function toBuffer(data: unknown) {
  if (Buffer.isBuffer(data)) return data;
  if (Array.isArray(data)) return Buffer.concat(data.map((item) => Buffer.from(item)));
  return Buffer.from(data as ArrayBuffer);
}
