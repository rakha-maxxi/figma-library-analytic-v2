"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock3, Search, Table2, AlertTriangle } from "lucide-react";
import { NumberedSection, FadeIn } from "./primitives";

const PRINCIPLES = [
  { icon: ShieldCheck, title: "Honest about data scope", body: "Analytics are based on registered files only — never implies org-wide coverage.", quote: "Usage is calculated from registered Figma files that have been scanned." },
  { icon: Clock3, title: "Honest about freshness", body: "Every view shows the last scan timestamp. No pretending it's real-time.", quote: "Data reflects the latest successful scan, not real-time Figma activity." },
  { icon: Search, title: "Make investigation fast", body: "Search a component, click a row, see the files, open in Figma — in seconds.", quote: "From component to affected files in a few clicks." },
  { icon: Table2, title: "Tables over decorative charts", body: "MVP focuses on searchable tables and clear counts. Charts support trends, not vanity.", quote: "Dense, readable tables. Calm accents. No noise." },
  { icon: AlertTriangle, title: "Handle failure clearly", body: "When a scan fails, you always know which file, why, and what to do next.", quote: "Failed scans never corrupt previous data. Retry anytime." },
];

export function Principles() {
  return (
    <NumberedSection id="principles" index="05" eyebrow="UX principles" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            Opinions baked into every screen.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Inspired by Figma Library Analytics for the analytics model and
            Linear for interaction, density, and speed. Clean, compact, calm,
            data-first.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle, i) => {
            const Icon = principle.icon;
            return (
              <FadeIn key={principle.title} delay={i * 0.05}>
                <figure className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-6 transition-all hover:border-border hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-background text-emerald-700">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                      {principle.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
                  <blockquote className="mt-4 border-l-2 border-emerald-500/40 bg-muted/30 py-2 pl-3 pr-2 text-xs italic text-foreground/70">
                    “{principle.quote}”
                  </blockquote>
                </figure>
              </FadeIn>
            );
          })}

          <FadeIn delay={PRINCIPLES.length * 0.05}>
            <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-xl border border-border/70 bg-foreground p-6 text-background">
              <div className="text-4xl font-semibold leading-none tracking-[-0.03em]">
                Linear-fast.
              </div>
              <div className="mt-1 text-4xl font-semibold leading-none tracking-[-0.03em] text-background/70">
                Figma-fluent.
              </div>
              <p className="mt-4 text-sm text-background/60">
                Compact typography, subtle borders, minimal shadows, small
                status badges. An internal tool that feels modern — not a
                generic SaaS dashboard.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </NumberedSection>
  );
}
