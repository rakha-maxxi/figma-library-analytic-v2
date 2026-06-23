"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { OverviewPage } from "./pages/overview-page";
import { ComponentsPage } from "./pages/components-page";
import { FilesPage } from "./pages/files-page";
import { ScansPage } from "./pages/scans-page";
import { InsightsPage } from "./pages/insights-page";
import { SettingsPage } from "./pages/settings-page";
import type { DashboardPage } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function DashboardShell({ page }: { page: DashboardPage }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <DashboardSidebar page={page} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-in slide-in-from-left duration-200">
            <DashboardSidebar page={page} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile menu button row */}
        <div className="flex h-12 items-center gap-2 border-b border-border/60 px-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                <rect x="3" y="3" width="8" height="8" rx="1.5" />
                <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
                <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
                <rect x="13" y="13" width="8" height="8" rx="1.5" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-foreground">Atomisense</span>
          </div>
        </div>

        <DashboardTopbar page={page} />

        <main className="flex-1 overflow-y-auto">
          <div className={cn("mx-auto w-full max-w-7xl p-4 sm:p-6")}>
            {page === "overview" && <OverviewPage />}
            {page === "components" && <ComponentsPage />}
            {page === "files" && <FilesPage />}
            {page === "scans" && <ScansPage />}
            {page === "insights" && <InsightsPage />}
            {page === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}
