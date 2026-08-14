import type { RecordingMode, TranscriptSegment } from "../types/recording.js";
import { RecordingRepository } from "../repositories/recording.repository.js";
import { AiService } from "./ai.service.js";

export class RecordingService {
  constructor(private readonly repository = new RecordingRepository(), private readonly ai = new AiService()) {}

  create(mode: RecordingMode, title: string, language: string) { return this.repository.create({ mode, title, language }); }
  get(id: string) { return this.repository.findById(id); }
  list(input: { mode?: RecordingMode; query?: string; limit: number; skip: number }) { return this.repository.list(input); }
  rename(id: string, title: string) { return this.repository.updateTitle(id, title); }
  remove(id: string) { return this.repository.delete(id); }
  appendFinal(id: string, segment: TranscriptSegment) { return this.repository.appendFinalSegment(id, segment); }

  async finalize(id: string) {
    const recording = await this.repository.findById(id);
    if (!recording) return null;
    if (recording.status === "ready" || recording.status === "analysis_failed") return recording;
    const durationSeconds = Math.max(0, Math.round((Date.now() - new Date(recording.startedAt).getTime()) / 1000));
    const processing = await this.repository.setStatus(id, "processing", { endedAt: new Date(), durationSeconds });
    const transcript = processing?.transcript as TranscriptSegment[] | undefined;
    if (!transcript?.length) return this.repository.setStatus(id, "ready", { insights: undefined, analysisError: null });
    try {
      const analysis = await this.ai.analyze(processing!.mode, transcript);
      return this.repository.setStatus(id, "ready", { insights: processing!.mode === "meeting" ? { meeting: analysis } : { personal: analysis }, analysisError: null });
    } catch (error) {
      return this.repository.setStatus(id, "analysis_failed", { analysisError: error instanceof Error ? error.message : "Analysis failed" });
    }
  }
}
