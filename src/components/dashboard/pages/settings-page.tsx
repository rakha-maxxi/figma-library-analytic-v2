"use client";

import * as React from "react";
import {
  Check,
  KeyRound,
  Boxes,
  Sliders,
  ScanLine,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { PageHeader } from "../primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSettings,
  useUpdateSettings,
  useSourceUiKit,
  useOverview,
  useRefreshSourceUiKit,
  useReplaceFigmaToken,
  useDisconnectFigma,
  useReplaceSourceUiKit,
} from "@/lib/api-client";
import { formatRelative, formatDateTime } from "@/lib/format";
import { LoadingRows, ErrorBanner } from "../loading-states";
import { toast } from "sonner";

export function SettingsPage() {
  const { data: settings, isLoading, isError, error, refetch } = useSettings();
  const { data: kit } = useSourceUiKit();
  const { data: overview } = useOverview();
  const updateSettings = useUpdateSettings();
  const refreshKit = useRefreshSourceUiKit();
  const replaceToken = useReplaceFigmaToken();
  const disconnectFigma = useDisconnectFigma();
  const replaceKit = useReplaceSourceUiKit();

  const [tokenDialogOpen, setTokenDialogOpen] = React.useState(false);
  const [kitDialogOpen, setKitDialogOpen] = React.useState(false);

  const lowThreshold = settings?.lowUsageThreshold ?? 500;
  const staleDays = settings?.staleDaysThreshold ?? 7;
  const autoScan = settings?.autoScanEnabled ?? false;
  const preserve = settings?.preserveOnFailure ?? true;

  const handleUpdate = (patch: Parameters<typeof updateSettings.mutate>[0]) => {
    updateSettings.mutate(patch, {
      onError: (err) => toast.error("Failed to save", { description: err.message }),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Figma access, source UI Kit, and usage thresholds."
      />

      {isLoading && <LoadingRows count={4} />}
      {isError && <ErrorBanner message={error?.message ?? "Failed to load settings"} onRetry={() => refetch()} />}

      {settings && (
        <>

      {/* Figma access */}
      <SettingsSection
        icon={KeyRound}
        title="Figma access"
        description="The connected account used to read registered files."
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {settings.figmaConnected ? (
              <span className="flex size-9 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-50 text-emerald-600">
                <Check className="size-4" />
              </span>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-md border border-amber-500/30 bg-amber-50 text-amber-600">
                <AlertTriangle className="size-4" />
              </span>
            )}
            <div>
              <div className="text-sm font-medium text-foreground">
                Personal access token {settings.figmaConnected ? "connected" : "not connected"}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {settings.figmaConnected
                  ? `${settings.figmaTokenHint || "figma_pat_••••"} · never expires`
                  : "scans cannot run until a token is connected"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.figmaConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setTokenDialogOpen(true)}
                >
                  Replace token
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  disabled={disconnectFigma.isPending}
                  onClick={() => {
                    disconnectFigma.mutate(undefined, {
                      onSuccess: () => toast.success("Figma token disconnected"),
                      onError: (err) => toast.error("Failed to disconnect", { description: err.message }),
                    });
                  }}
                >
                  {disconnectFigma.isPending ? "Disconnecting…" : "Disconnect"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="h-8 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => setTokenDialogOpen(true)}
              >
                Connect token
              </Button>
            )}
          </div>
        </div>
        <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
          sensitive credentials are stored securely and never exposed in the frontend. only files accessible by this account can be scanned.
        </div>
      </SettingsSection>

      {/* Source UI Kit */}
      <SettingsSection
        icon={Boxes}
        title="Source UI Kit"
        description="The design system file whose components are tracked."
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
                <Boxes className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{kit?.fileName ?? "No source UI Kit registered"}</div>
                {kit && (
                  <a href={kit.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 hover:underline">
                    figma file key: {kit.figmaFileKey}
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refreshKit.mutate()} disabled={refreshKit.isPending || !kit} className="h-8 gap-1.5">
                <RefreshCw className="size-3.5" />
                {refreshKit.isPending ? "Importing…" : "Refresh from Figma"}
              </Button>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setKitDialogOpen(true)}>Replace</Button>
            </div>
          </div>
          {kit && (
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-4">
              <SettingStat label="components" value={String(kit.componentCount)} />
              <SettingStat label="connected" value={formatRelative(kit.connectedAt)} />
              <SettingStat label="last synced" value={formatRelative(kit.lastSyncedAt)} />
              <SettingStat label="file key" value={kit.figmaFileKey} mono />
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Usage thresholds */}
      <SettingsSection
        icon={Sliders}
        title="Usage thresholds"
        description="Tune what counts as low usage and stale data."
      >
        <div className="divide-y divide-border/60">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">Low usage threshold</div>
              <div className="text-xs text-muted-foreground">Components below this instance count are flagged "Low Usage".</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={lowThreshold}
                onChange={(e) => handleUpdate({ lowUsageThreshold: Number(e.target.value) })}
                className="w-40 accent-emerald-600"
                aria-label="Low usage threshold"
              />
              <span className="w-20 text-right font-mono text-sm tabular-nums text-foreground">{lowThreshold}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">Stale file threshold</div>
              <div className="text-xs text-muted-foreground">Files not scanned within this many days are flagged "Stale".</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={staleDays}
                onChange={(e) => handleUpdate({ staleDaysThreshold: Number(e.target.value) })}
                className="w-40 accent-emerald-600"
                aria-label="Stale days threshold"
              />
              <span className="w-20 text-right font-mono text-sm tabular-nums text-foreground">{staleDays}d</span>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Scan configuration */}
      <SettingsSection
        icon={ScanLine}
        title="Scan configuration"
        description="When and how scans run."
      >
        <div className="divide-y divide-border/60">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">Scheduled auto-scan</div>
              <div className="text-xs text-muted-foreground">Automatically run a scan-all on a schedule. Disabled in MVP.</div>
            </div>
            <Switch checked={autoScan} onCheckedChange={(v) => handleUpdate({ autoScanEnabled: v })} aria-label="Scheduled auto-scan" />
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">Preserve previous data on failure</div>
              <div className="text-xs text-muted-foreground">Keep the last successful result visible if a new scan fails. Always on.</div>
            </div>
            <Switch checked={preserve} onCheckedChange={(v) => handleUpdate({ preserveOnFailure: v })} aria-label="Preserve on failure" />
          </div>
        </div>
      </SettingsSection>

      {/* Data freshness */}
      <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3.5 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
        <div>
          <div className="font-medium text-foreground">Data freshness</div>
          <p className="mt-0.5">
            All analytics reflect the latest successful scan{overview?.lastScanLabel ? ` (${overview.lastScanLabel}, ${formatDateTime(overview.lastScanAt)})` : ""},
            not real-time Figma activity. Run a new scan anytime to refresh.
          </p>
        </div>
      </div>

      <ReplaceTokenDialog
        open={tokenDialogOpen}
        onOpenChange={setTokenDialogOpen}
        isReplacing={replaceToken.isPending}
        onSubmit={(token) => {
          replaceToken.mutate(token, {
            onSuccess: () => {
              toast.success("Figma token updated", { description: "Scans can now read your registered files." });
              setTokenDialogOpen(false);
            },
            onError: (err) => toast.error("Failed to update token", { description: err.message }),
          });
        }}
      />

      <ReplaceSourceUiKitDialog
        open={kitDialogOpen}
        onOpenChange={setKitDialogOpen}
        currentFileName={kit?.fileName}
        isReplacing={replaceKit.isPending}
        onSubmit={(input) => {
          replaceKit.mutate(input, {
            onSuccess: () => {
              toast.success("Source UI Kit imported", { description: "Components were scanned from the Figma file and saved to your workspace." });
              setKitDialogOpen(false);
            },
            onError: (err) => toast.error("Failed to replace source UI Kit", { description: err.message }),
          });
        }}
      />
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-card p-3">
      <div className="label-mono">{label}</div>
      <div className={`mt-0.5 truncate text-sm font-medium text-foreground ${mono ? "font-mono text-[11px]" : ""}`} title={value}>
        {value}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Replace Figma token dialog                                                 */
/* -------------------------------------------------------------------------- */

function ReplaceTokenDialog({
  open,
  onOpenChange,
  isReplacing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isReplacing: boolean;
  onSubmit: (token: string) => void;
}) {
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setToken("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (t.length < 8) {
      setError("Token must be at least 8 characters.");
      return;
    }
    onSubmit(t);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replace Figma token</DialogTitle>
          <DialogDescription>
            Paste a new Figma personal access token. This replaces the current
            token immediately. Only the masked hint is stored.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-mono mb-1.5 block">personal access token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError("");
              }}
              placeholder="figd_••••••••••••••••"
              autoFocus
              className="h-9 w-full rounded-md border border-border/70 bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
              generate a token at figma → settings → security → personal access tokens.
              the token is never exposed in the frontend — only a masked hint is persisted.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isReplacing}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {isReplacing ? "Saving…" : "Save token"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Replace source UI Kit dialog                                               */
/* -------------------------------------------------------------------------- */

function ReplaceSourceUiKitDialog({
  open,
  onOpenChange,
  currentFileName,
  isReplacing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentFileName?: string;
  isReplacing: boolean;
  onSubmit: (input: { fileName: string; figmaFileKey: string; url: string }) => void;
}) {
  const [link, setLink] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setLink("");
      setFileName("");
      setError("");
    }
  }, [open]);

  // Auto-derive fileName + fileKey from the pasted Figma URL
  React.useEffect(() => {
    const m = link.match(/figma\.com\/(?:file|design)\/([^/?]+)/);
    if (m?.[1]) {
      const key = m[1];
      if (!fileName) {
        setFileName(key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      }
    }
  }, [link, fileName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = link.match(/figma\.com\/(?:file|design)\/([^/?]+)/);
    if (!m?.[1]) {
      setError("Paste a valid Figma file URL (e.g. https://www.figma.com/file/…).");
      return;
    }
    if (!fileName.trim()) {
      setError("A display name is required.");
      return;
    }
    onSubmit({
      fileName: fileName.trim(),
      figmaFileKey: m[1],
      url: link.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replace source UI Kit</DialogTitle>
          <DialogDescription>
            {currentFileName
              ? `This replaces “${currentFileName}” as the source design system file and imports its components from Figma.`
              : "Register a Figma file as the source design system. Component inventory is imported automatically from Figma."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-mono mb-1.5 block">figma file url</label>
            <input
              type="url"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setError("");
              }}
              placeholder="https://www.figma.com/file/your-ui-kit"
              autoFocus
              className="h-9 w-full rounded-md border border-border/70 bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div>
            <label className="label-mono mb-1.5 block">display name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setError("");
              }}
              placeholder="Acme Design System — UI Kit v4"
              className="h-9 w-full rounded-md border border-border/70 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          {isReplacing && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-3">
              <Loader2 className="size-5 animate-spin text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-emerald-800">Importing components from Figma</div>
                <div className="text-xs text-emerald-700">Fetching file structure and extracting components. This may take a moment for large files.</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isReplacing}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {isReplacing ? "Importing…" : currentFileName ? "Replace and import" : "Import UI Kit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
