"use client";

import { cn } from "@/lib/utils";
import type {
  ComponentStatus,
  FileStatus,
  ScanStatus,
  ChangeType,
} from "@/lib/mock-data";

type Tone = "active" | "low" | "unused" | "warn" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300",
  low: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300",
  unused:
    "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300",
  warn: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-950/40 dark:text-orange-300",
  info: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300",
  neutral:
    "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

export function StatusPill({
  tone,
  children,
  className,
  dot = true,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className
      )}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", {
            "bg-emerald-500": tone === "active",
            "bg-amber-500": tone === "low",
            "bg-rose-500": tone === "unused",
            "bg-orange-500": tone === "warn",
            "bg-sky-500": tone === "info",
            "bg-muted-foreground": tone === "neutral",
          })}
        />
      )}
      {children}
    </span>
  );
}

export function componentStatusTone(s: ComponentStatus): Tone {
  switch (s) {
    case "Active":
      return "active";
    case "Low Usage":
      return "low";
    case "Unused":
      return "unused";
    default:
      return "neutral";
  }
}

export function fileStatusTone(s: FileStatus): Tone {
  switch (s) {
    case "Healthy":
      return "active";
    case "Low Adoption":
      return "low";
    case "Zero Usage":
      return "unused";
    case "Failed":
      return "unused";
    case "Stale":
      return "warn";
    case "Not Scanned":
      return "neutral";
    case "Disabled":
      return "neutral";
    default:
      return "neutral";
  }
}

export function scanStatusTone(s: ScanStatus): Tone {
  switch (s) {
    case "Success":
      return "active";
    case "Running":
      return "info";
    case "Pending":
      return "neutral";
    case "Paused":
      return "warn";
    case "Failed":
      return "unused";
    default:
      return "neutral";
  }
}

export function changeTypeTone(c: ChangeType): Tone {
  switch (c) {
    case "Newly Used":
      return "active";
    case "Increased":
      return "active";
    case "Decreased":
      return "low";
    case "Removed":
      return "unused";
    default:
      return "neutral";
  }
}
