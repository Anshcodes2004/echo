import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/echo/AppShell";
import { Dot } from "@/components/echo/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/record/")({
  head: () => ({
    meta: [
      { title: "Record a session — Echo" },
      {
        name: "description",
        content: "Choose meeting or personal mode and start a live transcribed recording in Echo.",
      },
      { property: "og:title", content: "Record a session — Echo" },
      {
        property: "og:description",
        content: "Choose meeting or personal mode and start a live transcribed recording.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecordPicker,
});

const modes = [
  {
    mode: "meeting" as const,
    tone: "lavender" as const,
    icon: Users,
    title: "Meeting",
    description: "Capture conversations, decisions, action items and important moments.",
    features: ["Speaker detection", "Decisions", "Action items", "Timeline"],
  },
  {
    mode: "personal" as const,
    tone: "sage" as const,
    icon: Sparkles,
    title: "Personal",
    description: "Capture thoughts, ideas and reflections without worrying about taking notes.",
    features: ["Ideas", "Goals", "Questions", "Important thoughts"],
  },
];

function RecordPicker() {
  return (
    <AppShell>
      <header className="animate-rise">
        <h1 className="text-[26px] font-semibold sm:text-3xl">Start a recording</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Pick the mode that matches what you're capturing.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {modes.map((m) => (
          <Link
            key={m.title}
            to="/record/$mode"
            params={{ mode: m.mode }}
            className="card-soft hover-lift animate-rise group p-7"
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl",
                m.tone === "lavender"
                  ? "bg-lavender text-lavender-foreground"
                  : "bg-sage text-sage-foreground",
              )}
            >
              <m.icon className="size-5" strokeWidth={1.8} />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{m.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {m.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Dot tone={m.tone} />
                  {f}
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3">
              Continue <ArrowRight className="size-4" strokeWidth={1.8} />
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
