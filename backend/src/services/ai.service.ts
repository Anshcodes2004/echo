import { z } from "zod";
import { env } from "../config/env.js";
import type { RecordingMode, TranscriptSegment } from "../types/recording.js";

const timedInsight = z.object({
  text: z.string().min(1),
  sourceSegmentId: z.string().min(1),
  timestampMs: z.number().int().nonnegative(),
});
const meetingOutput = z.object({
  summary: z.string(),
  topics: z.array(timedInsight),
  decisions: z.array(timedInsight),
  actionItems: z.array(
    timedInsight.extend({
      task: z.string().min(1),
      owner: z.string().nullable(),
      deadline: z.string().nullable(),
    }),
  ),
  openQuestions: z.array(timedInsight),
  risks: z.array(timedInsight),
  importantMoments: z.array(timedInsight),
});
const personalOutput = z.object({
  ideas: z.array(timedInsight),
  goals: z.array(timedInsight),
  questions: z.array(timedInsight),
  importantThoughts: z.array(timedInsight),
  thingsToRevisit: z.array(timedInsight),
});
export type Analysis =
  z.infer<typeof meetingOutput> | z.infer<typeof personalOutput>;

export class AiService {
  async analyze(
    mode: RecordingMode,
    transcript: TranscriptSegment[],
  ): Promise<Analysis> {
    const response = await fetch(
      `${env.AI_API_BASE_URL.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.AI_MODEL,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt(mode) },
            { role: "user", content: JSON.stringify({ mode, transcript }) },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );
    if (!response.ok)
      throw new Error(`AI analysis failed with HTTP ${response.status}`);
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI analysis returned no content");
    const parsed = JSON.parse(stripCodeFence(content));
    const output =
      mode === "meeting"
        ? meetingOutput.parse(parsed)
        : personalOutput.parse(parsed);
    validateSources(output, transcript);
    return output;
  }
}

function systemPrompt(mode: RecordingMode) {
  const base =
    "Return JSON only, no prose, no markdown fences. Use only facts stated in the supplied transcript. " +
    "Every extracted item must be an OBJECT of the exact shape " +
    '{ "text": string, "sourceSegmentId": string, "timestampMs": number }, ' +
    "never a plain string. sourceSegmentId must be copied exactly from the transcript segment it came from, " +
    "and timestampMs must exactly equal that segment's startMs. " +
    "Never invent people, owners, deadlines, decisions, or timestamps. If unknown, owner and deadline must be null. " +
    "A suggestion is not a decision.";
  return mode === "meeting"
    ? `${base} Top-level schema: {"summary": string, "topics": [item], "decisions": [item], ` +
        `"actionItems": [{"text": string, "sourceSegmentId": string, "timestampMs": number, "task": string, "owner": string|null, "deadline": string|null}], ` +
        `"openQuestions": [item], "risks": [item], "importantMoments": [item]}, where [item] means an array of the object shape above. ` +
        `Extract all meaningful action items; every action item object must still include text, sourceSegmentId, and timestampMs in addition to task, owner, deadline.`
    : `${base} Top-level schema: {"ideas": [item], "goals": [item], "questions": [item], "importantThoughts": [item], "thingsToRevisit": [item]}, ` +
        `where [item] means an array of the object shape above. Do not produce a meeting summary or action items.`;
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
}
function validateSources(output: Analysis, transcript: TranscriptSegment[]) {
  const startById = new Map(transcript.map((s) => [s.segmentId, s.startMs]));
  const groups = Object.values(output).filter(Array.isArray) as Array<
    Array<{ sourceSegmentId: string; timestampMs: number }>
  >;
  for (const item of groups.flat()) {
    if (startById.get(item.sourceSegmentId) !== item.timestampMs)
      throw new Error("AI analysis referenced an invalid transcript timestamp");
  }
}
