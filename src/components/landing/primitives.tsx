"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Editorial spec-sheet primitives — the unique signature of the redesign.
 * Numbered sections, mono labels, hairline rules, tight DM Sans headlines.
 */

export function SectionHeader({
  index,
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  className,
}: {
  index?: string; // e.g. "01"
  eyebrow: string;
  title: React.ReactNode;
  highlight?: React.ReactNode; // muted portion of title
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5",
          align === "center" ? "justify-center" : "justify-start"
        )}
      >
        {index && (
          <span className="label-mono-emerald flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500" />
            {index}
          </span>
        )}
        <span className="label-mono">{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
        {title} {highlight && <span className="text-muted-foreground/70">{highlight}</span>}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base",
            align === "center" ? "mx-auto max-w-xl" : "max-w-xl"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Numbered section wrapper with a hairline top rule */
export function NumberedSection({
  id,
  index,
  eyebrow,
  children,
  className,
}: {
  id?: string;
  index: string;
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative border-t border-border/70", className)}
    >
      {/* Section rail — number + label fixed to top-left on desktop */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-4">
          <span className="label-mono-emerald flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500" />
            {index}
          </span>
          <span className="label-mono">{eyebrow}</span>
          <span className="h-px flex-1 bg-border/70" />
        </div>
        {children}
      </div>
    </section>
  );
}

export function FadeIn({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A small inline mono tag with a leading dot — used for metadata */
export function MonoTag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "emerald";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide",
        tone === "emerald" ? "text-emerald-700" : "text-muted-foreground",
        className
      )}
    >
      <span
        className={cn(
          "size-1 rounded-full",
          tone === "emerald" ? "bg-emerald-500" : "bg-muted-foreground/60"
        )}
      />
      {children}
    </span>
  );
}
