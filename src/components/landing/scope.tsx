"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, CalendarClock } from "lucide-react";
import { NumberedSection, FadeIn } from "./primitives";

const IN_SCOPE = [
  "Source UI Kit registration", "Component inventory & refresh", "Registered files management",
  "Manual scan (all + per file)", "Component usage table", "Component detail with files used",
  "File-level usage summary", "Scan history & snapshots",
  "Change detection (new / increased / decreased / removed)",
  "Insights: unused, low usage, most used, stale, failed",
  "Search, filter, sort", "Empty, loading, error & rate-limit states",
];

const OUT_SCOPE = [
  "Auto-discovery of all company files", "Full 1:1 replacement of Figma Library Analytics",
  "Real-time tracking while editing", "Org-wide automatic analytics",
  "Modifying or creating Figma files", "AI agent crawling or recommendations",
  "Slack / Jira / Linear integrations (MVP)", "Complex role-based access control (MVP)",
  "Advanced design linting", "Visual design diff", "Full detached component analysis",
];

export function Scope() {
  return (
    <NumberedSection id="scope" index="06" eyebrow="Scope & milestones" className="bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            A scoped, buildable tracker —{" "}
            <span className="text-muted-foreground/70">not a silver bullet.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            The MVP stays focused. Here's what's in, what's out, and the
            milestone path from foundation to polish.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <FadeIn>
            <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-card">
              <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-50/40 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                    <Check className="size-4" />
                  </span>
                  <h3 className="text-[15px] font-semibold tracking-tight text-foreground">In scope — MVP</h3>
                </div>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                  {IN_SCOPE.length} capabilities
                </span>
              </div>
              <ul className="grid gap-x-6 gap-y-2.5 p-6 sm:grid-cols-2">
                {IN_SCOPE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <X className="size-4" />
                  </span>
                  <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Out of scope — MVP</h3>
                </div>
                <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                  future phases
                </span>
              </div>
              <ul className="grid gap-x-6 gap-y-2.5 p-6 sm:grid-cols-2">
                {OUT_SCOPE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* Milestones */}
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <CalendarClock className="size-4 text-emerald-600" />
            Milestone roadmap
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Milestone n="M1" title="MVP Foundation" body="Source UI Kit, registered files, manual scan, component & file usage." state="Shipped" />
            <Milestone n="M2" title="Snapshot & Change" body="Save snapshots, compare scans, detect new / increased / decreased / removed." state="In progress" />
            <Milestone n="M3" title="Insights & Governance" body="Unused, low usage, most used, stale files, failed scans, thresholds." state="Next" />
            <Milestone n="M4" title="Experience Polish" body="Filters, search, detail drawer, empty/loading/error states, dark mode." state="Planned" />
          </div>
        </div>

        <FadeIn>
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-border/70 bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Future opportunities</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled scans, weekly reports, Slack notifications, CSV
                  export, Figma plugin, adoption score, detached component
                  detection, multi-source UI Kit support.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </NumberedSection>
  );
}

function Milestone({ n, title, body, state }: { n: string; title: string; body: string; state: "Shipped" | "In progress" | "Next" | "Planned" }) {
  const stateCls = {
    Shipped: "bg-emerald-100 text-emerald-700",
    "In progress": "bg-amber-100 text-amber-700",
    Next: "bg-sky-100 text-sky-700",
    Planned: "bg-muted text-muted-foreground",
  }[state];
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-muted-foreground">{n}</span>
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${stateCls}`}>{state}</span>
      </div>
      <h4 className="mt-2 text-sm font-semibold tracking-tight text-foreground">{title}</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
