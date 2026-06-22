"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoadingRows({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border border-border/60 bg-card p-3"
        >
          <div className="size-7 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/5 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function LoadingGrid({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl border border-border/70 bg-card" />
      ))}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-50/50 p-4">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
      <div className="flex-1">
        <div className="text-sm font-semibold text-rose-700">Couldn't load data</div>
        <p className="mt-0.5 text-xs text-rose-700/80">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="h-7 gap-1.5">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />;
}
