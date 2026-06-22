"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileStack,
  ExternalLink,
  RefreshCw,
  Plus,
  Users,
  Layers,
  X,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../primitives";
import { StatusPill, fileStatusTone } from "../status-pills";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  useFiles,
  useFile,
  useSourceUiKit,
  useAddFiles,
  useDeleteFile,
  useStartScan,
  type FileItem,
} from "@/lib/api-client";
import type { FileStatus } from "@/lib/mock-data";
import { formatNumber, formatRelative, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LoadingRows, ErrorBanner } from "../loading-states";
import { toast } from "sonner";

type StatusFilter = "All" | FileStatus;

export function FilesPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  const params: Record<string, string> = { search: query, status };
  const { data, isLoading, isError, error, refetch } = useFiles(params);
  const startScan = useStartScan();
  const items = data?.items ?? [];

  const handleRescanFile = (file: FileItem) => {
    startScan.mutate(
      { scope: "single", targetFileId: file.id },
      {
        onSuccess: () => toast.success("File scan started", { description: `${file.name} has been queued.` }),
        onError: (err) => toast.error("Scan failed to start", { description: err.message }),
      }
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Files"
        description="Registered Figma files and their design system adoption."
      >
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="size-3.5" />
          Add files
        </Button>
        <span className="font-mono text-[11px] text-muted-foreground">
          {data ? `${data.total} files` : "loading…"}
        </span>
      </PageHeader>

      {/* Team chips + search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name or team…"
            className="h-9 w-full rounded-md border border-border/70 bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Search files"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border/70 bg-card p-1">
          {(["All", "Healthy", "Low Adoption", "Zero Usage", "Failed", "Stale", "Disabled"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "h-7 shrink-0 rounded px-2.5 text-xs font-medium transition-colors",
                status === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="overflow-x-auto scroll-slim">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30">
                <th className="px-3 py-2 text-left"><span className="label-mono">file</span></th>
                <th className="px-3 py-2 text-left"><span className="label-mono">team</span></th>
                <th className="px-3 py-2 text-right"><span className="label-mono">instances</span></th>
                <th className="px-3 py-2 text-right"><span className="label-mono">components</span></th>
                <th className="px-3 py-2 text-left"><span className="label-mono">status</span></th>
                <th className="px-3 py-2 text-left"><span className="label-mono">last scan</span></th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((f, i) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.2) }}
                  onClick={() => setSelectedId(f.id)}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30">
                        <FileStack className="size-3.5 text-muted-foreground" />
                      </div>
                      <span className="truncate font-medium text-foreground">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] text-muted-foreground">{f.team}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-foreground">
                    {formatNumber(f.totalInstances)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {f.uniqueComponents}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill tone={fileStatusTone(f.status as FileStatus)}>{f.status}</StatusPill>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {formatRelative(f.lastScanned)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRescanFile(f);
                      }}
                      disabled={startScan.isPending}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label="Rescan file"
                    >
                      <RefreshCw className="size-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <LoadingRows count={5} />}
        {isError && <div className="p-4"><ErrorBanner message={error?.message ?? "Failed to load files"} onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
              <FileStack className="size-5" />
            </span>
            <h4 className="mt-3 text-sm font-semibold text-foreground">No files match</h4>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try a different search or filter.
            </p>
          </div>
        )}
      </div>

      <FileDetailSheet fileId={selectedId} onClose={() => setSelectedId(null)} />

      {/* Add files sheet */}
      <AddFilesSheet open={adding} onOpenChange={setAdding} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AddFilesSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [links, setLinks] = React.useState("");
  const [entries, setEntries] = React.useState<{ key: string; url: string; name: string; team: string }[]>([]);
  const addFiles = useAddFiles();

  // Parse URLs whenever the textarea changes
  const handleLinksChange = (value: string) => {
    setLinks(value);
    const parsed = value
      .split(/\s+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((url) => {
        const m = url.match(/figma\.com\/(?:file|design)\/([^/?]+)/);
        const key = m?.[1] ?? url;
        const name = key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return { key, url, name, team: "" };
      });
    setEntries(parsed);
  };

  const updateName = (idx: number, name: string) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, name } : e)));
  };

  const updateTeam = (idx: number, team: string) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, team } : e)));
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
    setLinks((prev) => {
      const lines = prev.split(/\s+/).filter(Boolean);
      return lines.filter((_, i) => i !== idx).join("\n");
    });
  };

  const handleAdd = () => {
    if (entries.length === 0) {
      toast.error("Paste at least one Figma file link");
      return;
    }
    const payload = entries.map((e) => ({
      name: e.name || e.key,
      figmaFileKey: e.key,
      url: e.url,
      team: e.team,
    }));
    addFiles.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Added ${res.added} file${res.added === 1 ? "" : "s"}`, {
          description: res.skipped.length > 0 ? `${res.skipped.length} skipped (already registered)` : undefined,
        });
        setLinks("");
        setEntries([]);
        onOpenChange(false);
      },
      onError: (err) => toast.error("Failed to add files", { description: err.message }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 border-l border-border/70 p-0 sm:max-w-md">
        <SheetHeader className="gap-0 border-b border-border/70 p-5">
          <div className="label-mono-emerald mb-2">register files</div>
          <SheetTitle className="text-left text-lg font-semibold tracking-tight">
            Add Figma files to track
          </SheetTitle>
          <SheetDescription className="text-left text-sm text-muted-foreground">
            Paste one or more Figma file links, then customize the display name for each.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scroll-slim p-5">
          <label className="label-mono mb-1.5 block">figma file links</label>
          <textarea
            value={links}
            onChange={(e) => handleLinksChange(e.target.value)}
            placeholder={"https://www.figma.com/file/…\nhttps://www.figma.com/file/…"}
            rows={4}
            className="w-full resize-none rounded-md border border-border/70 bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
          />

          {entries.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="label-mono text-muted-foreground">preview & rename</div>
              {entries.map((entry, idx) => (
                <div key={idx} className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={(e) => updateName(idx, e.target.value)}
                        placeholder="File name"
                        className="h-8 w-full rounded-md border border-border/70 bg-background px-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={entry.team}
                          onChange={(e) => updateTeam(idx, e.target.value)}
                          placeholder="Team (optional)"
                          className="h-7 w-28 rounded-md border border-border/70 bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                        />
                        <span className="inline-flex h-7 items-center rounded bg-muted/50 px-2 font-mono text-[10px] text-muted-foreground" title={entry.url}>
                          {entry.key.length > 24 ? entry.key.slice(0, 22) + "…" : entry.key}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(idx)}
                      className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Remove"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-md border border-dashed border-border/70 bg-muted/20 p-3">
            <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
              only files accessible by the connected figma account can be scanned.
              analytics are based on registered files only — not org-wide.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border/70 p-4">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleAdd} disabled={addFiles.isPending || entries.length === 0} className="bg-foreground text-background hover:bg-foreground/90">
            {addFiles.isPending ? "Adding…" : `Add ${entries.length} file${entries.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FileDetailSheet({ fileId, onClose }: { fileId: string | null; onClose: () => void }) {
  const { data: file, isLoading, isError, error } = useFile(fileId);
  const { data: kit } = useSourceUiKit();
  const deleteFile = useDeleteFile();
  const startScan = useStartScan();
  const compUsage = file?.componentsUsed ?? [];
  const componentCount = kit?.componentCount ?? 1;
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  // Build tree groups from component usage
  const groups = React.useMemo(() => {
    const map = new Map<string, typeof compUsage>();
    for (const c of compUsage) {
      const idx = c.componentName.indexOf("/");
      const groupName = idx === -1
        ? (c.componentSet || c.componentName)
        : c.componentName.slice(0, idx).trim();
      const list = map.get(groupName) ?? [];
      list.push(c);
      map.set(groupName, list);
    }
    return Array.from(map.entries())
      .map(([name, children]) => ({
        name,
        children: children.sort((a, b) => b.instances - a.instances),
        totalInstances: children.reduce((s, c) => s + c.instances, 0),
      }))
      .sort((a, b) => b.totalInstances - a.totalInstances);
  }, [compUsage]);

  const toggleGroup = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const figmaNodeUrl = (nodeKey: string | null) => {
    if (!nodeKey || !file?.figmaFileKey) return null;
    const nodeId = nodeKey.replace(/:/g, "-");
    return `https://www.figma.com/file/${file.figmaFileKey}?node-id=${nodeId}`;
  };

  return (
    <Sheet open={!!fileId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 border-l border-border/70 p-0 sm:max-w-xl lg:max-w-2xl">
        {isLoading && <div className="p-5"><LoadingRows count={4} /></div>}
        {isError && <div className="p-5"><ErrorBanner message={error?.message ?? "Failed to load file"} /></div>}
        {file && (
          <>
            <SheetHeader className="gap-0 border-b border-border/70 p-5">
              <div className="flex items-center gap-1.5 label-mono">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {file.team} · registered file
              </div>
              <SheetTitle className="text-left text-xl font-semibold tracking-tight text-foreground">
                {file.name}
              </SheetTitle>
          <SheetDescription className="text-left font-mono text-[11px] text-muted-foreground break-all">
            {file.url}
          </SheetDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill tone={fileStatusTone(file.status as FileStatus)}>{file.status}</StatusPill>
            {file.disabled && <StatusPill tone="neutral" dot={false}>disabled</StatusPill>}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scroll-slim">
          <div className="grid grid-cols-2 gap-px border-b border-border/70 bg-border/60 sm:grid-cols-4">
            <Stat label="total instances" value={formatNumber(file.totalInstances)} />
            <Stat label="unique components" value={String(file.uniqueComponents)} />
            <Stat label="adoption" value={file.uniqueComponents > 0 ? `${Math.round((file.uniqueComponents / componentCount) * 100)}%` : "0%"} tone={file.uniqueComponents > 15 ? "up" : file.uniqueComponents > 0 ? "flat" : "down"} />
            <Stat label="last scanned" value={formatRelative(file.lastScanned)} />
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="label-mono">components used in this file</h4>
              <span className="font-mono text-[11px] text-muted-foreground">{compUsage.length}</span>
            </div>

            {groups.length > 0 ? (
              <div className="space-y-0">
                {groups.map((group) => {
                  const hasChildren = group.children.length > 1;
                  const isExpanded = expanded.has(group.name);
                  return (
                    <div key={group.name}>
                      {/* Parent row */}
                      <button
                        type="button"
                        onClick={() => hasChildren && toggleGroup(group.name)}
                        className={cn(
                          "flex w-full items-center justify-between border-b border-border/50 px-3 py-2.5 text-left transition-colors",
                          hasChildren
                            ? "bg-muted/15 hover:bg-muted/30 cursor-pointer"
                            : "hover:bg-muted/20"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {hasChildren ? (
                            <ChevronRight
                              className={cn(
                                "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
                                isExpanded && "rotate-90"
                              )}
                            />
                          ) : (
                            <span className="w-4 shrink-0" />
                          )}
                          <span className="truncate font-semibold text-foreground">{group.name}</span>
                          {group.children.length > 1 && (
                            <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground">
                              {group.children.length} variants
                            </span>
                          )}
                        </div>
                        <span className="ml-2 shrink-0 font-mono text-sm tabular-nums text-foreground">
                          {group.totalInstances}
                        </span>
                      </button>

                      {/* Children */}
                      {isExpanded && hasChildren && (
                        <div>
                          {group.children.map((c) => {
                            const nodeUrl = figmaNodeUrl(c.figmaNodeKey);
                            const variantPath = (() => {
                              const idx = c.componentName.indexOf("/");
                              return idx === -1 ? c.componentName : c.componentName.slice(idx + 1).trim();
                            })();
                            return (
                              <div
                                key={`${c.componentId}:${c.page ?? "no-page"}`}
                                className="flex items-center justify-between border-b border-border/40 py-2.5 transition-colors hover:bg-muted/10"
                              >
                                <div className="flex min-w-0 items-center gap-2 pl-8">
                                  {/* Tree connector */}
                                  <span className="relative flex size-4 shrink-0 items-center justify-center">
                                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/50" />
                                    <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-y-1/2 bg-border/50" />
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="truncate text-sm font-medium text-foreground">
                                        {variantPath}
                                      </span>
                                      {nodeUrl && (
                                        <a
                                          href={nodeUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-emerald-600"
                                          title="Open in Figma"
                                        >
                                          <ExternalLink className="size-3" />
                                        </a>
                                      )}
                                    </div>
                                    {c.page && (
                                      <div className="truncate font-mono text-[10px] text-muted-foreground/70">
                                        page: {c.page}
                                      </div>
                                    )}
                                    {c.componentSet && (
                                      <div className="truncate text-[10px] text-muted-foreground/50">
                                        set: {c.componentSet}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="mr-3 shrink-0 font-mono text-sm tabular-nums text-foreground">
                                  {c.instances}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : compUsage.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
                {file.status === "Zero Usage"
                  ? "This file uses no design system components in the latest scan."
                  : "No component usage recorded. Run a scan to populate this file's data."}
              </div>
            ) : null}

            <div className="mt-5 flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" asChild>
                <a href={file.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                  Open in Figma
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                disabled={startScan.isPending}
                onClick={() => {
                  startScan.mutate(
                    { scope: "single", targetFileId: file.id },
                    {
                      onSuccess: () => toast.success("File scan started", { description: `${file.name} has been queued.` }),
                      onError: (err) => toast.error("Scan failed to start", { description: err.message }),
                    }
                  );
                }}
              >
                <RefreshCw className="size-3.5" />
                {startScan.isPending ? "Starting…" : "Rescan file"}
              </Button>
            </div>
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-center gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                disabled={deleteFile.isPending}
                onClick={() => {
                  deleteFile.mutate(file.id, {
                    onSuccess: () => {
                      toast.success("File removed", { description: `${file.name} is no longer tracked.` });
                      onClose();
                    },
                    onError: (err) => toast.error("Failed to remove file", { description: err.message }),
                  });
                }}
              >
                {deleteFile.isPending ? "Removing…" : "Remove from tracking"}
              </Button>
            </div>

            <dl className="mt-5 divide-y divide-border/60 overflow-hidden rounded-lg border border-border/70">
              <MetaRow k="file id" v={file.id} />
              <MetaRow k="team" v={file.team} />
              <MetaRow k="status" v={file.status} />
              <MetaRow k="last scanned" v={formatDateTime(file.lastScanned)} />
            </dl>
          </div>
        </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, tone = "flat" }: { label: string; value: string; tone?: "up" | "down" | "flat" }) {
  const color = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-foreground";
  return (
    <div className="bg-card p-3.5">
      <div className="label-mono">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold tabular-nums", color)}>{value}</div>
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-card px-3.5 py-2.5">
      <dt className="label-mono shrink-0">{k}</dt>
      <dd className="truncate font-mono text-[12px] text-foreground">{v}</dd>
    </div>
  );
}
