"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ban,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "../primitives";
import { StatusPill, changeTypeTone } from "../status-pills";
import { useInsights } from "@/lib/api-client";
import type { ComponentStatus } from "@/lib/mock-data";
import { formatNumber, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { LoadingRows, ErrorBanner } from "../loading-states";

export function InsightsPage() {
  const { data, isLoading, isError, error, refetch } = useInsights();

  const unused = data?.unused ?? [];
  const lowUsage = data?.lowUsage ?? [];
  const mostUsed = data?.mostUsed ?? [];
  const staleFiles = data?.staleFiles ?? [];
  const failedScans = data?.failedScans ?? [];
  const recentChanges = data?.recentChanges ?? [];
  const thresholds = data?.thresholds;
  const lastScanLabel = data?.lastScanLabel ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Insights"
        description="Governance opportunities — the signals you need for cleanup and deprecation."
      />

      {isLoading && <LoadingRows count={5} />}
      {isError && <ErrorBanner message={error?.message ?? "Failed to load insights"} onRetry={() => refetch()} />}

      {!isLoading && !isError && data && (
        <>
      {/* Insight summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <InsightStat icon={Ban} tone="warn" count={unused.length} label="Unused" href="/dashboard/components" />
        <InsightStat icon={TrendingDown} tone="low" count={lowUsage.length} label="Low usage" href="/dashboard/components" />
        <InsightStat icon={TrendingUp} tone="success" count={mostUsed.length} label="Most used" href="/dashboard/components" />
        <InsightStat icon={Clock} tone="warn" count={staleFiles.length} label="Stale files" href="/dashboard/files" />
        <InsightStat icon={AlertTriangle} tone="danger" count={failedScans.length} label="Failed scans" href="/dashboard/scans" />
      </div>

      {/* Two-column: unused + low usage */}
      <div className="grid gap-3 lg:grid-cols-2">
        <InsightPanel
          title="Unused components"
          description="Zero instances across registered files — candidates for deprecation."
          icon={Ban}
          tone="warn"
          count={unused.length}
          seeAllHref="/dashboard/components"
        >
          {unused.map((c) => (
            <InsightRow key={c.id} name={c.name} set={c.set} right={<StatusPill tone="unused" dot={false}>0 instances</StatusPill>} />
          ))}
          {unused.length === 0 && <EmptyInsight text="No unused components. Everything is in use." />}
        </InsightPanel>

        <InsightPanel
          title="Low usage components"
          description="Below threshold — review whether to improve, merge, or deprecate."
          icon={TrendingDown}
          tone="low"
          count={lowUsage.length}
          seeAllHref="/dashboard/components"
        >
          {lowUsage.slice(0, 8).map((c) => (
            <InsightRow
              key={c.id}
              name={c.name}
              set={c.set}
              right={
                <span className="font-mono text-xs tabular-nums text-amber-700">
                  {formatNumber(c.totalInstances)} · {c.filesUsed} files
                </span>
              }
            />
          ))}
          {lowUsage.length === 0 && <EmptyInsight text="No low-usage components above threshold." />}
        </InsightPanel>
      </div>

      {/* Most used + recent changes */}
      <div className="grid gap-3 lg:grid-cols-2">
        <InsightPanel
          title="Most used components"
          description="Highest adoption — protect and invest in these."
          icon={TrendingUp}
          tone="success"
          count={mostUsed.length}
          seeAllHref="/dashboard/components"
        >
          {mostUsed.map((c, i) => {
            const max = mostUsed[0].totalInstances || 1;
            const pct = (c.totalInstances / max) * 100;
            return (
              <div key={c.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-foreground">{formatNumber(c.totalInstances)}</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </InsightPanel>

        <InsightPanel
          title="Recent changes"
          description="Newly used, increased, decreased, and removed since last scan."
          icon={Sparkles}
          tone="info"
          count={recentChanges.length}
        >
          {recentChanges.slice(0, 8).map((ch) => (
            <InsightRow
              key={ch.id}
              name={ch.componentName}
              set={ch.fileName}
              right={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {ch.previous}→{ch.current}
                  </span>
                  <StatusPill tone={changeTypeTone(ch.type as any)} dot={false}>{ch.type}</StatusPill>
                </div>
              }
            />
          ))}
          {recentChanges.length === 0 && <EmptyInsight text="No changes detected in the latest scan." />}
        </InsightPanel>
      </div>

      {/* Stale + failed */}
      <div className="grid gap-3 lg:grid-cols-2">
        <InsightPanel
          title="Stale files"
          description="Not scanned recently — data may be outdated."
          icon={Clock}
          tone="warn"
          count={staleFiles.length}
          seeAllHref="/dashboard/files"
        >
          {staleFiles.map((f) => (
            <InsightRow
              key={f.id}
              name={f.name}
              set={f.team}
              right={
                <span className="font-mono text-[10px] text-amber-700">
                  {formatRelative(f.lastScanned)}
                </span>
              }
            />
          ))}
          {staleFiles.length === 0 && <EmptyInsight text="No stale files. All scans are fresh." />}
        </InsightPanel>

        <InsightPanel
          title="Failed scans"
          description="Scans that failed — check access and retry."
          icon={AlertTriangle}
          tone="danger"
          count={failedScans.length}
          seeAllHref="/dashboard/scans"
        >
          {failedScans.map((s) => (
            <InsightRow
              key={s.id}
              name={s.target}
              set={s.id}
              right={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{formatRelative(s.startedAt)}</span>
                  <StatusPill tone="unused" dot={false}>Failed</StatusPill>
                </div>
              }
            />
          ))}
          {failedScans.length === 0 && <EmptyInsight text="No failed scans. Everything succeeded." />}
        </InsightPanel>
      </div>

      {/* Thresholds note */}
      <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
        <p>
          <span className="font-medium text-foreground">Thresholds:</span> Unused = 0 instances ·
          Low usage = below {thresholds?.lowUsage ?? 500} instances (configurable in Settings) · Stale = not scanned in {thresholds?.staleDays ?? 7}+ days.
          Insights are based on the latest successful scan{lastScanLabel ? ` (${lastScanLabel})` : ""}.
        </p>
      </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function InsightStat({
  icon: Icon,
  tone,
  count,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "warn" | "low" | "success" | "danger" | "info";
  count: number;
  label: string;
  href: string;
}) {
  const colors = {
    warn: "text-amber-600 bg-amber-50",
    low: "text-amber-600 bg-amber-50",
    success: "text-emerald-600 bg-emerald-50",
    danger: "text-rose-600 bg-rose-50",
    info: "text-sky-600 bg-sky-50",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={href}
      className="group flex flex-col items-start rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:border-border hover:shadow-sm"
    >
      <span className={`flex size-8 items-center justify-center rounded-md ${colors}`}>
        <Icon className="size-4" />
      </span>
      <span className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{count}</span>
      <span className="label-mono mt-0.5">{label}</span>
      </Link>
    </motion.div>
  );
}

function InsightPanel({
  title,
  description,
  icon: Icon,
  tone,
  count,
  seeAllHref,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "warn" | "low" | "success" | "danger" | "info";
  count: number;
  seeAllHref?: string;
  children: React.ReactNode;
}) {
  const colors = {
    warn: "text-amber-600",
    low: "text-amber-600",
    success: "text-emerald-600",
    danger: "text-rose-600",
    info: "text-sky-600",
  }[tone];
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Icon className={`size-4 ${colors}`} />
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums text-muted-foreground">{count}</span>
          {seeAllHref && (
            <Button variant="ghost" size="sm" asChild className="h-7 gap-1 px-2 text-[11px] text-muted-foreground">
              <Link href={seeAllHref}>
                See all
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
}

function InsightRow({ name, set, right }: { name: string; set: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{name}</div>
        <div className="truncate font-mono text-[10px] text-muted-foreground">{set}</div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function EmptyInsight({ text }: { text: string }) {
  return (
    <div className="px-4 py-6 text-center text-xs text-muted-foreground">{text}</div>
  );
}
