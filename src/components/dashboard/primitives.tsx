"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-0">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  tone = "default",
  index = 0,
}: {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "danger" | "success";
  index?: number;
}) {
  const toneColor =
    tone === "warn"
      ? "text-amber-600"
      : tone === "danger"
      ? "text-rose-600"
      : tone === "success"
      ? "text-emerald-600"
      : "text-foreground";

  const deltaColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
      ? "text-rose-600"
      : "text-muted-foreground";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        {Icon && (
          <span className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition-colors group-hover:border-emerald-500/40 group-hover:text-emerald-600">
            <Icon className="size-3.5" />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("text-2xl font-semibold tracking-tight tabular-nums", toneColor)}>
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono text-[11px] font-medium tabular-nums",
              deltaColor
            )}
          >
            <TrendIcon className="size-3" />
            {delta}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h4 className="mt-3 text-sm font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
