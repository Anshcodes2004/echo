import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/echo/AppShell";
import { SectionCard } from "@/components/echo/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Echo" },
      {
        name: "description",
        content:
          "Manage transcription language, speaker detection, insight extraction and privacy preferences in Echo.",
      },
      { property: "og:title", content: "Settings — Echo" },
      { property: "og:description", content: "Manage transcription, insights and privacy preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Toggle({ label, hint, defaultOn }: { label: string; hint: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={cn(
          "mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-300",
          on ? "bg-sage-strong" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "block size-5 rounded-full bg-card shadow-soft transition-transform duration-300",
            on && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

function Settings() {
  return (
    <AppShell>
      <header className="animate-rise">
        <h1 className="text-[26px] font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Tune how Echo listens, understands and stores your recordings.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Profile" tone="dusty">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-dusty text-lg font-semibold text-dusty-foreground">
              A
            </span>
            <div>
              <p className="text-sm font-medium">Ansh Kohli</p>
              <p className="text-[13px] text-muted-foreground">ansh@echo.app · Pro plan</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Transcription" tone="lavender">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[13px] text-muted-foreground">Language</span>
              <select className="mt-1.5 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>Auto-detect</option>
              </select>
            </label>
            <div className="divide-y divide-border">
              <Toggle
                label="Speaker detection"
                hint="Label speakers automatically in meeting mode."
                defaultOn
              />
              <Toggle label="Filler word removal" hint="Clean up ums and ahs in the transcript." />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Insights" tone="sage">
          <div className="divide-y divide-border">
            <Toggle label="Extract action items" hint="Owners and deadlines only when stated." defaultOn />
            <Toggle label="Detect decisions" hint="Highlight agreed outcomes with timestamps." defaultOn />
            <Toggle label="Flag risks and open questions" hint="Surface unresolved items after each meeting." defaultOn />
          </div>
        </SectionCard>

        <SectionCard title="Privacy" tone="peach">
          <div className="divide-y divide-border">
            <Toggle label="Store audio" hint="Keep the original audio alongside transcripts." defaultOn />
            <Toggle label="Auto-delete after 90 days" hint="Recordings are removed automatically." />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
