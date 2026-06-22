"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  XCircle,
  Inbox,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { useScanNotifications, type ScanNotification } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/**
 * Bell icon in the dashboard topbar.
 * - Subscribes to scan results via `useScanNotifications`.
 * - Shows a badge for unread notifications.
 * - Opens a popover with the recent notification history.
 */
export function NotificationsBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, clear } = useScanNotifications(
    user?.workspaceId ?? null
  );

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-background"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[360px] gap-0 p-0"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
          <div>
            <div className="label-mono">notifications</div>
            <div className="text-[11px] text-muted-foreground">
              Scan status updates
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto scroll-slim">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <span className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-muted-foreground">
                <Inbox className="size-4" />
              </span>
              <p className="text-xs text-muted-foreground">
                No scan notifications yet. Start a scan to see updates here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} />
              ))}
            </ul>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/70 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3" />
              all caught up
            </span>
            <span className="font-mono">{notifications.length} total</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({ notification }: { notification: ScanNotification }) {
  const isSuccess = notification.kind === "success";
  return (
    <li className="flex gap-2.5 px-3 py-2.5">
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
          isSuccess
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-rose-500/10 text-rose-600"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <XCircle className="size-3.5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm font-medium text-foreground">
            {notification.label} {isSuccess ? "completed" : "failed"}
          </div>
          <div className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {formatTimeAgo(notification.createdAt)}
          </div>
        </div>
        <div className="truncate font-mono text-[10px] text-muted-foreground">
          {notification.target} ·{" "}
          {notification.scope === "all" ? "All files" : "Single file"}
        </div>
        <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
          {notification.message}
        </div>
      </div>
    </li>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
