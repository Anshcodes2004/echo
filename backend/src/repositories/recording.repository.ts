import { Types } from "mongoose";
import { RecordingModel } from "../schemas/recording.schema.js";
import type { RecordingMode, RecordingStatus, TranscriptSegment } from "../types/recording.js";

export class RecordingRepository {
  async create(input: { mode: RecordingMode; title: string; language: string }) {
    return RecordingModel.create({ mode: input.mode, title: input.title, transcriptionLanguage: input.language, startedAt: new Date(), status: "recording" });
  }

  async findById(id: string) {
    return Types.ObjectId.isValid(id) ? RecordingModel.findById(id).lean() : null;
  }

  async list(input: { mode?: RecordingMode; query?: string; limit: number; skip: number }) {
    const filter: Record<string, unknown> = {};
    if (input.mode) filter.mode = input.mode;
    if (input.query) filter.$text = { $search: input.query };
    return RecordingModel.find(filter).sort({ createdAt: -1 }).skip(input.skip).limit(input.limit).lean();
  }

  async appendFinalSegment(id: string, segment: TranscriptSegment) {
    return RecordingModel.findOneAndUpdate(
      { _id: id, status: "recording", "transcript.segmentId": { $ne: segment.segmentId } },
      { $push: { transcript: segment } },
      { new: true },
    ).lean();
  }

  async setStatus(id: string, status: RecordingStatus, extra: Record<string, unknown> = {}) {
    return RecordingModel.findByIdAndUpdate(id, { $set: { status, ...extra } }, { new: true }).lean();
  }

  async updateTitle(id: string, title: string) {
    return RecordingModel.findByIdAndUpdate(id, { $set: { title } }, { new: true }).lean();
  }

  async delete(id: string) {
    return RecordingModel.findByIdAndDelete(id).lean();
  }
}
