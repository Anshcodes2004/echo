export type Mode = "meeting" | "personal";

export type TranscriptSegment = {
  id: string;
  time: string;
  speaker?: string;
  text: string;
};

export type ActionItem = {
  id: string;
  task: string;
  owner: string | null;
  deadline: string | null;
  time: string;
};

export type TimedNote = { id: string; time: string; text: string };

export type PersonalInsightCategory = "ideas" | "goals" | "questions" | "thoughts";

export type Recording = {
  id: string;
  title: string;
  mode: Mode;
  durationMin: number;
  when: string;
  createdAt: number;
  speakers?: number;
  preview: string;
  summary?: string;
  topics?: TimedNote[];
  decisions?: TimedNote[];
  actionItems?: ActionItem[];
  questions?: TimedNote[];
  risks?: TimedNote[];
  timeline?: TimedNote[];
  personalInsights?: { category: PersonalInsightCategory; items: TimedNote[] }[];
  transcript: TranscriptSegment[];
  status: "recording" | "processing" | "ready" | "analysis_failed" | "failed";
  analysisError?: string | null;
};

export const PERSONAL_CATEGORY_META: Record<
  PersonalInsightCategory,
  { label: string; emoji: string; tone: "lavender" | "sage" | "dusty" | "peach" }
> = {
  ideas: { label: "Ideas", emoji: "💡", tone: "lavender" },
  goals: { label: "Goals", emoji: "🎯", tone: "sage" },
  questions: { label: "Questions", emoji: "❓", tone: "dusty" },
  thoughts: { label: "Important Thoughts", emoji: "📌", tone: "peach" },
};

