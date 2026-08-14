import { Schema, model } from "mongoose";
import type { RecordingMode, RecordingStatus } from "../types/recording.js";

const transcriptSegmentSchema = new Schema(
  {
    segmentId: { type: String, required: true },
    startMs: { type: Number, required: true, min: 0 },
    endMs: { type: Number, required: true, min: 0 },
    speaker: { type: String, default: null },
    text: { type: String, required: true },
    isFinal: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const timedInsightSchema = new Schema(
  { text: String, sourceSegmentId: String, timestampMs: Number },
  { _id: false },
);
const actionItemSchema = new Schema(
  { ...timedInsightSchema.obj, task: String, owner: { type: String, default: null }, deadline: { type: String, default: null } },
  { _id: false },
);

const meetingInsightsSchema = new Schema(
  { summary: String, topics: [timedInsightSchema], decisions: [timedInsightSchema], actionItems: [actionItemSchema], openQuestions: [timedInsightSchema], risks: [timedInsightSchema], importantMoments: [timedInsightSchema] },
  { _id: false },
);
const personalInsightsSchema = new Schema(
  { ideas: [timedInsightSchema], goals: [timedInsightSchema], questions: [timedInsightSchema], importantThoughts: [timedInsightSchema], thingsToRevisit: [timedInsightSchema] },
  { _id: false },
);

const recordingSchema = new Schema(
  {
    mode: { type: String, enum: ["meeting", "personal"], required: true },
    status: { type: String, enum: ["recording", "processing", "ready", "analysis_failed", "failed"], required: true, default: "recording" },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    transcriptionLanguage: { type: String, default: "en-US", maxlength: 24 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0, min: 0 },
    transcript: { type: [transcriptSegmentSchema], default: [] },
    insights: { meeting: meetingInsightsSchema, personal: personalInsightsSchema },
    analysisError: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

recordingSchema.index({ createdAt: -1 });
recordingSchema.index({ mode: 1, createdAt: -1 });
recordingSchema.index({ title: "text", "transcript.text": "text" });

export type RecordingDocument = {
  _id: { toString(): string };
  mode: RecordingMode;
  status: RecordingStatus;
  title: string;
  transcriptionLanguage: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
  transcript: unknown[];
  insights?: unknown;
  analysisError?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const RecordingModel = model("Recording", recordingSchema);
