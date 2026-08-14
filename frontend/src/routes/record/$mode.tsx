import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Globe, Mic, Square, Wifi } from "lucide-react";
import { AppShell } from "@/components/echo/AppShell";
import { TimeChip } from "@/components/echo/primitives";
import { formatClock, type Mode } from "@/lib/echo-data";
import { cn } from "@/lib/utils";
import { useRecordingSession } from "@/hooks/use-recording-session";

export const Route = createFileRoute("/record/$mode")({
  beforeLoad: ({ params }) => {
    if (params.mode !== "meeting" && params.mode !== "personal") throw notFound();
  },
  component: RecordingScreen,
});

function RecordingScreen() {
  const { mode } = Route.useParams() as { mode: Mode };
  const navigate = useNavigate();
  const isMeeting = mode === "meeting";
  const [seconds, setSeconds] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const handleComplete = useCallback(
    (id: string) => navigate({ to: "/recording/$id", params: { id } }),
    [navigate],
  );
  const session = useRecordingSession(mode, handleComplete);
  useEffect(() => {
    if (session.state !== "recording") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [session.state]);
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [session.segments, session.interim]);
  if (session.state === "processing")
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <div className="relative mb-9 size-28">
            <span className="absolute inset-0 rounded-full bg-lavender animate-breathe" />
            <span className="absolute inset-5 rounded-full bg-sage animate-breathe" />
            <span className="absolute inset-10 rounded-full bg-dusty-strong animate-breathe" />
          </div>
          <h1 className="text-xl font-semibold">
            {isMeeting ? "Processing your meeting..." : "Organizing your thoughts..."}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your final transcript is saved first, then Echo creates timestamped insights.
          </p>
        </div>
      </AppShell>
    );
  return (
    <AppShell>
      <div className="animate-rise text-center">
        <h1 className="text-[22px] font-semibold sm:text-2xl">
          {isMeeting ? "Meeting Recording" : "Personal Recording"}
        </h1>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-peach px-3 py-1 text-xs font-medium text-peach-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              session.state === "recording" ? "bg-coral animate-pulse-dot" : "bg-muted-foreground",
            )}
          />
          {session.state === "starting"
            ? "Connecting..."
            : session.state === "error"
              ? "Connection issue"
              : "Recording"}
        </p>
        <p className="mt-6 font-mono text-5xl font-light tabular-nums sm:text-6xl">
          {formatClock(seconds)}
        </p>
      </div>
      <div className="mt-9 flex h-28 items-center justify-center gap-1.5" aria-hidden>
        {session.levels.map((level, index) => (
          <span
            key={index}
            className={cn(
              "w-1.5 rounded-full transition-[height] duration-100 sm:w-2",
              index % 3 === 0
                ? "bg-lavender-strong"
                : index % 3 === 1
                  ? "bg-dusty-strong"
                  : "bg-sage-strong",
            )}
            style={{ height: `${Math.max(8, level * 100)}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        {session.error ??
          (session.state === "starting" ? "Requesting microphone access..." : "Listening...")}
      </p>
      <section className="card-soft mt-9 overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Live transcript
          </h2>
          <span className="text-xs text-muted-foreground">{session.segments.length} segments</span>
        </header>
        <div ref={feedRef} className="max-h-[360px] space-y-5 overflow-y-auto px-6 py-6">
          {session.segments.length === 0 && !session.interim ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Your transcript will appear here as you speak.
            </p>
          ) : null}
          {session.segments.map((segment) => (
            <div key={segment.id} className="animate-rise">
              <div className="flex items-center gap-2">
                {segment.speaker ? (
                  <span className="text-[13px] font-medium">{segment.speaker}</span>
                ) : null}
                <TimeChip time={segment.time} />
              </div>
              <p className="mt-1 text-[15px] leading-relaxed">{segment.text}</p>
            </div>
          ))}
          {session.interim ? (
            <div className="animate-fade-in">
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground/60 italic">
                {session.interim.text}
              </p>
            </div>
          ) : null}
        </div>
      </section>
      <div className="mt-9 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={session.stop}
          disabled={session.state !== "recording"}
          className="inline-flex items-center gap-2.5 rounded-full bg-coral px-8 py-4 text-[15px] font-medium text-coral-foreground shadow-soft transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square className="size-4 fill-current" strokeWidth={0} />
          Stop Recording
        </button>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Mic className="size-3.5" />
            Microphone {session.state === "recording" ? "connected" : "pending"}
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Wifi className="size-3.5 text-sage-foreground" />
            {session.state === "recording" ? "Connected" : "Connecting"}
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Globe className="size-3.5" />
            English
          </span>
        </p>
      </div>
    </AppShell>
  );
}
