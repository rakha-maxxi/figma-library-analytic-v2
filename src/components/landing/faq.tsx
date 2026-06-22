"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NumberedSection } from "./primitives";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "Does this replace Figma Library Analytics?", a: "No. Componently is a scoped tracker for registered Figma files based on scan history. It's a practical alternative for teams whose Figma plan doesn't include Library Analytics, or who want file-level tracking on top of it. It is not org-wide automatic analytics." },
  { q: "Is the data real-time?", a: "No. Data reflects the latest successful scan, not real-time Figma activity. Every dashboard view shows the last scan timestamp so freshness is always clear. You can run a new scan anytime to refresh." },
  { q: "Which files are included in usage data?", a: "Only the Figma files you register as consumer files. Files you haven't registered are not included. You're responsible for maintaining tracking coverage as your product surface grows." },
  { q: "How are 'unused' and 'low usage' defined?", a: "Unused means zero instances across all registered files in the latest successful scan. Low usage means below a configurable threshold. You can tune the threshold in Settings as your adoption matures." },
  { q: "What happens if a scan fails?", a: "Failed scans never corrupt previous data. The last successful result stays visible, the file is marked as failed with an actionable error message, and you can retry per file or scan-all again. Partial success still saves the files that succeeded." },
  { q: "Can it detect detached components?", a: "Not in the MVP. Usage is based on component instances that remain linked to the source component. Detached instance detection is on the future roadmap." },
  { q: "How many files and components can it handle?", a: "The MVP is designed for 1 source UI Kit, 10–100 registered files, hundreds to thousands of components, and thousands to tens of thousands of instances. Multiple scan histories are retained over time." },
  { q: "Does it edit my Figma files?", a: "Never. The product is read-only with respect to Figma. It only reads component instances to compute usage. It does not create, modify, or deprecate anything in your files." },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <NumberedSection id="faq" index="07" eyebrow="FAQ" className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            Questions, answered honestly.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            If something's unclear, the answer is usually &quot;it's scoped to
            registered files and the latest scan.&quot;
          </p>
        </div>

        <div className="mt-10 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-emerald-600"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </NumberedSection>
  );
}
