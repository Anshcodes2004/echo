import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "lavender" | "sage" | "dusty" | "peach" | "neutral";

const toneBg: Record<Tone, string> = {
  lavender: "bg-lavender text-lavender-foreground",
  sage: "bg-sage text-sage-foreground",
  dusty: "bg-dusty text-dusty-foreground",
  peach: "bg-peach text-peach-foreground",
  neutral: "bg-muted text-muted-foreground",
};

const toneDot: Record<Tone, string> = {
  lavender: "bg-lavender-strong",
  sage: "bg-sage-strong",
  dusty: "bg-dusty-strong",
  peach: "bg-peach-strong",
  neutral: "bg-muted-foreground/40",
};

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase",
        toneBg[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", toneDot[tone], className)} />;
}

export function TimeChip({ time, className }: { time: string; className?: string }) {
  return (
    <button
      type="button"
      title="Jump to this moment"
      className={cn(
        "rounded-md px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {time}
    </button>
  );
}

export function SectionCard({
  title,
  icon,
  tone = "neutral",
  children,
  className,
  action,
}: {
  title: string;
  icon?: ReactNode;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("card-soft animate-rise p-6", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg [&_svg]:size-4",
                toneBg[tone],
              )}
            >
              {icon}
            </span>
          ) : null}
          <h2 className="text-[15px] font-semibold">{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-soft flex flex-col items-center px-6 py-16 text-center">
      <div className="relative mb-7 size-24">
        <span className="absolute inset-0 rounded-full bg-lavender animate-breathe" />
        <span className="absolute inset-4 rounded-full bg-sage/80" />
        <span className="absolute right-1 bottom-2 size-7 rounded-full bg-peach" />
        <span className="absolute top-1 left-0 size-4 rounded-full bg-dusty-strong" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
