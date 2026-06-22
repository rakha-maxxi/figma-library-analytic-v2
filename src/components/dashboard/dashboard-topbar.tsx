"use client";

import * as React from "react";
import {
  Search,
  ScanLine,
  HelpCircle,
  Command,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PAGE_META, type DashboardPage } from "@/lib/dashboard";
import { useOverview, useStartScan } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationsBell } from "./notifications-bell";

export function DashboardTopbar({ page }: { page: DashboardPage }) {
  const { data: overview } = useOverview();
  const startScanMutation = useStartScan();
  const [justScanned, setJustScanned] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const scanRunning = startScanMutation.isPending;

  const handleScan = () => {
    startScanMutation.mutate(
      { scope: "all" },
      {
        onSuccess: () => {
          setJustScanned(true);
          setTimeout(() => setJustScanned(false), 2200);
          toast.success("Scan started", { description: "A new scan-all job has been queued." });
        },
        onError: (err) => toast.error("Scan failed to start", { description: err.message }),
      }
    );
  };

  const meta = DASHBOARD_PAGE_META[page];

  // Cmd+K to focus search
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {meta.title}
          </h1>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            · {meta.subtitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {overview
            ? <>latest scan · {formatRelative(overview.lastScanAt)} · {overview.lastScanLabel}</>
            : <>loading latest scan…</>}
        </div>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search components, files…"
          className="h-8 w-56 rounded-md border border-border/70 bg-muted/40 pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 lg:w-64"
          aria-label="Search"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border/60 bg-background px-1 py-0.5 text-[9px] font-medium text-muted-foreground lg:inline-flex">
          <Command className="size-2.5" />K
        </kbd>
      </div>

      <div className="flex items-center gap-1">
        <NotificationsBell />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Help"
        >
          <HelpCircle className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border/60" />

        {scanRunning ? (
          <Button size="sm" disabled className="h-8 gap-1.5 font-mono text-[11px]">
            <Loader2 className="size-3.5 animate-spin" />
            starting scan…
          </Button>
        ) : justScanned ? (
          <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600/90">
            <Check className="size-3.5" />
            scan queued
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleScan}
            className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
          >
            <ScanLine className="size-3.5" />
            scan all
          </Button>
        )}
      </div>

      {/* Scan progress bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-emerald-500 transition-transform duration-500",
          scanRunning ? "scale-x-100" : "scale-x-0"
        )}
        aria-hidden
      />
    </header>
  );
}
