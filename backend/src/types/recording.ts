export type RecordingMode = "meeting" | "personal";
export type RecordingStatus = "recording" | "processing" | "ready" | "analysis_failed" | "failed";

export type TranscriptSegment = {
  segmentId: string;
  startMs: number;
  endMs: number;
  speaker: string | null;
  text: string;
  isFinal: true;
};

export type TimedInsight = { text: string; sourceSegmentId: string; timestampMs: number };
export type ActionItem = TimedInsight & { task: string; owner: string | null; deadline: string | null };

export type MeetingInsights = {
  summary: string;
  topics: TimedInsight[];
  decisions: TimedInsight[];
  actionItems: ActionItem[];
  openQuestions: TimedInsight[];
  risks: TimedInsight[];
  importantMoments: TimedInsight[];
};

export type PersonalInsights = {
  ideas: TimedInsight[];
  goals: TimedInsight[];
  questions: TimedInsight[];
  importantThoughts: TimedInsight[];
  thingsToRevisit: TimedInsight[];
};
