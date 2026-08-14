import { Link, useRouterState } from "@tanstack/react-router";
import AuthGuardLink from "./AuthGuardLink";
import { Home, Mic, Library, Sparkles, Settings as SettingsIcon, AudioLines } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fetchRecordings } from "@/lib/recording-api";
import { useAuth } from "@/lib/auth-context";

const MONTHLY_LIMIT_SECONDS = 10 * 60 * 60; // 10h

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/record", label: "Record", icon: Mic },
  { to: "/history", label: "History", icon: Library },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavItems({ pathname, compact }: { pathname: string; compact?: boolean }) {
  return (
    <nav className={cn("flex gap-1", compact ? "flex-row justify-around" : "flex-col")}>
      {nav.map(({ to, label, icon: Icon }) => {
        const active =
          to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
        return (
          <AuthGuardLink
            key={to}
            to={to}
            className={cn(
              "group flex items-center gap-3 rounded-xl text-sm transition-all duration-300",
              compact ? "flex-1 flex-col gap-1 px-1 py-2 text-[11px]" : "px-3 py-2.5",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-soft"
                : "font-normal text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon
              className={cn("shrink-0", compact ? "size-5" : "size-[18px]")}
              strokeWidth={1.8}
            />
            {label}
          </AuthGuardLink>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [usedSeconds, setUsedSeconds] = useState(0);

  useEffect(() => {
    void fetchRecordings()
      .then((items) => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const total = items
          .filter((r) => r.createdAt >= startOfMonth.getTime())
          .reduce((sum, r) => sum + (r.durationSeconds ?? r.durationMin * 60), 0);
        setUsedSeconds(total);
      })
      .catch(() => undefined);
  }, []);

  const usedHours = usedSeconds / 3600;
  const usagePct = Math.min(100, Math.round((usedSeconds / MONTHLY_LIMIT_SECONDS) * 100));

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex lg:w-[248px]">
        <AuthGuardLink to="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-lavender-strong text-primary-foreground">
            <AudioLines className="size-[18px]" strokeWidth={2} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">Echo</span>
        </AuthGuardLink>

        <NavItems pathname={pathname} />

        <div className="mt-auto space-y-3">
          <div className="px-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Monthly recording</span>
              <span className="font-mono text-foreground/70">{usedHours.toFixed(1)} / 10h</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-lavender-strong"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          <UserArea />
        </div>
      </aside>

      <main className="pb-24 md:pb-0 md:pl-[236px] lg:pl-[248px]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          {children}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 py-1.5 backdrop-blur md:hidden">
        <NavItems pathname={pathname} compact />
      </div>
    </div>
  );
}

function UserArea() {
  const { user, signOut } = useAuth();
  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-1.5">
      <span className="flex size-9 items-center justify-center rounded-full bg-dusty text-sm font-semibold text-dusty-foreground">
        {user ? user.email[0]?.toUpperCase() : "G"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user ? user.email : "Guest"}</p>
        <div className="mt-1 flex items-center gap-2">
          {user ? (
            <button onClick={() => signOut()} className="text-xs text-destructive hover:underline">
              Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/signin" className="text-xs text-muted-foreground hover:underline">
                Sign in
              </Link>
              <Link to="/signup" className="text-xs text-muted-foreground hover:underline">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
