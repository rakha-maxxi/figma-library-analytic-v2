"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  FileSearch,
  Radar,
  GitCompareArrows,
  Lightbulb,
  ArrowUpRight,
  ScanLine,
  History,
  Boxes,
} from "lucide-react";
import { NumberedSection, FadeIn } from "./primitives";

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Component usage dashboard",
    body: "Browse every component from your source UI Kit with total instances, files used, status, and last seen — searchable, filterable, sortable.",
    bullets: ["Active / Low / Unused status", "Sort by usage & files"],
    tag: "Core",
    span: "lg:col-span-2",
    visual: "table",
  },
  {
    icon: FileSearch,
    title: "Component detail",
    body: "Open a component to see exactly which files use it, instance count per file, and jump straight to Figma when possible.",
    bullets: ["Files · Instances · Trend tabs"],
    tag: "Core",
    span: "",
    visual: "detail",
  },
  {
    icon: Radar,
    title: "Scan management",
    body: "Trigger scan-all or per-file rescans. Watch pending, running, success, paused, and failed states in real time.",
    bullets: ["Retry failed scans", "Scan queue & progress"],
    tag: "Core",
    span: "",
    visual: "scan",
  },
  {
    icon: GitCompareArrows,
    title: "Snapshot & change detection",
    body: "Each scan is saved as a snapshot. We compare the latest scan with the previous one to surface newly used, increased, decreased, and removed components.",
    bullets: ["Recent changes feed", "Per-scan diff"],
    tag: "Milestone 2",
    span: "lg:col-span-2",
    visual: "changes",
  },
  {
    icon: Lightbulb,
    title: "Insights & governance",
    body: "Unused components, low usage, most used, stale files, and failed scans — the signals you need for cleanup and deprecation decisions.",
    bullets: ["Configurable thresholds", "Candidate review list"],
    tag: "Milestone 3",
    span: "lg:col-span-2",
    visual: "insights",
  },
];

const MINI = [
  { icon: History, title: "Scan history", body: "Every scan is retained as a snapshot. Trend and change detection rely on it." },
  { icon: Boxes, title: "Source UI Kit sync", body: "Register one source library, refresh the component inventory anytime, or swap the source file." },
  { icon: ArrowUpRight, title: "Open in Figma", body: "Where the link can be resolved, jump straight from a component instance back to the file." },
];

