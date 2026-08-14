import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode } from "@/lib/echo-data";

export type LiveSegment = { id: string; time: string; speaker?: string; text: string };
type State = "starting" | "recording" | "processing" | "error";
const api = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";
const wsBase = (import.meta.env["VITE_WS_BASE_URL"] ?? api.replace(/^http/, "ws")).replace(
  /\/$/,
  "",
);

export function useRecordingSession(mode: Mode, onComplete: (id: string) => void) {
  const [state, setState] = useState<State>("starting");
  const [segments, setSegments] = useState<LiveSegment[]>([]);
  const [interim, setInterim] = useState<LiveSegment | null>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(28).fill(0.1));
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const started = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const cleanup = useCallback(() => {
    processor.current?.disconnect();
    analyser.current?.disconnect();
    stream.current?.getTracks().forEach((t) => t.stop());
    audio.current?.close().catch(() => undefined);
    processor.current = null;
    analyser.current = null;
    stream.current = null;
    audio.current = null;
  }, []);
  const stop = useCallback(() => {
    if (state !== "recording") return;
    setState("processing");
    cleanup();
    socket.current?.send(JSON.stringify({ type: "stop" }));
  }, [cleanup, state]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.WebSocket || !window.AudioContext)
          throw new Error("This browser does not support live microphone recording.");
        const [response, mic] = await Promise.all([
          fetch(`${api}/api/recordings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode }),
          }),
          navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
          }),
        ]);
        if (!response.ok) throw new Error("Could not start a recording session.");
        const recording = (await response.json()) as { id: string };
        if (cancelled) {
          mic.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = mic;
        const ctx = new AudioContext({ sampleRate: 16000 });
        audio.current = ctx;
        const source = ctx.createMediaStreamSource(mic);
        const meter = ctx.createAnalyser();
        meter.fftSize = 128;
        analyser.current = meter;
        source.connect(meter);
        const node = ctx.createScriptProcessor(4096, 1, 1);
        processor.current = node;
        source.connect(node);
        node.connect(ctx.destination);
        const ws = new WebSocket(`${wsBase}/ws/transcriptions/${recording.id}`);
        socket.current = ws;
        ws.binaryType = "arraybuffer";
        ws.onopen = () => {
          if (!cancelled) setState("recording");
        };
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data) as any;
          if (message.type === "transcript") {
            const item = {
              id: message.startMs + ":" + message.endMs + ":" + message.text,
              time: toClock(message.startMs),
              speaker: message.speaker ?? undefined,
              text: message.text,
            };
            if (message.isFinal) {
              setSegments((old) => (old.some((s) => s.id === item.id) ? old : [...old, item]));
              setInterim(null);
            } else setInterim(item);
          }
          if (message.type === "completed") onCompleteRef.current(recording.id);
          if (message.type === "error") {
            setError(message.message);
            if (message.code === "DEEPGRAM_ERROR") setState("error");
          }
        };
        ws.onerror = () => {
          setError("The transcription connection was interrupted.");
          setState("error");
        };
        node.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          ws.send(toPcm16(event.inputBuffer.getChannelData(0), ctx.sampleRate));
        };
        const meterData = new Uint8Array(meter.frequencyBinCount);
        const animate = () => {
          if (cancelled) return;
          meter.getByteFrequencyData(meterData);
          setLevels(
            Array.from({ length: 28 }, (_, i) =>
              Math.max(0.08, (meterData[Math.floor((i * meterData.length) / 28)] ?? 0) / 180),
            ),
          );
          requestAnimationFrame(animate);
        };
        animate();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not access the microphone.");
        setState("error");
        cleanup();
      }
    };
    void start();
    return () => {
      cancelled = true;
      cleanup();
      socket.current?.close();
    };
  }, [cleanup, mode]);
  return { state, segments, interim, levels, error, stop };
}
function toPcm16(input: Float32Array, rate: number) {
  const ratio = rate / 16000;
  const output = new Int16Array(Math.ceil(input.length / ratio));
  for (let i = 0; i < output.length; i++) {
    const value = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)] ?? 0));
    output[i] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return output.buffer;
}
function toClock(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
