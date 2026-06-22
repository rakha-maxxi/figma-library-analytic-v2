"use client";

import { motion } from "framer-motion";
import { FileStack, Layers, Boxes, Clock } from "lucide-react";

const STATS = [
  { icon: Boxes, label: "Source UI Kit", value: "1", sub: "connected file" },
  { icon: FileStack, label: "Registered files", value: "10–100", sub: "tracked per workspace" },
  { icon: Layers, label: "Components tracked", value: "100s–1,000s", sub: "per source library" },
  { icon: Clock, label: "Scan history", value: "Unlimited", sub: "snapshots retained" },
];

export function StatsStrip() {
  return (
    <section aria-label="Scope at a glance" className="border-b border-border/70 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/70 bg-border/60 lg:grid-cols-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="bg-card p-5 sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-emerald-600" />
                  <span className="label-mono">{stat.label}</span>
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.sub}</div>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
          mvp scale per prd · scoped to registered figma files · data is snapshot-based, not real-time
        </p>
      </div>
    </section>
  );
}
