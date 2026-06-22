"use client";

import { motion } from "framer-motion";
import { Boxes, FilePlus2, Radar, LineChart, ArrowRight } from "lucide-react";
import { NumberedSection, FadeIn, MonoTag } from "./primitives";

const STEPS = [
  { n: "01", icon: Boxes, title: "Register source UI Kit", body: "Paste a Figma file link. We validate it, pull the component inventory, and lock it in as the source of truth.", detail: "source ui kit · 1 file · swap anytime" },
  { n: "02", icon: FilePlus2, title: "Register consumer files", body: "Add the product or design files you want to track. One link or many — invalid links are flagged up front.", detail: "10–100 files typical for mvp" },
  { n: "03", icon: Radar, title: "Run a scan", body: "Trigger scan-all or rescan a single file. Watch pending → running → success / failed in real time, without leaving the dashboard.", detail: "snapshots saved automatically" },
  { n: "04", icon: LineChart, title: "Analyze usage & changes", body: "See total instances, files used, status, and last seen. Compare the latest scan with the previous one to catch newly used, increased, decreased, and removed components.", detail: "decisions backed by scan history" },
];

export function HowItWorks() {
  return (
    <NumberedSection id="how-it-works" index="03" eyebrow="How it works" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            From zero to first scan in{" "}
            <span className="text-muted-foreground/70">four steps.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Onboarding is intentionally small. Connect Figma, register your
            source library, add the files you care about, and scan. The
            dashboard does the rest.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <FadeIn key={step.n} delay={i * 0.06}>
                <li className="group relative flex h-full flex-col rounded-xl border border-border/70 bg-card p-6 transition-all hover:border-border hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-mono text-2xl font-semibold tabular-nums text-muted-foreground/30 transition-colors group-hover:text-emerald-500/60">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 font-mono text-[10px] text-muted-foreground">
                    <span className="size-1 rounded-full bg-emerald-500" />
                    {step.detail}
                  </div>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-muted-foreground/40 lg:block">
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </li>
              </FadeIn>
            );
          })}
        </ol>

        <FadeIn>
          <div className="mt-6 rounded-xl border border-dashed border-border/70 bg-muted/20 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 font-mono text-xs font-semibold text-emerald-700">
                  i
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    Honest about scope and freshness
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Data only comes from registered files, reflects the latest
                    successful scan, and is not real-time. We say so plainly,
                    everywhere it matters.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <MonoTag tone="emerald">registered files only</MonoTag>
                <MonoTag>latest scan result</MonoTag>
                <MonoTag>snapshot-based</MonoTag>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </NumberedSection>
  );
}
