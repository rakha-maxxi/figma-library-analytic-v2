"use client";

import { motion } from "framer-motion";
import { EyeOff, Hourglass, GitBranch, CalendarClock, ShieldQuestion } from "lucide-react";
import { NumberedSection, FadeIn } from "./primitives";

const PAIN_POINTS = [
  {
    icon: EyeOff,
    title: "No visibility into where components live",
    body: "Design Ops doesn't know which product files actually use a given component — opening each file by hand is the only option.",
  },
  {
    icon: Hourglass,
    title: "Manual audits eat the day",
    body: "Checking component adoption file-by-file is slow, error-prone, and impossible to repeat at scale as the file count grows.",
  },
  {
    icon: GitBranch,
    title: "Lifecycle decisions are gut, not data",
    body: "Cleanup, deprecation, and improvement happen on intuition. There's no usage signal to tell you what to retire or invest in.",
  },
  {
    icon: CalendarClock,
    title: "Changes over time are invisible",
    body: "Without snapshots, you can't tell whether adoption is rising or falling, or which components quietly disappeared from product files.",
  },
  {
    icon: ShieldQuestion,
    title: "Figma analytics isn't always available",
    body: "Library Analytics is gated by plan. Teams without it lose the only built-in way to see component adoption.",
  },
];

export function Problem() {
  return (
    <NumberedSection id="problem" index="01" eyebrow="The gap" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            You built the design system.{" "}
            <span className="text-muted-foreground/70">You just can't see who's using it.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            After the UI Kit ships, Design Ops hits a visibility wall. The
            questions are simple — the answers usually aren't.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border/70 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeIn key={p.title} delay={i * 0.04}>
                <div className="group h-full bg-card p-6 transition-colors hover:bg-accent/40">
                  <div className="flex items-start gap-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors group-hover:border-emerald-500/40 group-hover:text-emerald-600">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}

          <FadeIn delay={PAIN_POINTS.length * 0.04}>
            <div className="flex h-full flex-col justify-center bg-foreground p-6 text-background">
              <span className="label-mono text-background/50">the core question</span>
              <p className="mt-3 text-lg font-medium leading-snug tracking-tight">
                “Component from this design system — used in which files, how
                often, and how has it changed over time?”
              </p>
              <p className="mt-3 font-mono text-[11px] text-background/50">
                the one question atomisense is built to answer.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </NumberedSection>
  );
}
