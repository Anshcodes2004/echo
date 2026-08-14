import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckSquare, HelpCircle, Lightbulb, Target } from "lucide-react";
import { AppShell } from "@/components/echo/AppShell";
import { Dot, SectionCard, TimeChip } from "@/components/echo/primitives";
import { type Recording } from "@/lib/echo-data";
import { fetchRecordings } from "@/lib/recording-api";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Echo" },
      {
        name: "description",
        content:
          "Every open action item, decision, question and idea Echo extracted across your recordings, in one calm view.",
      },
      { property: "og:title", content: "Insights — Echo" },
      {
        property: "og:description",
        content: "Action items, decisions, questions and ideas across all your recordings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Insights,
});

function Insights() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  useEffect(() => { void fetchRecordings().then(setRecordings).catch(() => undefined); }, []);
  const actionItems = recordings.flatMap((r) =>
    (r.actionItems ?? []).map((a) => ({ ...a, source: r.title, sourceId: r.id })),
  );
  const questions = recordings.flatMap((r) =>
    (r.questions ?? []).map((q) => ({ ...q, source: r.title })),
  );
  const risks = recordings.flatMap((r) => (r.risks ?? []).map((x) => ({ ...x, source: r.title })));
  const ideas = recordings.flatMap((r) =>
    (r.personalInsights ?? [])
      .filter((g) => g.category === "ideas" || g.category === "goals")
      .flatMap((g) => g.items.map((i) => ({ ...i, category: g.category, source: r.title }))),
  );

  const stats = [
    { label: "Action items", value: actionItems.length, tone: "lavender" as const },
    { label: "Open questions", value: questions.length, tone: "dusty" as const },
    { label: "Risks flagged", value: risks.length, tone: "peach" as const },
    { label: "Ideas & goals", value: ideas.length, tone: "sage" as const },
  ];

  return (
    <AppShell>
      <header className="animate-rise">
        <h1 className="text-[26px] font-semibold sm:text-3xl">Insights</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          What came out of your conversations and thoughts — gathered in one place.
        </p>
      </header>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-soft animate-rise p-5">
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Dot tone={s.tone} />
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Action items" icon={<CheckSquare />} tone="lavender">
          <ul className="space-y-4">
            {actionItems.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-0.5 size-4 shrink-0 rounded-[5px] border border-border" />
                <div className="min-w-0">
                  <p className="text-sm">{a.task}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{a.owner ?? "Unassigned"}</span>
                    <span className="text-border">·</span>
                    <span>{a.deadline ? `Due ${a.deadline}` : "No deadline specified"}</span>
                    <span className="text-border">·</span>
                    <Link
                      to="/recording/$id"
                      params={{ id: a.sourceId }}
                      className="transition-colors hover:text-foreground"
                    >
                      {a.source}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Open questions" icon={<HelpCircle />} tone="dusty">
          <ul className="space-y-4">
            {questions.map((q) => (
              <li key={q.id}>
                <TimeChip time={q.time} className="-ml-1.5" />
                <p className="mt-1 text-sm">"{q.text}"</p>
                <p className="mt-1 text-xs text-muted-foreground">{q.source}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Risks & concerns" icon={<AlertTriangle />} tone="peach">
          <ul className="space-y-4">
            {risks.map((r) => (
              <li key={r.id}>
                <TimeChip time={r.time} className="-ml-1.5" />
                <p className="mt-1 text-sm">"{r.text}"</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.source}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Ideas & goals" icon={<Lightbulb />} tone="sage">
          <ul className="space-y-4">
            {ideas.map((i) => (
              <li key={i.id} className="flex gap-3">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-lg bg-sage text-sage-foreground">
                  {i.category === "goals" ? (
                    <Target className="size-3.5" strokeWidth={1.8} />
                  ) : (
                    <Lightbulb className="size-3.5" strokeWidth={1.8} />
                  )}
                </span>
                <div>
                  <p className="text-sm">"{i.text}"</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {i.time} · {i.source}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
