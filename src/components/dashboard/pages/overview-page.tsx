"use client";

import * as React from "react";
import Link from "next/link";
import {
  Boxes,
  FileStack,
  Layers,
  Ban,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Database,
  ScanLine,
  FilePlus2,
} from "lucide-react";
import { PageHeader, MetricCard, SectionCard } from "../primitives";
import { StatusPill, changeTypeTone } from "../status-pills";
import {
  useOverview,
  useComponents,
  useChanges,
  useScans,
  useSnapshots,
  useSourceUiKit,
} from "@/lib/api-client";
import { formatNumber, formatRelative, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { LoadingGrid, LoadingRows, ErrorBanner } from "../loading-states";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function OverviewPage() {
  const overviewQ = useOverview();
  const componentsQ = useComponents({ sort: "instances", dir: "desc" });
  const changesQ = useChanges({});
  const scansQ = useScans({});
  const snapshotsQ = useSnapshots();
  const sourceKitQ = useSourceUiKit();

  const overview = overviewQ.data;
  const topComponents = (componentsQ.data?.items ?? []).slice(0, 5);
  const recentChanges = (changesQ.data?.items ?? []).slice(0, 6);
  const lastScan = scansQ.data?.items?.[0];
  const snapshots = snapshotsQ.data?.items ?? [];
  const isEmpty =
    !!overview &&
    overview.totalComponents === 0 &&
    overview.registeredFiles === 0 &&
    overview.totalInstances === 0 &&
    snapshots.length === 0;

  // Trend: snapshots ascending by time
  const trendData = React.useMemo(
    () => [...snapshots].reverse().map((s) => ({ scan: s.label, instances: s.totalInstances })),
    [snapshots]
  );
  const trendGrowth = React.useMemo(() => {
    if (trendData.length >= 2) {
      const first = trendData[0].instances;
      const last = trendData[trendData.length - 1].instances;
      if (first > 0) return Math.round(((last - first) / first) * 1000) / 10;
    }
    return null;
  }, [trendData]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        description="Design system usage at a glance — based on registered files and the latest scan."
      >
        <span className="hidden items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground sm:inline-flex">
          <Clock className="size-3" />
          Last scan {overview ? formatRelative(overview.lastScanAt) : "…"}
        </span>
      </PageHeader>

      {overviewQ.isLoading && <LoadingGrid count={4} />}
      {overviewQ.isError && <ErrorBanner message={overviewQ.error.message} onRetry={() => overviewQ.refetch()} />}

      {isEmpty && <EmptySetupCard hasSourceKit={!!sourceKitQ.data} />}

      {overview && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard index={0} label="Total components" value={overview.totalComponents} icon={Boxes} />
            <MetricCard index={1} label="Registered files" value={overview.registeredFiles} icon={FileStack} />
            <MetricCard index={2} label="Total instances" value={formatNumber(overview.totalInstances)} icon={Layers} />
            <MetricCard index={3} label="Unused" value={overview.unusedComponents} icon={Ban} tone="warn" />
          </div>

          {/* Trend + scan status */}
          <div className="grid gap-3 lg:grid-cols-3">
            <SectionCard
              title="Instance trend"
              description="Total component instances per scan"
              className="lg:col-span-2"
              action={
                trendGrowth != null ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <TrendingUp className="size-3" />
                    {trendGrowth > 0 ? `+${trendGrowth}%` : `${trendGrowth}%`} over {trendData.length} scans
                  </span>
                ) : undefined
              }
            >
              <div className="h-56 w-full p-3">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="instancesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                      <XAxis dataKey="scan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        formatter={(v: number) => [formatNumber(v), "Instances"]}
                      />
                      <Area type="monotone" dataKey="instances" stroke="#10b981" strokeWidth={2} fill="url(#instancesGrad)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No scan history yet.</div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Scan status"
              description={overview.lastScanLabel ?? "—"}
              action={lastScan ? <StatusPill tone="active">{lastScan.status}</StatusPill> : undefined}
            >
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Files scanned</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {lastScan ? `${lastScan.filesOk}/${overview.registeredFiles}` : "—"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${lastScan && overview.registeredFiles > 0 ? Math.min(100, (lastScan.filesOk / overview.registeredFiles) * 100) : 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg border border-border/60 bg-background/60 p-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Succeeded</div>
                    <div className="mt-0.5 text-lg font-semibold text-emerald-600">{lastScan?.filesOk ?? 0}</div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 p-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Failed</div>
                    <div className="mt-0.5 text-lg font-semibold text-rose-600">{lastScan?.filesFailed ?? 0}</div>
                  </div>
                </div>
                <div className="border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                  Finished {lastScan ? formatRelative(lastScan.finishedAt) : "—"}
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/scans">
                    View scan history
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </SectionCard>
          </div>

          {/* Top components + recent changes */}
          <div className="grid gap-3 lg:grid-cols-2">
            <SectionCard
              title="Top used components"
              description="Highest instance count across registered files"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/components">
                    View all
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              }
            >
              {componentsQ.isLoading ? (
                <LoadingRows count={5} />
              ) : topComponents.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">No components tracked yet.</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {topComponents.map((c, i) => {
                    const max = topComponents[0].totalInstances || 1;
                    const pct = (c.totalInstances / max) * 100;
                    return (
                      <Link
                        key={c.id}
                        href="/dashboard/components"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-xs font-semibold tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{formatNumber(c.totalInstances)}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{c.set} · {c.filesUsed} files</span>
                            <span>{formatRelative(c.lastSeen)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Recent changes"
              description="Latest scan vs previous scan"
              action={
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                  <Activity className="size-3" />
                  {recentChanges.length} changes
                </span>
              }
            >
              {changesQ.isLoading ? (
                <LoadingRows count={6} />
              ) : recentChanges.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">No changes detected in the latest scan.</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentChanges.map((ch) => (
                    <div key={ch.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{ch.componentName}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{ch.fileName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] tabular-nums text-muted-foreground">{ch.previous} → {ch.current}</span>
                        <StatusPill tone={changeTypeTone(ch.type as any)} dot={false}>{ch.type}</StatusPill>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Health alerts */}
          <SectionCard title="Health alerts" description="Items that may need attention">
            <div className="grid gap-px bg-border/60 sm:grid-cols-3">
              <HealthAlert icon={Ban} tone="warn" count={overview.unusedComponents} label="Unused components" cta="Review in Insights" href="/dashboard/insights" />
              <HealthAlert icon={AlertTriangle} tone="danger" count={overview.failedScans} label="Failed scans" cta="Retry in Scans" href="/dashboard/scans" />
              <HealthAlert icon={Clock} tone="warn" count={overview.staleFiles} label="Stale files" cta="Rescan in Files" href="/dashboard/files" />
            </div>
          </SectionCard>

          {/* Honesty disclaimer */}
          <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
            <Zap className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            <p>
              <span className="font-medium text-foreground">Data scope:</span>{" "}
              Usage is calculated from registered Figma files that have been scanned.
              Data reflects the latest successful scan ({formatDateTime(overview.lastScanAt)}),
              not real-time Figma activity.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function HealthAlert({
  icon: Icon,
  tone,
  count,
  label,
  cta,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "warn" | "danger";
  count: number;
  label: string;
  cta: string;
  href: string;
}) {
  const color = tone === "danger" ? "text-rose-600" : "text-amber-600";
  const bg = tone === "danger" ? "bg-rose-50" : "bg-amber-50";
  return (
    <div className="bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={`flex size-7 items-center justify-center rounded-md ${bg} ${color}`}>
          <Icon className="size-3.5" />
        </span>
        <span className="text-2xl font-semibold tabular-nums text-foreground">{count}</span>
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{label}</div>
      <Link href={href} className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${color} hover:underline`}>
        {cta}
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function EmptySetupCard({ hasSourceKit }: { hasSourceKit: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/80 bg-card/60 p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-12 left-1/2 size-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <ScanLine className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label-mono-emerald">get started</div>
          <h2 className="mt-1 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Your workspace is empty
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Connect your source UI Kit, register the Figma files you want to track,
            then run your first scan. Dashboard metrics will appear here as soon
            as your first snapshot lands.
          </p>

          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            <Step
              n="01"
              icon={Database}
              title="Connect UI Kit"
              done={hasSourceKit}
              cta="Open settings"
              href="/dashboard/settings"
            />
            <Step
              n="02"
              icon={FilePlus2}
              title="Register files"
              done={false}
              cta="Add files"
              href="/dashboard/files"
            />
            <Step
              n="03"
              icon={ScanLine}
              title="Run a scan"
              done={false}
              cta="Open scans"
              href="/dashboard/scans"
            />
          </ol>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  done,
  cta,
  href,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  done: boolean;
  cta: string;
  href: string;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          step {n}
        </span>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            done
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-foreground" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <Button asChild variant="outline" size="sm" className="mt-1 h-8 w-full justify-between">
        <Link href={href}>
          {cta}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </li>
  );
}
