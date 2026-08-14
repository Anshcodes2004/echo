import AuthGuardLink from "./AuthGuardLink";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mode } from "@/lib/echo-data";

export function RecordDial({ mode }: { mode: Mode }) {
  const isMeeting = mode === "meeting";

  return (
    <AuthGuardLink
      to="/record/$mode"
      params={{ mode }}
      ariaLabel={isMeeting ? "Start a meeting recording" : "Start a personal recording"}
      className="group relative flex size-[186px] items-center justify-center rounded-full sm:size-[212px]"
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-colors duration-500 animate-breathe",
          isMeeting ? "bg-lavender" : "bg-sage",
        )}
      />
      <span
        className={cn(
          "absolute inset-[14px] rounded-full transition-colors duration-500",
          isMeeting ? "bg-lavender/70" : "bg-sage/70",
        )}
      />
      <span
        className={cn(
          "relative flex size-[112px] items-center justify-center rounded-full shadow-lift transition-all duration-500 group-hover:scale-[1.04] group-active:scale-[0.97] sm:size-[128px]",
          isMeeting
            ? "bg-lavender-strong text-primary-foreground"
            : "bg-sage-strong text-primary-foreground",
        )}
      >
        <Mic className="size-8" strokeWidth={1.6} />
      </span>
    </AuthGuardLink>
  );
}
