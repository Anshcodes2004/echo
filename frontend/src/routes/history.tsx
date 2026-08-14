import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/echo/AppShell";
import { EmptyState, Pill } from "@/components/echo/primitives";
import { type Mode, type Recording, formatDuration } from "@/lib/echo-data";
import { fetchRecordings } from "@/lib/recording-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Your recordings — Echo" },
      {
        name: "description",
        content:
          "Search and revisit every meeting and personal recording, with summaries, insights and full transcripts.",
      },
      { property: "og:title", content: "Your recordings — Echo" },
      {
        property: "og:description",
        content: "A searchable library of your meetings and personal voice notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: History,
});

const filters = ["all", "meeting", "personal"] as const;
const sorts = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "longest", label: "Longest" },
] as const;

function History() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [sort, setSort] = useState<(typeof sorts)[number]["key"]>("newest");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    void fetchRecordings()
      .then(setRecordings)
      .catch(() => setLoadError("Could not load recordings. Is the backend running?"));
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = recordings.filter(
      (r) =>
        (filter === "all" || r.mode === (filter as Mode)) &&
        (!q || r.title.toLowerCase().includes(q) || r.preview.toLowerCase().includes(q)),
    );
    return out.sort((a, b) =>
      sort === "newest"
        ? b.createdAt - a.createdAt
        : sort === "oldest"
          ? a.createdAt - b.createdAt
          : b.durationMin - a.durationMin,
    );
  }, [query, filter, sort, recordings]);

  return (
    <AppShell>
      <header className="animate-rise">
        <h1 className="text-[26px] font-semibold sm:text-3xl">Your recordings</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Everything you've captured, organized and searchable.
        </p>
      </header>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recordings..."
            className="h-11 w-full rounded-full border border-border bg-card pr-4 pl-11 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
                filter === f
                  ? "bg-lavender text-lavender-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : f === "meeting" ? "Meetings" : "Personal"}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-11 rounded-full border border-border bg-card px-4 text-[13px] font-medium outline-none focus:ring-2 focus:ring-ring/40"
        >
          {sorts.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loadError ? <p className="mb-4 text-sm text-coral">{loadError}</p> : null}
        {list.length === 0 ? (
          <EmptyState
            title="No recordings yet"
            description="Your conversations and thoughts will appear here."
            action={
              <Link
                to="/record"
                className="inline-flex items-center rounded-full bg-lavender px-5 py-2.5 text-sm font-medium text-lavender-foreground transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                Start your first recording
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {list.map((r, i) => (
              <Link
                key={r.id}
                to="/recording/$id"
                params={{ id: r.id }}
                style={{ animationDelay: `${i * 50}ms` }}
                className="card-soft hover-lift animate-rise flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[15px] font-semibold">{r.title}</h2>
                    <Pill tone={r.mode === "meeting" ? "lavender" : "sage"}>{r.mode}</Pill>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {r.mode === "meeting" ? "Meeting" : "Personal"} ·{" "}
                    {formatDuration(r.durationSeconds ?? r.durationMin * 60)} · {r.when}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/75">"{r.preview}"</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
