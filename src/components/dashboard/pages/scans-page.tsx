"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  RefreshCw,
  AlertTriangle,
  Check,
  Clock,
  Loader2,
  Pause,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../primitives";
import { StatusPill, scanStatusTone } from "../status-pills";
import { Button } from "@/components/ui/button";
import { useScans, useSnapshots, useRetryScan, useStartScan } from "@/lib/api-client";
import type { ScanStatus } from "@/lib/mock-data";
import { formatRelative, formatDateTime, formatDuration, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LoadingRows, ErrorBanner } from "../loading-states";
import { toast } from "sonner";

const STATUS_ICON: Record<ScanStatus, typeof Check> = {
  Success: Check,
  Running: Loader2,
  Pending: Clock,
  Paused: Pause,
  Failed: AlertTriangle,
};

export function ScansPage() {
  const { data: scansData, isLoading, isError, error, refetch } = useScans({});
  const { data: snapshotsData } = useSnapshots();
  const retryScan = useRetryScan();
  const startScan = useStartScan();
  const scans = scansData?.items ?? [];
  const snapshots = snapshotsData?.items ?? [];
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const handleStartScan = () => {
    startScan.mutate({ scope: "all" }, {
      onSuccess: () => toast.success("Scan started", { description: "A new scan-all job has been queued." }),
      onError: (err) => toast.error("Scan failed to start", { description: err.message }),
    });
  };

  const handleRetry = (id: string) => {
    retryScan.mutate(id, {
      onSuccess: () => toast.success("Scan retry queued"),
      onError: (err) => toast.error("Retry failed", { description: err.message }),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scans"
        description="Scan history and job monitoring. Each scan is saved as a snapshot."
      >
        <Button size="sm" onClick={handleStartScan} disabled={startScan.isPending} className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
          <ScanLine className="size-3.5" />
          {startScan.isPending ? "Starting…" : "Scan all"}
        </Button>
      </PageHeader>

      {/* Snapshot summary */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-border/70 bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
        {snapshots.map((s) => (
          <div key={s.id} className="bg-card p-3.5">
            <div className="font-mono text-[10px] font-medium text-emerald-600">{s.label}</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">
              {formatNumber(s.totalInstances)}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {s.filesScanned} files · {formatRelative(s.at)}
            </div>
          </div>
        ))}
      </div>

      {/* Scan history table */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2.5">
          <span className="label-mono">scan history</span>
          <span className="font-mono text-[11px] text-muted-foreground">{scans.length} jobs</span>
        </div>
        <div className="divide-y divide-border/60">
          {scans.map((scan, i) => {
            const Icon = STATUS_ICON[scan.status];
            const isOpen = expanded === scan.id;
            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : scan.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border",
                      scan.status === "Success" && "border-emerald-500/30 bg-emerald-50 text-emerald-600",
                      scan.status === "Failed" && "border-rose-500/30 bg-rose-50 text-rose-600",
                      scan.status === "Running" && "border-sky-500/30 bg-sky-50 text-sky-600",
                      scan.status === "Paused" && "border-amber-500/30 bg-amber-50 text-amber-600",
                      scan.status === "Pending" && "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("size-4", scan.status === "Running" && "animate-spin")} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-foreground">{scan.label}</span>
                      <span className="truncate text-sm text-foreground">{scan.target}</span>
                      <StatusPill tone={scanStatusTone(scan.status as ScanStatus)} dot={false}>{scan.status}</StatusPill>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-muted-foreground">
                      <span>{scan.scope === "all" ? "scope: all files" : "scope: single file"}</span>
                      <span>started {formatRelative(scan.startedAt)}</span>
                      {scan.durationMs != null && <span>duration {formatDuration(scan.durationMs)}</span>}
                      <span className={scan.filesFailed > 0 ? "text-rose-600" : ""}>
                        {scan.filesOk} ok{scan.filesFailed > 0 ? ` · ${scan.filesFailed} failed` : ""}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="border-t border-border/60 bg-muted/20 px-4 py-4">
                    {scan.error ? (
                      <div className="mb-3 flex items-start gap-2.5 rounded-md border border-rose-500/30 bg-rose-50/50 p-3">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                        <div>
                          <div className="text-xs font-semibold text-rose-700">Error</div>
                          <p className="mt-0.5 text-xs text-rose-700/80">{scan.error}</p>
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Detail label="started at" value={formatDateTime(scan.startedAt)} />
                      <Detail label="finished at" value={scan.finishedAt ? formatDateTime(scan.finishedAt) : "—"} />
                      <Detail label="duration" value={formatDuration(scan.durationMs)} />
                      <Detail label="files scanned" value={`${scan.filesOk} / ${scan.filesOk + scan.filesFailed}`} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {scan.status === "Failed" && (
                        <Button size="sm" variant="outline" onClick={() => handleRetry(scan.id)} disabled={retryScan.isPending} className="h-8 gap-1.5">
                          <RefreshCw className="size-3.5" />
                          Retry scan
                        </Button>
                      )}
                      {scan.status === "Paused" && (
                        <Button size="sm" variant="outline" onClick={() => handleRetry(scan.id)} disabled={retryScan.isPending} className="h-8 gap-1.5">
                          <RefreshCw className="size-3.5" />
                          Resume scan
                        </Button>
                      )}
                      {scan.snapshot && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground">
                          View snapshot
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        {isLoading && <div className="p-4"><LoadingRows count={4} /></div>}
        {isError && <div className="p-4"><ErrorBanner message={error?.message ?? "Failed to load scans"} onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && scans.length === 0 && (
          <div className="px-6 py-10 text-center text-xs text-muted-foreground">No scans yet. Click "Scan all" to start.</div>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
        <ScanLine className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
        <p>
          <span className="font-medium text-foreground">Scan policy:</span> Failed scans never corrupt previous data.
          The last successful result stays visible until a new scan succeeds. Partial success still saves the files that succeeded.
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="mt-0.5 font-mono text-[11px] text-foreground">{value}</div>
    </div>
  );
}
