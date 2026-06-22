"use client";

import * as React from "react";
import {
  LayoutDashboard,
  FileStack,
  ScanLine,
  Lightbulb,
  Settings,
  ChevronLeft,
  Boxes,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardPage } from "@/lib/dashboard";
import { useOverview, useSourceUiKit } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";
import { useAuth } from "@/components/auth/auth-provider";

const NAV: {
  id: DashboardPage;
  label: string;
  icon: typeof LayoutDashboard;
  badgeKey?: "totalComponents" | "registeredFiles" | "unusedComponents";
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "components", label: "Components", icon: Boxes, badgeKey: "totalComponents" },
  { id: "files", label: "Files", icon: FileStack, badgeKey: "registeredFiles" },
  { id: "scans", label: "Scans", icon: ScanLine },
  { id: "insights", label: "Insights", icon: Lightbulb, badgeKey: "unusedComponents" },
  { id: "settings", label: "Settings", icon: Settings },
];

function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-7 items-center justify-center rounded-md bg-foreground text-background", className)}>
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    </span>
  );
}

export function DashboardSidebar({ page }: { page: DashboardPage }) {
  const { data: overview } = useOverview();
  const { data: kit } = useSourceUiKit();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/70 bg-card/40 lg:w-60">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-border/70 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to landing page"
        >
          <LogoMark />
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Componently
            </span>
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              v1.0
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Dashboard">
        <div className="label-mono px-2 pb-1 pt-1 opacity-70">workspace</div>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <Link
              key={item.id}
              href={`/dashboard/${item.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badgeKey && overview && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums",
                    active
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {String(overview[item.badgeKey])}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Source UI Kit card */}
      <div className="border-t border-border/70 p-3">
        <div className="rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 label-mono">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            source ui kit
          </div>
          <div className="mt-1.5 truncate text-xs font-medium text-foreground" title={kit?.fileName}>
            {kit ? kit.fileName : "No source UI Kit"}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {kit ? `${kit.componentCount} components · ${formatRelative(kit.lastSyncedAt)}` : "not connected"}
          </div>
        </div>
        <Link
          href="/"
          className="mt-2 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          back to landing
        </Link>
        <div className="mt-2 flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
          <div className="min-w-0">
            <div className="truncate text-[10px] font-medium text-foreground" title={user?.email}>
              {user?.email ?? "Signed in"}
            </div>
            <div
              className="truncate font-mono text-[9px] text-muted-foreground"
              title={user?.workspaceName}
            >
              {user?.workspaceName ?? "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout().then(() => window.location.assign("/"))}
            className="ml-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
