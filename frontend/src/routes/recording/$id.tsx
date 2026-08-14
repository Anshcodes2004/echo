import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  ListChecks,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/echo/AppShell";
import { Dot, Pill, SectionCard, TimeChip, type Tone } from "@/components/echo/primitives";
import {
  PERSONAL_CATEGORY_META,
  formatDuration,
  type Recording,
  type TranscriptSegment,
} from "@/lib/echo-data";
import {
  fetchRecording,
  retryAnalysis,
  renameRecording,
  deleteRecording,
  downloadTranscript,
} from "@/lib/recording-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recording/$id")({
  loader: async ({ params }) => {
    const rec = await fetchRecording(params.id);
    if (!rec) throw notFound();
    return rec;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Recording";
    const desc =
      loaderData?.preview ?? "Review the transcript and insights from this Echo recording.";
    return {
      meta: [
        { title: `${title} — Echo` },
        { name: "description", content: desc },
        { property: "og:title", content: `${title} — Echo` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: RecordingResult,
});

const speakerTones: Tone[] = ["lavender", "sage", "dusty", "peach"];

function speakerTone(speaker: string | undefined, speakers: string[]): Tone {
  if (!speaker) return "neutral";
  const idx = speakers.indexOf(speaker);
  return speakerTones[idx % speakerTones.length] ?? "neutral";
}

function TranscriptView({ recording }: { recording: Recording }) {
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState("all");

  const speakers = useMemo(
    () =>
      Array.from(new Set(recording.transcript.map((s) => s.speaker).filter(Boolean))) as string[],
    [recording],
  );

  const segments = recording.transcript.filter(
    (s: TranscriptSegment) =>
      (speaker === "all" || s.speaker === speaker) &&
      (!query.trim() || s.text.toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <section className="card-soft animate-rise overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript..."
            className="h-10 w-full rounded-full border border-border bg-background pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        {speakers.length > 0 ? (
          <select
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            className="h-10 rounded-full border border-border bg-background px-4 text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="all">All speakers</option>
            {speakers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(
                recording.transcript
                  .map((s) => `${s.time} ${s.speaker ?? ""} ${s.text}`)
                  .join("\n"),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[13px] transition-colors hover:bg-secondary"
          >
            <Copy className="size-3.5" strokeWidth={1.8} /> Copy
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[13px] transition-colors hover:bg-secondary"
          >
            <Pencil className="size-3.5" strokeWidth={1.8} /> Edit
          </button>
        </div>
      </header>

      <div className="divide-y divide-border">
        {segments.map((s) => (
          <div key={s.id} className="animate-fade-in px-6 py-5">
            <div className="flex items-center gap-2.5">
              {s.speaker ? (
                <span className="inline-flex items-center gap-2 text-[13px] font-medium">
                  <Dot tone={speakerTone(s.speaker, speakers)} />
                  {s.speaker}
                </span>
              ) : null}
              <TimeChip time={s.time} />
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">"{s.text}"</p>
          </div>
        ))}
        {segments.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No transcript segments match your search.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function MeetingOverview({ recording }: { recording: Recording }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Summary" icon={<Sparkles />} tone="lavender">
        <p className="text-[15px] leading-relaxed text-foreground/80">{recording.summary}</p>
      </SectionCard>

      <SectionCard
        title="Action Items"
        icon={<ListChecks />}
        tone="lavender"
        className="border-lavender-strong/40"
      >
        <ul className="space-y-1">
          {(recording.actionItems ?? []).map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/60"
            >
              <input
                type="checkbox"
                aria-label={a.task}
                className="mt-0.5 size-4 shrink-0 rounded-[5px] border border-border accent-[var(--lavender-strong)]"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">{a.task}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className={cn(!a.owner && "italic")}>{a.owner ?? "Unassigned"}</span>
                  <span className="text-border">·</span>
                  <span className={cn(!a.deadline && "italic")}>
                    {a.deadline ? `Due ${a.deadline}` : "No deadline specified"}
                  </span>
                  <span className="text-border">·</span>
                  <TimeChip time={a.time} className="-ml-1" />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {recording.topics && recording.topics.length > 0 ? (
          <SectionCard title="Key Topics" icon={<FileText />} tone="dusty">
            <ul className="space-y-3">
              {recording.topics.map((t) => (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <TimeChip time={t.time} className="-ml-1.5" />
                  <span>{t.text}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {recording.decisions && recording.decisions.length > 0 ? (
          <SectionCard title="Decisions" icon={<Sparkles />} tone="sage">
            <ul className="space-y-4">
              {recording.decisions.map((d) => (
                <li key={d.id}>
                  <TimeChip time={d.time} className="-ml-1.5" />
                  <p className="mt-0.5 text-sm">{d.text}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {recording.questions && recording.questions.length > 0 ? (
          <SectionCard title="Open Questions" icon={<HelpCircle />} tone="dusty">
            <ul className="space-y-4">
              {recording.questions.map((q) => (
                <li key={q.id}>
                  <TimeChip time={q.time} className="-ml-1.5" />
                  <p className="mt-0.5 text-sm">"{q.text}"</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {recording.risks && recording.risks.length > 0 ? (
          <SectionCard title="Risks / Concerns" icon={<AlertTriangle />} tone="peach">
            <ul className="space-y-4">
              {recording.risks.map((r) => (
                <li key={r.id}>
                  <TimeChip time={r.time} className="-ml-1.5" />
                  <p className="mt-0.5 text-sm">"{r.text}"</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}

function AnalysisStatusBanner({
  recording,
  onRetried,
}: {
  recording: Recording;
  onRetried: (updated: Recording) => void;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  if (recording.status === "ready") return null;

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      onRetried(await retryAnalysis(recording.id));
    } catch (cause) {
      setRetryError(cause instanceof Error ? cause.message : "Could not retry analysis.");
    } finally {
      setRetrying(false);
    }
  };

  if (recording.status === "recording" || recording.status === "processing") {
    return (
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-5 py-4 text-sm">
        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" strokeWidth={1.8} />
        <p className="text-muted-foreground">
          {recording.status === "recording"
            ? "This recording never finished — it hasn't been analyzed yet."
            : "Analysis is still running."}
        </p>
        {recording.status === "recording" ? (
          <button
            type="button"
            onClick={() => void handleRetry()}
            disabled={retrying}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3.5", retrying && "animate-spin")} strokeWidth={1.8} />
            {retrying ? "Retrying..." : "Run analysis now"}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-coral/40 bg-peach px-5 py-4 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-coral" strokeWidth={1.8} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-peach-foreground">AI analysis failed</p>
          <p className="mt-1 text-peach-foreground/80">
            {recording.analysisError ?? "The AI service didn't return a usable result."}
          </p>
          {retryError ? <p className="mt-1 text-coral">{retryError}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => void handleRetry()}
          disabled={retrying}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-coral/40 bg-card px-3.5 py-1.5 text-[13px] font-medium text-coral hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5", retrying && "animate-spin")} strokeWidth={1.8} />
          {retrying ? "Retrying..." : "Retry analysis"}
        </button>
      </div>
    </div>
  );
}

function Timeline({ recording }: { recording: Recording }) {
  return (
    <section className="card-soft animate-rise p-7">
      <ol className="relative space-y-7 border-l border-border pl-7">
        {(recording.timeline ?? []).map((t) => (
          <li key={t.id} className="relative">
            <span className="absolute top-1.5 -left-[33px] size-2.5 rounded-full bg-lavender-strong ring-4 ring-card" />
            <TimeChip time={t.time} className="-ml-1.5" />
            <p className="mt-0.5 text-sm">{t.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PersonalResult({ recording }: { recording: Recording }) {
  return (
    <div className="space-y-5">
      <TranscriptView recording={recording} />

      <div>
        <h2 className="mt-8 mb-1 text-[15px] font-semibold">Insights</h2>
        <p className="mb-4 text-[13px] text-muted-foreground">
          What you said, grouped so it's easier to revisit.
        </p>
        <div className="grid gap-5 lg:grid-cols-2">
          {(recording.personalInsights ?? []).map((group) => {
            const meta = PERSONAL_CATEGORY_META[group.category];
            return (
              <section
                key={group.category}
                className={cn(
                  "animate-rise rounded-3xl border border-border p-6 shadow-soft",
                  meta.tone === "lavender" && "bg-lavender/60",
                  meta.tone === "sage" && "bg-sage/60",
                  meta.tone === "dusty" && "bg-dusty/60",
                  meta.tone === "peach" && "bg-peach/60",
                )}
              >
                <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                  <span aria-hidden>{meta.emoji}</span>
                  {meta.label}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((i) => (
                    <li key={i.id} className="rounded-2xl bg-card/80 px-4 py-3">
                      <TimeChip time={i.time} className="-ml-1.5" />
                      <p className="mt-0.5 text-sm leading-relaxed">"{i.text}"</p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const meetingTabs = ["Overview", "Transcript", "Action Items", "Timeline"] as const;

function RecordingResult() {
  const loaderData = Route.useLoaderData();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<Recording>(loaderData);
  const [tab, setTab] = useState<(typeof meetingTabs)[number]>("Overview");
  const [busy, setBusy] = useState<string | null>(null);
  const isMeeting = recording.mode === "meeting";

  const handleRename = async () => {
    const next = window.prompt("Rename recording", recording.title);
    if (!next || !next.trim() || next.trim() === recording.title) return;
    setBusy("Rename");
    try {
      setRecording(await renameRecording(recording.id, next.trim()));
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "Could not rename recording.");
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = () => downloadTranscript(recording);

  const handleDelete = async () => {
    if (!window.confirm("Delete this recording? This can't be undone.")) return;
    setBusy("Delete");
    try {
      await deleteRecording(recording.id);
      void navigate({ to: "/history" });
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "Could not delete recording.");
      setBusy(null);
    }
  };

  const actions = [
    { label: "Rename", icon: Pencil, onClick: handleRename },
    { label: "Download", icon: Download, onClick: handleDownload },
    { label: "Delete", icon: Trash2, onClick: handleDelete },
  ] as const;

  return (
    <AppShell>
      <header className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold sm:text-[28px]">
              {isMeeting ? recording.title : "Personal Recording"}
            </h1>
            <Pill tone={isMeeting ? "lavender" : "sage"}>{recording.mode}</Pill>
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {formatDuration(recording.durationSeconds ?? recording.durationMin * 60)}
            {isMeeting && recording.speakers ? ` • ${recording.speakers} speakers` : ""} •{" "}
            {recording.when}
          </p>
          {!isMeeting ? (
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">{recording.title}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={() => void onClick()}
              disabled={busy === label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] transition-colors hover:bg-secondary disabled:opacity-50",
                label === "Delete" && "text-coral hover:bg-peach",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-7">
        <AnalysisStatusBanner recording={recording} onRetried={setRecording} />
      </div>
      {isMeeting ? (
        <>
          <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
            {meetingTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  tab === t
                    ? "bg-lavender text-lavender-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            {tab === "Overview" ? <MeetingOverview recording={recording} /> : null}
            {tab === "Transcript" ? <TranscriptView recording={recording} /> : null}
            {tab === "Action Items" ? (
              <SectionCard title="Action Items" icon={<ListChecks />} tone="lavender">
                <ul className="space-y-1">
                  {(recording.actionItems ?? []).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/60"
                    >
                      <input
                        type="checkbox"
                        aria-label={a.task}
                        className="mt-0.5 size-4 shrink-0 rounded-[5px] border border-border"
                      />
                      <div>
                        <p className="text-sm font-medium">{a.task}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span className={cn(!a.owner && "italic")}>
                            {a.owner ?? "Unassigned"}
                          </span>
                          <span className="text-border">·</span>
                          <span className={cn(!a.deadline && "italic")}>
                            {a.deadline ? `Due ${a.deadline}` : "No deadline specified"}
                          </span>
                          <span className="text-border">·</span>
                          <TimeChip time={a.time} className="-ml-1" />
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            ) : null}
            {tab === "Timeline" ? <Timeline recording={recording} /> : null}
          </div>
        </>
      ) : (
        <div>
          <PersonalResult recording={recording} />
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/history"
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to all recordings
        </Link>
      </div>
    </AppShell>
  );
}
