"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const FOOTER_LINKS = [
  { title: "Product", links: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Scope", href: "#scope" },
    { label: "FAQ", href: "#faq" },
  ]},
  { title: "Use cases", links: [
    { label: "Design Ops", href: "#personas" },
    { label: "Product Designers", href: "#personas" },
    { label: "Design Leads", href: "#personas" },
    { label: "Governance", href: "#features" },
  ]},
  { title: "Resources", links: [
    { label: "Onboarding", href: "#how-it-works" },
    { label: "Principles", href: "#top" },
    { label: "Insights", href: "#features" },
    { label: "Changelog", href: "#scope" },
  ]},
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="#top" className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <rect x="3" y="3" width="8" height="8" rx="1.5" />
                  <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
                  <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
                  <rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-semibold tracking-tight text-foreground">Componently</span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">v1.0</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              An internal Design Ops dashboard that tracks design system
              component usage across registered Figma files based on scan
              history.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="#top" label="GitHub"><Github className="size-4" /></SocialLink>
              <SocialLink href="#top" label="Twitter"><Twitter className="size-4" /></SocialLink>
              <SocialLink href="#top" label="LinkedIn"><Linkedin className="size-4" /></SocialLink>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h3 className="label-mono">{col.title}</h3>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-lg border border-border/60 bg-muted/20 p-4">
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">data scope:</span>{" "}
            usage is calculated from registered figma files that have been
            scanned. data reflects the latest successful scan, not real-time
            figma activity.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} componently. built for design ops.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <Link href="#top" className="hover:text-foreground">privacy</Link>
            <Link href="#top" className="hover:text-foreground">terms</Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              all systems normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
    >
      {children}
    </a>
  );
}
