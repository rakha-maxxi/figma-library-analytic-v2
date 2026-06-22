"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Who it's for", href: "#personas" },
  { label: "Scope", href: "#scope" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-background"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Componently home">
          <span className="relative flex size-7 items-center justify-center rounded-md bg-foreground text-background">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Componently
            </span>
            <span className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
              v1.0
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            <Link href="#how-it-works">Docs</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="h-8 gap-1.5 rounded-md bg-foreground px-3.5 text-[13px] font-medium text-background hover:bg-foreground/90"
          >
            <Link href="/login?next=/dashboard">
              Open dashboard
              <span aria-hidden className="text-emerald-500">→</span>
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/70 bg-background md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3 sm:px-6" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border/70 pt-3">
                <Button variant="outline" size="sm" asChild className="h-9">
                  <Link href="#how-it-works" onClick={() => setOpen(false)}>
                    Read docs
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="h-9 bg-foreground text-background hover:bg-foreground/90"
                >
                  <Link href="/login?next=/dashboard" onClick={() => setOpen(false)}>
                    Open dashboard
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
