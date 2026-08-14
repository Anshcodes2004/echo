import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/echo/AppShell";
import { RecordDial } from "@/components/echo/RecordDial";
import { type Mode, type Recording, formatDuration } from "@/lib/echo-data";
import { fetchRecordings } from "@/lib/recording-api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Echo — Turn conversations into decisions and action items" },
      {
        name: "description",
        content:
          "Echo records meetings and personal voice notes, transcribes them live, and extracts decisions, action items, ideas and questions.",
      },
      { property: "og:title", content: "Echo — Conversation intelligence & voice notes" },
      {
        property: "og:description",
        content: "Record, transcribe in real time, understand, and act on every conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const modes = [
  {
    mode: "personal" as Mode,
    icon: Sparkles,
    title: "Personal",
    hint: "Thoughts, ideas, reflections",
  },
  {
    mode: "meeting" as Mode,
    icon: Users,
    title: "Meeting",
    hint: "Decisions, action items, speakers",
  },
];

function Home() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("personal");
  const [recent, setRecent] = useState<Recording[]>([]);
  useEffect(() => {
    void fetchRecordings()
      .then((items) => setRecent(items.slice(0, 4)))
      .catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <header className="animate-rise text-center">
          <h1 className="text-[28px] font-semibold sm:text-[34px]">
            Good morning, {user ? (user.name ?? user.email.split("@")[0]) : "Ansh"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Press once. Echo listens, writes it down, and pulls out what matters.
          </p>
        </header>

        <div className="animate-rise mt-12 flex flex-col items-center">
          <RecordDial mode={mode} />
          <p className="mt-6 text-[13px] tracking-wide text-muted-foreground uppercase">
            Tap to start recording
          </p>
        </div>

        <div className="animate-rise mt-9 grid w-full max-w-md grid-cols-2 gap-3">
          {modes.map((m) => {
            const active = m.mode === mode;
            return (
              <button
                key={m.mode}
                type="button"
                onClick={() => setMode(m.mode)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border px-4 py-3.5 text-left transition-all duration-300",
                  active
                    ? "border-transparent bg-card shadow-soft"
                    : "border-border bg-transparent hover:bg-card/60",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <m.icon
                    className={cn(
                      "size-4 transition-colors",
                      active
                        ? m.mode === "meeting"
                          ? "text-lavender-foreground"
                          : "text-sage-foreground"
                        : "text-muted-foreground",
                    )}
                    strokeWidth={1.8}
                  />
                  {m.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{m.hint}</span>
              </button>
            );
          })}
        </div>

        <section className="animate-rise mt-16 w-full">
          <div className="mb-1 flex items-end justify-between border-b border-border pb-3">
            <h2 className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
              Recent
            </h2>
            <Link
              to="/history"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <ul>
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  to="/recording/$id"
                  params={{ id: r.id }}
                  className="group flex items-center gap-4 border-b border-border/70 py-4 transition-colors hover:border-border"
                >
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      r.mode === "meeting" ? "bg-lavender-strong" : "bg-sage-strong",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium transition-colors group-hover:text-primary">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                      {r.preview}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatDuration(r.durationSeconds ?? r.durationMin * 60)} · {r.when}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
