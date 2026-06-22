"use client";

import { motion } from "framer-motion";
import { Wrench, PenTool, ClipboardList } from "lucide-react";
import { NumberedSection, FadeIn } from "./primitives";

const PERSONAS = [
  {
    icon: Wrench,
    role: "Design Ops",
    title: "Design System Designer",
    tagline: "Maintains the UI Kit",
    primary: true,
    pains: ["Doesn't know which files use a component", "Audits usage by opening files manually", "Can't base lifecycle decisions on data"],
    needs: ["Usage dashboard", "Search & filter components", "Scan history & change detection"],
  },
  {
    icon: PenTool,
    role: "Product Designer",
    title: "UI/UX Designer",
    tagline: "Consumes the system",
    primary: false,
    pains: ["Unsure if their file is tracked", "No feedback on adoption quality"],
    needs: ["Visibility into their file's usage", "Help Design Ops keep things consistent"],
  },
  {
    icon: ClipboardList,
    role: "Design Lead",
    title: "Design Manager",
    tagline: "Oversees adoption",
    primary: false,
    pains: ["No overview of design system adoption", "Hard to prioritize improvement work"],
    needs: ["Adoption overview", "File-level health", "Roadmap insights"],
  },
];

export function Personas() {
  return (
    <NumberedSection id="personas" index="04" eyebrow="Who it's for" className="bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            Built around the people who{" "}
            <span className="text-muted-foreground/70">own adoption.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            The primary user is Design Ops. Product Designers and Design Leads
            get a clear read-only view of how the system is being used.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PERSONAS.map((persona, i) => {
            const Icon = persona.icon;
            return (
              <FadeIn key={persona.role} delay={i * 0.06}>
                <article
                  className={[
                    "relative flex h-full flex-col rounded-xl border bg-card p-6 transition-all hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.08)] sm:p-7",
                    persona.primary ? "border-emerald-500/40 ring-1 ring-emerald-500/15" : "border-border/70",
                  ].join(" ")}
                >
                  {persona.primary && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      primary
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground">
                      <Icon className="size-4.5" />
                    </span>
                    <div>
                      <div className="label-mono">{persona.role}</div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                        {persona.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{persona.tagline}</p>

                  <div className="mt-5 border-t border-border/60 pt-4">
                    <h4 className="label-mono text-rose-600/80">pain points</h4>
                    <ul className="mt-2 space-y-1.5">
                      {persona.pains.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-rose-400" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-border/60 pt-4">
                    <h4 className="label-mono text-emerald-700">needs</h4>
                    <ul className="mt-2 space-y-1.5">
                      {persona.needs.map((n) => (
                        <li key={n} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-500" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </NumberedSection>
  );
}