export function Features() {
  return (
    <NumberedSection id="features" index="02" eyebrow="What's inside" className="bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            Everything you need to track adoption,{" "}
            <span className="text-muted-foreground/70">nothing you don't.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            A scoped, buildable tracker — not a replacement for org-wide Figma
            analytics. Five focused capabilities that turn scan history into
            decisions.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={feature.title} delay={i * 0.04} className={feature.span}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-6 transition-all hover:border-border hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.08)] sm:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors group-hover:border-emerald-500/40 group-hover:text-emerald-600">
                        <Icon className="size-4" />
                      </span>
                      <h3 className="text-base font-semibold tracking-tight text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-md border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {feature.tag}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {feature.bullets.map((b) => (
                      <li
                        key={b}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px] font-medium text-foreground/80"
                      >
                        <span className="size-1 rounded-full bg-emerald-500" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <FeatureVisual kind={feature.visual} />
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {MINI.map((m, i) => {
            const Icon = m.icon;
            return (
              <FadeIn key={m.title} delay={i * 0.05}>
                <div className="rounded-xl border border-border/70 bg-card p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold tracking-tight text-foreground">{m.title}</h4>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </NumberedSection>
  );
}

/* Mini visuals — refined, hairline, mono labels */

type StatusTone = "active" | "low" | "unused";

function StatusPill({ children, tone }: { children: React.ReactNode; tone: StatusTone }) {
  const cls = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    low: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    unused: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  }[tone];
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{children}</span>;
}

function FeatureVisual({ kind }: { kind?: string }) {
  switch (kind) {
    case "table":
      return (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-background">
          <div className="grid grid-cols-12 border-b border-border/70 bg-muted/30 px-3 py-1.5 label-mono">
            <div className="col-span-5">component</div>
            <div className="col-span-2 text-right">inst</div>
            <div className="col-span-2 text-right">files</div>
            <div className="col-span-3 text-right">status</div>
          </div>
          {[
            ["Button / Primary", "3,240", "38", "Active", "active"],
            ["Modal / Confirm", "612", "22", "Low", "low"],
            ["Toast / Success", "0", "0", "Unused", "unused"],
          ].map(([n, inst, f, s, tone]) => (
            <div key={n} className="grid grid-cols-12 items-center gap-1 border-b border-border/50 px-3 py-2 text-[11px] last:border-0">
              <div className="col-span-5 truncate font-medium text-foreground">{n}</div>
              <div className="col-span-2 text-right font-mono tabular-nums text-muted-foreground">{inst}</div>
              <div className="col-span-2 text-right font-mono tabular-nums text-muted-foreground">{f}</div>
              <div className="col-span-3 text-right"><StatusPill tone={tone as StatusTone}>{s}</StatusPill></div>
            </div>
          ))}
        </div>
      );
    case "detail":
      return (
        <div className="rounded-lg border border-border/70 bg-background p-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <div className="size-7 rounded-md border border-border/70 bg-muted/40" />
            <div>
              <div className="text-[11px] font-semibold text-foreground">Button / Primary</div>
              <div className="font-mono text-[9px] text-muted-foreground">set: actions · 3,240 instances · 38 files</div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center">
            {["Overview", "Files", "Trend"].map((t, i) => (
              <div key={t} className={`rounded-md px-2 py-1 text-[10px] font-medium ${i === 0 ? "bg-foreground text-background" : "border border-border/60 bg-background text-muted-foreground"}`}>{t}</div>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {[["Checkout Web", "412"], ["Onboarding Mobile", "288"], ["Settings v3", "176"]].map(([f, c]) => (
              <div key={f} className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-2 py-1.5 text-[11px]">
                <span className="text-foreground">{f}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "scan":
      return (
        <div className="rounded-lg border border-border/70 bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground">Scan #128 · all files</span>
            <span className="font-mono text-[10px] text-muted-foreground">37 / 42 · 88%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[88%] rounded-full bg-foreground" />
          </div>
          <div className="mt-2.5 space-y-1">
            <ScanRow name="Checkout Web" status="Success" tone="active" />
            <ScanRow name="Onboarding Mobile" status="Running" tone="low" />
            <ScanRow name="Legacy Admin" status="Failed" tone="unused" />
          </div>
        </div>
      );
    case "changes":
      return (
        <div className="rounded-lg border border-border/70 bg-background p-3">
          <div className="mb-2 label-mono">recent changes · #128 vs #127</div>
          <div className="space-y-1">
            <ChangeRow type="Newly used" name="Avatar / Stack" tone="active" />
            <ChangeRow type="Increased" name="Button / Primary" tone="active" />
            <ChangeRow type="Decreased" name="Modal / Confirm" tone="low" />
            <ChangeRow type="Removed" name="Toast / Info" tone="unused" />
          </div>
        </div>
      );
    case "insights":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <InsightCard label="Unused" value="38" tone="unused" />
          <InsightCard label="Low usage" value="24" tone="low" />
          <InsightCard label="Most used" value="Button / Primary" tone="active" />
          <InsightCard label="Stale files" value="6" tone="low" />
        </div>
      );
    default:
      return null;
  }
}

function ScanRow({ name, status, tone }: { name: string; status: string; tone: StatusTone }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-2 py-1.5 text-[11px]">
      <span className="text-foreground">{name}</span>
      <StatusPill tone={tone}>{status}</StatusPill>
    </div>
  );
}
function ChangeRow({ type, name, tone }: { type: string; name: string; tone: StatusTone }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-2 py-1.5 text-[11px]">
      <span className="text-foreground">{name}</span>
      <StatusPill tone={tone}>{type}</StatusPill>
    </div>
  );
}
function InsightCard({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  const cls = {
    active: "border-emerald-500/30 bg-emerald-50/40",
    low: "border-amber-500/30 bg-amber-50/40",
    unused: "border-rose-500/30 bg-rose-50/40",
  }[tone];
  return (
    <div className={`rounded-lg border ${cls} p-3`}>
      <div className="label-mono">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
