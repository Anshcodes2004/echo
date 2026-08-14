import { Types } from "mongoose";
import { RecordingModel } from "../schemas/recording.schema.js";
import type {
  RecordingMode,
  RecordingStatus,
  TranscriptSegment,
} from "../types/recording.js";

export class RecordingRepository {
  async create(input: {
    userId: string;
    mode: RecordingMode;
    title: string;
    language: string;
  }) {
    return RecordingModel.create({
      userId: input.userId,
      mode: input.mode,
      title: input.title,
      transcriptionLanguage: input.language,
      startedAt: new Date(),
      status: "recording",
    });
  }

  async findById(id: string, userId: string) {
    return Types.ObjectId.isValid(id)
      ? RecordingModel.findOne({ _id: id, userId }).lean()
      : null;
  }

  async list(input: {
    userId: string;
    mode?: RecordingMode;
    query?: string;
    limit: number;
    skip: number;
  }) {
    const filter: Record<string, unknown> = { userId: input.userId };
    if (input.mode) filter.mode = input.mode;
    if (input.query) filter.$text = { $search: input.query };
    return RecordingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(input.skip)
      .limit(input.limit)
      .lean();
  }

  async appendFinalSegment(
    id: string,
    userId: string,
    segment: TranscriptSegment,
  ) {
    return RecordingModel.findOneAndUpdate(
      {
        _id: id,
        userId,
        status: "recording",
        "transcript.segmentId": { $ne: segment.segmentId },
      },
      { $push: { transcript: segment } },
      { new: true },
    ).lean();
  }

  async setStatus(
    id: string,
    userId: string,
    status: RecordingStatus,
    extra: Record<string, unknown> = {},
  ) {
    return RecordingModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status, ...extra } },
      { new: true },
    ).lean();
  }

  async updateTitle(id: string, userId: string, title: string) {
    return RecordingModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { title } },
      { new: true },
    ).lean();
  }

  async delete(id: string, userId: string) {
    return RecordingModel.findOneAndDelete({ _id: id, userId }).lean();
  }
}