export const recordings: Recording[] = [
  {
    id: "product-architecture-discussion",
    title: "Product Architecture Discussion",
    mode: "meeting",
    status: "ready",
    durationMin: 42,
    when: "Today",
    createdAt: 5,
    speakers: 4,
    preview:
      "Discussed database architecture, authentication and deployment timelines for the new service.",
    summary:
      "The team reviewed the architecture for the new service. MongoDB was selected as the primary datastore for its flexible document model, with indexing to be validated before rollout. API latency under load was raised as the main performance concern, and the authentication flow will move to short-lived tokens with refresh rotation. Deployment was discussed but no final date was agreed — the current timeline is considered aggressive and will be revisited.",
    topics: [
      { id: "t1", time: "02:14", text: "Database architecture" },
      { id: "t2", time: "08:31", text: "API performance" },
      { id: "t3", time: "15:42", text: "Authentication" },
      { id: "t4", time: "27:18", text: "Deployment" },
    ],
    decisions: [
      { id: "d1", time: "04:31", text: "Use MongoDB for the new service" },
      {
        id: "d2",
        time: "16:20",
        text: "Move authentication to short-lived tokens with refresh rotation",
      },
      { id: "d3", time: "24:05", text: "Add WebSocket reconnection before the beta release" },
    ],
    actionItems: [
      {
        id: "a1",
        task: "Implement WebSocket reconnection",
        owner: "Ansh",
        deadline: "Friday",
        time: "05:21",
      },
      { id: "a2", task: "Review MongoDB indexes", owner: "Rahul", deadline: null, time: "13:47" },
      {
        id: "a3",
        task: "Draft the token refresh rotation spec",
        owner: "Priya",
        deadline: "Next Tuesday",
        time: "17:02",
      },
      {
        id: "a4",
        task: "Run a load test on the new API",
        owner: null,
        deadline: null,
        time: "29:40",
      },
    ],
    questions: [
      { id: "q1", time: "21:04", text: "Who will own the deployment process?" },
      { id: "q2", time: "33:52", text: "Do we need a migration path for existing sessions?" },
    ],
    risks: [
      { id: "r1", time: "31:17", text: "Current deployment timeline may be too aggressive." },
      {
        id: "r2",
        time: "09:12",
        text: "API latency degrades noticeably above 500 concurrent users.",
      },
    ],
    timeline: [
      { id: "tl1", time: "02:14", text: "Discussion started about database architecture" },
      { id: "tl2", time: "04:31", text: "Decision: use MongoDB" },
      { id: "tl3", time: "08:42", text: "Performance concern raised" },
      { id: "tl4", time: "13:47", text: "Action item assigned to Rahul" },
      { id: "tl5", time: "16:20", text: "Decision: short-lived tokens with refresh rotation" },
      { id: "tl6", time: "21:04", text: "Unresolved deployment question" },
      { id: "tl7", time: "31:17", text: "Risk noted about the deployment timeline" },
    ],
    transcript: [
      {
        id: "s1",
        time: "02:14",
        speaker: "Speaker 1",
        text: "Let's discuss the database architecture first.",
      },
      {
        id: "s2",
        time: "02:31",
        speaker: "Speaker 2",
        text: "I think MongoDB makes the most sense because the document shape keeps changing while we iterate, and we don't want a migration every week.",
      },
      {
        id: "s3",
        time: "03:20",
        speaker: "Speaker 3",
        text: "Agreed, as long as we're disciplined about indexes. Unbounded queries are what usually hurt us.",
      },
      {
        id: "s4",
        time: "04:31",
        speaker: "Speaker 1",
        text: "Let's use MongoDB for the new service.",
      },
      {
        id: "s5",
        time: "05:21",
        speaker: "Speaker 2",
        text: "I'll take the WebSocket reconnection work — I can have it in by Friday.",
      },
      {
        id: "s6",
        time: "08:31",
        speaker: "Speaker 4",
        text: "Before we move on, API performance under load is still an open concern.",
      },
      {
        id: "s7",
        time: "09:12",
        speaker: "Speaker 3",
        text: "Latency degrades noticeably above five hundred concurrent users in the last test run.",
      },
      {
        id: "s8",
        time: "13:47",
        speaker: "Speaker 1",
        text: "Rahul, can you review the MongoDB indexes and report back?",
      },
      {
        id: "s9",
        time: "15:42",
        speaker: "Speaker 2",
        text: "On authentication — I think we should change the authentication flow to short-lived tokens.",
      },
      {
        id: "s10",
        time: "21:04",
        speaker: "Speaker 4",
        text: "Who will own the deployment process? That's still not clear to me.",
      },
      {
        id: "s11",
        time: "31:17",
        speaker: "Speaker 1",
        text: "Honestly, the current deployment timeline may be too aggressive.",
      },
    ],
  },
  {
    id: "interview-preparation-thoughts",
    title: "Interview Preparation Thoughts",
    mode: "personal",
    status: "ready",
    durationMin: 15,
    when: "Yesterday",
    createdAt: 4,
    preview:
      "Ideas about preparation strategy and project improvements before next week's interviews.",
    personalInsights: [
      {
        category: "ideas",
        items: [
          {
            id: "i1",
            time: "03:14",
            text: "I should build a system to track my interview preparation.",
          },
          {
            id: "i2",
            time: "05:02",
            text: "A weekly retro on what I actually studied would keep me honest.",
          },
        ],
      },
      {
        category: "goals",
        items: [
          { id: "g1", time: "06:42", text: "Finish the project by Sunday." },
          { id: "g2", time: "08:05", text: "Solve two system design problems every week." },
        ],
      },
      {
        category: "questions",
        items: [{ id: "qq1", time: "09:18", text: "Should I use MongoDB or PostgreSQL?" }],
      },
      {
        category: "thoughts",
        items: [
          {
            id: "th1",
            time: "12:41",
            text: "I'm worried the real-time component may be unstable.",
          },
          {
            id: "th2",
            time: "13:55",
            text: "I do my best thinking early in the morning, before messages start.",
          },
        ],
      },
    ],
    transcript: [
      {
        id: "p1",
        time: "00:12",
        text: "Okay, thinking out loud about how I want to prepare over the next two weeks.",
      },
      {
        id: "p2",
        time: "03:14",
        text: "I should build a system to track my interview preparation, otherwise I just drift between topics.",
      },
      {
        id: "p3",
        time: "06:42",
        text: "Finish the project by Sunday. That's the hard deadline I'm giving myself.",
      },
      {
        id: "p4",
        time: "09:18",
        text: "Should I use MongoDB or PostgreSQL? I keep going back and forth on this.",
      },
      {
        id: "p5",
        time: "12:41",
        text: "I'm worried the real-time component may be unstable under a poor connection.",
      },
    ],
  },
  {
    id: "weekly-design-review",
    title: "Weekly Design Review",
    mode: "meeting",
    status: "ready",
    durationMin: 28,
    when: "Monday",
    createdAt: 3,
    speakers: 3,
    preview: "Reviewed onboarding flow revisions, spacing system and the new empty states.",
    summary:
      "The team walked through the revised onboarding flow. Spacing was standardised on a four-point scale and the empty states were approved with minor copy changes. A follow-up review was scheduled once the illustrations land.",
    topics: [
      { id: "wt1", time: "01:40", text: "Onboarding flow" },
      { id: "wt2", time: "11:15", text: "Spacing system" },
      { id: "wt3", time: "19:02", text: "Empty states" },
    ],
    decisions: [{ id: "wd1", time: "12:08", text: "Standardise spacing on a four-point scale" }],
    actionItems: [
      {
        id: "wa1",
        task: "Update the empty state copy",
        owner: "Maya",
        deadline: "Thursday",
        time: "20:31",
      },
      {
        id: "wa2",
        task: "Export the revised onboarding frames",
        owner: null,
        deadline: null,
        time: "24:12",
      },
    ],
    questions: [
      { id: "wq1", time: "22:40", text: "Do we ship illustrations in the first release?" },
    ],
    risks: [
      { id: "wr1", time: "26:05", text: "Illustration work may slip past the design freeze." },
    ],
    timeline: [
      { id: "wtl1", time: "01:40", text: "Onboarding walkthrough started" },
      { id: "wtl2", time: "12:08", text: "Decision: four-point spacing scale" },
      { id: "wtl3", time: "20:31", text: "Action item assigned to Maya" },
    ],
    transcript: [
      {
        id: "ws1",
        time: "01:40",
        speaker: "Speaker 1",
        text: "Let's start with the onboarding flow revisions.",
      },
      {
        id: "ws2",
        time: "11:15",
        speaker: "Speaker 2",
        text: "Spacing is still inconsistent between the two screens.",
      },
      {
        id: "ws3",
        time: "12:08",
        speaker: "Speaker 1",
        text: "Let's standardise on a four-point scale.",
      },
    ],
  },
  {
    id: "morning-reflection",
    title: "Morning Reflection",
    mode: "personal",
    status: "ready",
    durationMin: 8,
    when: "Last week",
    createdAt: 2,
    preview: "Thoughts on focus, energy levels and what actually mattered last week.",
    personalInsights: [
      {
        category: "ideas",
        items: [
          {
            id: "mi1",
            time: "01:22",
            text: "Block the first ninety minutes of the day for deep work.",
          },
        ],
      },
      {
        category: "goals",
        items: [
          { id: "mg1", time: "03:40", text: "Ship one meaningful thing before lunch each day." },
        ],
      },
      {
        category: "questions",
        items: [{ id: "mq1", time: "05:11", text: "Am I saying yes to too many small requests?" }],
      },
      {
        category: "thoughts",
        items: [
          {
            id: "mt1",
            time: "06:48",
            text: "Most of last week's stress came from unclear priorities.",
          },
        ],
      },
    ],
    transcript: [
      {
        id: "mp1",
        time: "01:22",
        text: "Blocking the first ninety minutes for deep work made a real difference.",
      },
      {
        id: "mp2",
        time: "03:40",
        text: "I want to ship one meaningful thing before lunch each day.",
      },
      {
        id: "mp3",
        time: "06:48",
        text: "Most of last week's stress came from unclear priorities, not workload.",
      },
    ],
  },
];

export function getRecording(id: string) {
  return recordings.find((r) => r.id === id);
}

export const LIVE_MEETING_SCRIPT: { speaker?: string; text: string }[] = [
  { speaker: "Speaker 1", text: "Can everyone see the latest version of the project?" },
  { speaker: "Speaker 2", text: "Yes. I think we should change the authentication flow." },
  { speaker: "Speaker 1", text: "Let's use MongoDB for the new service." },
  { speaker: "Speaker 3", text: "We should confirm the indexes before we commit to that." },
  { speaker: "Speaker 2", text: "I can take the WebSocket reconnection work this week." },
  { speaker: "Speaker 4", text: "Who will own the deployment process?" },
];

export const LIVE_PERSONAL_SCRIPT: { speaker?: string; text: string }[] = [
  { text: "I want to think through how the next two weeks should look." },
  { text: "I should build a system to track my interview preparation." },
  { text: "Finish the project by Sunday, no extensions this time." },
  { text: "Should I use MongoDB or PostgreSQL for this one?" },
  { text: "I'm worried the real-time component may be unstable." },
];

export function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
