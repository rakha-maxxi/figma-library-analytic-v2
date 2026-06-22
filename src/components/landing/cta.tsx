"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST = ["Scoped to registered files", "Snapshot-based history", "Read-only — never edits Figma", "Light & dark mode"];

export function Cta() {
  return (
    <section id="cta" aria-labelledby="cta-heading" className="relative overflow-hidden border-t border-border/70 py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <svg width="100%" height="100%" className="text-foreground/[0.035]">
          <defs>
            <pattern id="cta-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-foreground p-8 text-center text-background shadow-xl sm:p-12"
        >
          <span className="inline-flex items-center gap-1.5 rounded-md border border-background/20 bg-background/10 px-2.5 py-1 font-mono text-[11px] font-medium text-background/80">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            ready when you are
          </span>

          <h2
            id="cta-heading"
            className="mt-5 text-balance text-3xl font-semibold tracking-[-0.025em] text-background sm:text-4xl lg:text-5xl"
          >
            Stop auditing components by hand.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-background/60 sm:text-lg">
            Register your source UI Kit, add your product files, run your first
            scan — and see exactly where your design system lives across Figma.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="group h-11 gap-1.5 rounded-md bg-background px-7 text-[15px] font-medium text-foreground hover:bg-background/90"
            >
              <Link href="/login?next=/dashboard">
                Open the dashboard
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="h-11 gap-1.5 rounded-md px-7 text-[15px] font-medium text-background hover:bg-background/10"
            >
              <Link href="#features">Explore features</Link>
            </Button>
          </div>

          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-background/50">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-3 text-emerald-400" />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
