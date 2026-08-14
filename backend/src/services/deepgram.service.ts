import WebSocket from "ws";
import { env } from "../config/env.js";
import type { RecordingMode, TranscriptSegment } from "../types/recording.js";

type Callbacks = {
  onInterim: (segment: { startMs: number; endMs: number; speaker: string | null; text: string }) => void;
  onFinal: (segment: TranscriptSegment) => Promise<void>;
  onError: (error: Error) => void;
  onClose: () => void;
};

/** Owns one server-side Deepgram live connection; API keys never reach the browser. */
export class DeepgramLiveSession {
  private readonly connection: WebSocket;
  private closed = false;

  constructor(mode: RecordingMode, language: string, callbacks: Callbacks) {
    const query = new URLSearchParams({ model: "nova-3", language, smart_format: "true", punctuate: "true", interim_results: "true", utterance_end_ms: "1200", endpointing: "300", encoding: "linear16", sample_rate: "16000", channels: "1" });
    if (mode === "meeting") query.set("diarize", "true");
    this.connection = new WebSocket(`wss://api.deepgram.com/v1/listen?${query}`, { headers: { Authorization: `Token ${env.DEEPGRAM_API_KEY}` } });
    this.connection.on("message", async (data) => {
      let event: any;
      try { event = JSON.parse(data.toString()); } catch { return; }
      const alternative = event?.channel?.alternatives?.[0];
      const text = alternative?.transcript?.trim();
      if (!text) return;
      const startMs = Math.round(Number(event.start ?? 0) * 1000);
      const endMs = Math.round((Number(event.start ?? 0) + Number(event.duration ?? 0)) * 1000);
      const speaker = typeof alternative.words?.[0]?.speaker === "number" ? `Speaker ${alternative.words[0].speaker + 1}` : null;
      if (!event.is_final) return callbacks.onInterim({ startMs, endMs, speaker, text });
      const segmentId = `${startMs}:${endMs}:${text.toLowerCase().replace(/\s+/g, " ")}`;
      await callbacks.onFinal({ segmentId, startMs, endMs, speaker, text, isFinal: true });
    });
    this.connection.on("error", (error: unknown) => callbacks.onError(toError(error)));
    this.connection.on("close", callbacks.onClose);
  }

  send(audio: Buffer) {
    if (!this.closed && this.connection.readyState === WebSocket.OPEN) this.connection.send(audio);
  }

  close(): Promise<void> {
    if (this.closed) return Promise.resolve();
    this.closed = true;
    if (this.connection.readyState === WebSocket.OPEN) this.connection.send(JSON.stringify({ type: "Finalize" }));
    return new Promise((resolve) => {
      const timeout = setTimeout(() => { this.connection.close(); resolve(); }, 1500);
      this.connection.once("close", () => { clearTimeout(timeout); resolve(); });
    });
  }
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(typeof error === "string" ? error : "Deepgram connection failed");
}
