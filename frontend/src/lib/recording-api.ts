import type {
  ActionItem,
  Mode,
  PersonalInsightCategory,
  Recording,
  TimedNote,
  TranscriptSegment,
} from "./echo-data";
const api = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";

export async function fetchRecording(id: string): Promise<Recording | null> {
  const response = await fetch(`${api}/api/recordings/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load this recording.");
  return toRecording(await response.json());
}
export async function fetchRecordings(): Promise<Recording[]> {
  const response = await fetch(`${api}/api/recordings`);
  if (!response.ok) throw new Error("Could not load recordings.");
  const data = (await response.json()) as { recordings: unknown[] };
  return data.recordings.map(toRecording);
}
export async function deleteRecording(id: string) {
  const response = await fetch(`${api}/api/recordings/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Could not delete recording.");
}
export async function retryAnalysis(id: string): Promise<Recording> {
  const response = await fetch(`${api}/api/recordings/${id}/finalize`, { method: "POST" });
  if (!response.ok) throw new Error("Could not retry analysis.");
  return toRecording(await response.json());
}

function toRecording(raw: any): Recording {
  const transcript: TranscriptSegment[] = (raw.transcript ?? []).map((segment: any) => ({
    id: segment.segmentId,
    time: clock(segment.startMs),
    speaker: segment.speaker ?? undefined,
    text: segment.text,
  }));
  const note = (item: any): TimedNote => ({
    id: item.sourceSegmentId + item.text,
    time: clock(item.timestampMs),
    text: item.text,
  });
  const meeting = raw.insights?.meeting;
  const personal = raw.insights?.personal;
  const personalInsights = personal
    ? (["ideas", "goals", "questions", "importantThoughts", "thingsToRevisit"] as const).map(
        (category) => ({
          category:
            category === "importantThoughts" || category === "thingsToRevisit"
              ? "thoughts"
              : (category as PersonalInsightCategory),
          items: (personal[category] ?? []).map(note),
        }),
      )
    : undefined;
  const actionItems: ActionItem[] | undefined = meeting?.actionItems?.map((item: any) => ({
    id: item.sourceSegmentId + item.task,
    task: item.task,
    owner: item.owner,
    deadline: item.deadline,
    time: clock(item.timestampMs),
  }));
  return {
    id: raw.id,
    title: raw.title,
    mode: raw.mode as Mode,
    durationMin: Math.max(1, Math.round((raw.durationSeconds ?? 0) / 60)),
    when: new Date(raw.createdAt).toLocaleDateString(),
    createdAt: new Date(raw.createdAt).getTime(),
    speakers: new Set(transcript.map((s) => s.speaker).filter(Boolean)).size || undefined,
    preview: transcript[0]?.text ?? "No speech detected.",
    summary: meeting?.summary,
    topics: meeting?.topics?.map(note),
    decisions: meeting?.decisions?.map(note),
    actionItems,
    questions: meeting?.openQuestions?.map(note),
    risks: meeting?.risks?.map(note),
    timeline: meeting?.importantMoments?.map(note),
    personalInsights,
    transcript,
    status: raw.status,
    analysisError: raw.analysisError ?? null,
  } as Recording;
}
function clock(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
