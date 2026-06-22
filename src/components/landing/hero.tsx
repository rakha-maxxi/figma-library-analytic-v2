"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonoTag } from "./primitives";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border/70" aria-labelledby="hero-heading">
      {/* Subtle dot grid — faint, only here */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <svg width="100%" height="100%" className="text-foreground/[0.04]">
          <defs>
            <pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        {/* Status line */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-2"
        >
          <MonoTag tone="emerald">live · v1.0</MonoTag>
          <MonoTag>design ops dashboard</MonoTag>
          <MonoTag>figma-tracked</MonoTag>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="mt-7 max-w-4xl text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-7xl"
        >
          See where every
          <br className="hidden sm:block" />{" "}
          component{" "}
          <span className="relative inline-block">
            <span className="relative z-10">lives.</span>
            <svg
              aria-hidden
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 h-2.5 w-full text-emerald-500"
            >
              <path d="M2 10 C 60 3, 140 3, 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Componently tracks design system component usage across your registered
          Figma files — based on scan history. So Design Ops can stop opening
          files one by one and start making cleanup, deprecation, and adoption
          decisions from real data.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.18 }}
          className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
        >
          <Button
            size="lg"
            asChild
            className="group h-11 gap-1.5 rounded-md bg-foreground px-5 text-[15px] font-medium text-background hover:bg-foreground/90"
          >
            <Link href="/login?next=/dashboard">
              Start tracking
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            asChild
            className="group h-11 gap-1.5 rounded-md px-5 text-[15px] font-medium text-foreground hover:bg-accent"
          >
            <Link href="#how-it-works">
              See how it works
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
        </motion.div>

        {/* Meta line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500" /> no credit card
          </span>
          <span className="hidden sm:inline text-border">/</span>
          <span>built for figma teams</span>
          <span className="hidden sm:inline text-border">/</span>
          <span>scoped to registered files</span>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.32 }}
          className="relative mt-14"
        >
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Product preview — clean framed data view, hairline borders, mono labels    */
/* -------------------------------------------------------------------------- */

function ProductPreview() {
  return (
    <div className="relative">
      {/* Frame */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(0,0,0,0.08)]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-foreground/15" />
            <span className="size-2 rounded-full bg-foreground/15" />
            <span className="size-2 rounded-full bg-foreground/15" />
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            componently.app / overview
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">scan #128</div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12">
          {/* Sidebar */}
          <aside className="col-span-3 hidden border-r border-border/70 bg-muted/20 p-3 sm:block">
            <div className="flex items-center gap-2 px-1.5 pb-3">
              <span className="flex size-5 items-center justify-center rounded bg-foreground text-background">
                <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-foreground">Componently</span>
            </div>
            <nav className="space-y-0.5 text-[12px]">
              <NavRow label="Overview" active />
              <NavRow label="Components" badge="248" />
              <NavRow label="Files" badge="42" />
              <NavRow label="Scans" />
              <NavRow label="Insights" badge="38" />
              <NavRow label="Settings" />
            </nav>
          </aside>

          {/* Main */}
          <div className="col-span-12 sm:col-span-9">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div>
                <div className="label-mono">overview</div>
                <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                  Design system usage
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-1.5 rounded-md border border-border/70 bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground sm:flex">
                  search
                  <kbd className="ml-1 rounded border border-border/60 bg-muted px-1 text-[9px]">⌘K</kbd>
                </div>
                <button className="inline-flex h-7 items-center gap-1 rounded-md bg-foreground px-2.5 text-[11px] font-medium text-background">
                  scan all
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-px bg-border/60 lg:grid-cols-4">
              <Metric label="components" value="248" delta="+6" tone="up" />
              <Metric label="files" value="42" delta="+2" tone="up" />
              <Metric label="instances" value="14,820" delta="+312" tone="up" />
              <Metric label="unused" value="38" delta="-4" tone="down" />
            </div>

            {/* Component table */}
            <div className="border-t border-border/60">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="label-mono">component usage</span>
                <span className="font-mono text-[10px] text-muted-foreground">5 of 248</span>
              </div>
              <div className="divide-y divide-border/60 border-t border-border/60 text-[12px]">
                <Row name="Button / Primary" set="Actions" inst="3,240" files="38" status="Active" tone="active" delta="+42" trend="up" />
                <Row name="Input / Text" set="Forms" inst="2,812" files="36" status="Active" tone="active" delta="+18" trend="up" />
                <Row name="Card / Container" set="Layout" inst="2,210" files="34" status="Active" tone="active" delta="+30" trend="up" />
                <Row name="Modal / Confirm" set="Overlay" inst="612" files="22" status="Low" tone="low" delta="-6" trend="down" />
                <Row name="Toast / Success" set="Feedback" inst="0" files="0" status="Unused" tone="unused" delta="0" trend="flat" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating annotation — the unique signature touch */}
      <div className="absolute -right-3 top-1/3 hidden -translate-y-1/2 translate-x-full lg:block">
        <div className="flex items-center gap-2">
          <svg width="40" height="2" className="text-emerald-500">
            <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
          <div className="whitespace-nowrap rounded-md border border-border bg-background px-2.5 py-1.5 shadow-sm">
            <div className="label-mono-emerald">scan-based</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">not real-time</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavRow({ label, active, badge }: { label: string; active?: boolean; badge?: string }) {
  return (
    <div
      className={[
        "flex items-center justify-between rounded-md px-2 py-1.5",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      ].join(" ")}
    >
      <span className="font-medium">{label}</span>
      {badge && (
        <span
          className={[
            "rounded px-1.5 py-0.5 font-mono text-[9px] font-medium",
            active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function Metric({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "up" | "down" }) {
  return (
    <div className="bg-card p-3.5">
      <div className="label-mono">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-xl font-semibold tracking-tight tabular-nums text-foreground">{value}</span>
        <span
          className={[
            "font-mono text-[10px] font-medium tabular-nums",
            tone === "up" ? "text-emerald-600" : "text-rose-600",
          ].join(" ")}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

function Row({
  name,
  set,
  inst,
  files,
  status,
  tone,
  delta,
  trend,
}: {
  name: string;
  set: string;
  inst: string;
  files: string;
  status: string;
  tone: "active" | "low" | "unused";
  delta: string;
  trend: "up" | "down" | "flat";
}) {
  const toneCls = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    low: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    unused: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  }[tone];
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-muted-foreground";

  return (
    <div className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 hover:bg-muted/30">
      <div className="col-span-5 flex items-center gap-2.5 sm:col-span-4">
        <div className="size-5 rounded border border-border/70 bg-muted/40" />
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{name}</div>
          <div className="truncate font-mono text-[10px] text-muted-foreground">{set}</div>
        </div>
      </div>
      <div className="col-span-2 hidden text-right font-mono tabular-nums text-foreground sm:block">{inst}</div>
      <div className="col-span-2 hidden text-right font-mono tabular-nums text-muted-foreground sm:block">{files}</div>
      <div className="col-span-4 sm:col-span-2">
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${toneCls}`}>
          {status}
        </span>
      </div>
      <div className={`col-span-3 text-right font-mono text-[11px] tabular-nums sm:col-span-2 ${trendColor}`}>
        {delta}
      </div>
    </div>
  );
}
