"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  Boxes,
  FileStack,
  TrendingUp,
  TrendingDown,
  Filter,
  X,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { PageHeader } from "../primitives";
import {
  StatusPill,
  componentStatusTone,
  changeTypeTone,
} from "../status-pills";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useComponents, useComponent, type ComponentItem } from "@/lib/api-client";
import type { ComponentStatus } from "@/lib/mock-data";
import { formatNumber, formatRelative, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LoadingRows, ErrorBanner } from "../loading-states";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ────────────────────────────────────────────────────────────────────────── */
/* Tree grouping types                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

type TreeRow =
  | { kind: "parent"; group: ComponentGroup }
  | { kind: "child"; group: ComponentGroup; component: ComponentItem };

type ComponentGroup = {
  parentName: string;
  children: ComponentItem[];
  aggregateInstances: number;
  aggregateFiles: number;
  aggregateChange: number;
  aggregateStatus: "Scanned" | "Not Scanned" | "Mixed";
  latestSeen: string | null;
  matchCount: number;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Grouping helpers                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function parseVariantPath(name: string): { parent: string; child: string } | null {
  const idx = name.indexOf("/");
  if (idx === -1) return null;
  return {
    parent: name.slice(0, idx).trim(),
    child: name.slice(idx + 1).trim(),
  };
}

function buildTree(items: ComponentItem[]): ComponentGroup[] {
  const unified = new Map<string, ComponentItem[]>();

  for (const item of items) {
    const parsed = parseVariantPath(item.name);
    let groupName: string;

    if (parsed) {
      groupName = parsed.parent;
    } else if (item.set && item.set !== "All") {
      groupName = item.set;
    } else {
      groupName = item.name;
    }

    const list = unified.get(groupName) ?? [];
    list.push(item);
    unified.set(groupName, list);
  }

  return Array.from(unified.entries()).map(([name, children]) =>
    buildGroup(name, children)
  );
}

function buildGroup(parentName: string, children: ComponentItem[]): ComponentGroup {
  let aggregateInstances = 0;
  let aggregateFiles = 0;
  let aggregateChange = 0;
  const hasScanned = children.some((c) => c.totalInstances > 0);
  const hasUnscanned = children.some((c) => c.totalInstances === 0 && c.status !== "Active");
  let aggregateStatus: ComponentGroup["aggregateStatus"] = "Not Scanned";
  if (hasScanned && hasUnscanned) aggregateStatus = "Mixed";
  else if (hasScanned) aggregateStatus = "Scanned";
  let latestSeen: string | null = null;

  for (const c of children) {
    aggregateInstances += c.totalInstances;
    aggregateFiles += c.filesUsed;
    aggregateChange += c.totalInstances - c.prevInstances;
    if (c.lastSeen && (!latestSeen || c.lastSeen > latestSeen)) {
      latestSeen = c.lastSeen;
    }
  }

  return {
    parentName,
    children,
    aggregateInstances,
    aggregateFiles,
    aggregateChange,
    aggregateStatus,
    latestSeen,
    matchCount: children.length,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Page                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

type StatusFilter = "All" | ComponentStatus;
type SortKey = "instances" | "files" | "name" | "seen";

const SETS = ["All", "Actions", "Forms", "Overlay", "Feedback", "Identity", "Navigation", "Layout"];

export function ComponentsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All");
  const [setFilter, setSetFilter] = React.useState("All");
  const [sort, setSort] = React.useState<SortKey>("instances");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = React.useState(true);

  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const params: Record<string, string> = {
    search: debouncedQuery,
    status,
    set: setFilter,
    sort,
    dir: sortDir,
  };

  const { data, isLoading, isError, error, refetch } = useComponents(params);
  const items = data?.items ?? [];

  const toggleSort = (key: SortKey) => {
    if (sort === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const activeFilters = (status !== "All" ? 1 : 0) + (setFilter !== "All" ? 1 : 0) + (query ? 1 : 0);

  // Build tree from flat items
  const groups = React.useMemo(() => {
    return buildTree(items);
  }, [items]);

  // Apply sort at group level
  const sortedGroups = React.useMemo(() => {
    const arr = [...groups];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort === "instances") cmp = a.aggregateInstances - b.aggregateInstances;
      else if (sort === "files") cmp = a.aggregateFiles - b.aggregateFiles;
      else if (sort === "name") cmp = a.parentName.localeCompare(b.parentName);
      else if (sort === "seen") {
        cmp = (a.latestSeen ?? "").localeCompare(b.latestSeen ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [groups, sort, sortDir]);

  // When search is active, highlight groups that match
  const searchTerms = debouncedQuery.toLowerCase();
  const filteredGroups = React.useMemo(() => {
    if (!searchTerms) return sortedGroups;
    return sortedGroups
      .map((g) => {
        const matching = g.children.filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerms) ||
            c.set.toLowerCase().includes(searchTerms)
        );
        if (matching.length === 0 && !g.parentName.toLowerCase().includes(searchTerms)) return null;
        return { ...g, children: matching, matchCount: matching.length };
      })
      .filter(Boolean) as ComponentGroup[];
  }, [sortedGroups, searchTerms]);

  // Flatten to tree rows
  const rows: TreeRow[] = React.useMemo(() => {
    const rows: TreeRow[] = [];
    for (const group of filteredGroups) {
      rows.push({ kind: "parent", group });
      const isExpanded = expanded.has(group.parentName);
      if (isExpanded && group.children.length > 0) {
        for (const child of group.children) {
          rows.push({ kind: "child", group, component: child });
        }
      }
    }
    return rows;
  }, [filteredGroups, expanded]);

  // Stable key: only changes when group names actually differ, not on every render.
  const groupsKey = React.useMemo(
    () => filteredGroups.map((g) => g.parentName).sort().join("|"),
    [filteredGroups]
  );

  // Expand / collapse all
  React.useEffect(() => {
    if (expandAll) {
      setExpanded(new Set(filteredGroups.map((g) => g.parentName)));
    } else {
      setExpanded(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandAll, groupsKey]);

  const toggleGroup = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        setExpandAll(false);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const isGroup = (parentName: string) => filteredGroups.some((g) => g.parentName === parentName);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Components"
        description="Browse and search every component from your source UI Kit."
      >
        <span className="font-mono text-[11px] text-muted-foreground">
          {data ? `${data.total} components` : "loading…"}
        </span>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components by name or set…"
            className="h-9 w-full rounded-md border border-border/70 bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Search components"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border/70 bg-card p-1">
          {(["All", "Active", "Low Usage", "Unused"] as StatusFilter[]).map((s) => (
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
              {s === "All" ? "All" : s}
            </button>
          ))}
        </div>

        {/* Set filter */}
        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          className="h-9 shrink-0 rounded-md border border-border/70 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          aria-label="Filter by set"
        >
          {SETS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All sets" : s}</option>
          ))}
        </select>

        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQuery(""); setStatus("All"); setSetFilter("All"); }}
            className="h-9 gap-1.5 text-muted-foreground"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}

        {/* Expand / collapse all */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandAll((v) => !v)}
          className="h-9 gap-1.5 text-muted-foreground"
        >
          <ChevronsUpDown className="size-3.5" />
          {expandAll ? "Collapse all" : "Expand all"}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {isLoading && <LoadingRows count={6} />}
        {isError && <div className="p-4"><ErrorBanner message={error?.message ?? "Failed to load components"} onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
              <Filter className="size-5" />
            </span>
            <h4 className="mt-3 text-sm font-semibold text-foreground">No components match</h4>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
        {!isLoading && !isError && rows.length > 0 && (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30">
                <Th className="w-[35%]">
                  <SortBtn label="component" active={sort === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                </Th>
                <Th className="w-[13%] text-right">
                  <SortBtn label="instances" active={sort === "instances"} dir={sortDir} onClick={() => toggleSort("instances")} />
                </Th>
                <Th className="w-[9%] text-right">
                  <SortBtn label="files" active={sort === "files"} dir={sortDir} onClick={() => toggleSort("files")} />
                </Th>
                <Th className="w-[15%]">status</Th>
                <Th className="w-[12%] text-right">
                  <SortBtn label="change" active={false} dir="asc" onClick={() => {}} disabled />
                </Th>
                <Th className="w-[16%]">
                  <SortBtn label="last seen" active={sort === "seen"} dir={sortDir} onClick={() => toggleSort("seen")} />
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                if (row.kind === "parent") {
                  const g = row.group;
                  const hasChildren = g.children.length > 1;
                  const isExpanded = expanded.has(g.parentName);
                  return (
                    <motion.tr
                      key={`group-${g.parentName}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: Math.min(i * 0.01, 0.15) }}
                      onClick={() => hasChildren && toggleGroup(g.parentName)}
                      className={cn(
                        "border-b border-border/50 transition-colors",
                        hasChildren
                          ? "cursor-pointer bg-muted/15 hover:bg-muted/30"
                          : "hover:bg-muted/20"
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {hasChildren ? (
                            <span className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded transition-transform duration-150",
                              isExpanded ? "text-foreground" : "text-muted-foreground"
                            )}>
                              <ChevronRight
                                className={cn(
                                  "size-4 transition-transform duration-150",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </span>
                          ) : (
                            <span className="w-5 shrink-0" />
                          )}
                          <span className="truncate font-semibold text-foreground">{g.parentName}</span>
                          {g.children.length > 1 && (
                            <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-muted-foreground">
                              {g.children.length} variants
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-foreground">
                        {formatNumber(g.aggregateInstances)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {g.aggregateFiles}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill
                          tone={
                            g.aggregateStatus === "Scanned"
                              ? "active"
                              : g.aggregateStatus === "Mixed"
                              ? "neutral"
                              : "neutral"
                          }
                        >
                          {g.aggregateStatus}
                        </StatusPill>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <ChangeBadge change={g.aggregateChange} />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {g.latestSeen ? formatRelative(g.latestSeen) : "—"}
                      </td>
                    </motion.tr>
                  );
                }

                // Child row
                const c = row.component;
                const change = c.totalInstances - c.prevInstances;
                const variantPath = parseVariantPath(c.name);
                const childLabel = variantPath?.child ?? c.name;
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(i * 0.01, 0.15) }}
                    onClick={() => setSelectedId(c.id)}
                    className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/20"
                  >
                    <td className="py-2.5 pl-8 pr-3">
                      <div className="flex items-center gap-2">
                        {/* Tree connector */}
                        <span className="relative flex size-5 shrink-0 items-center justify-center">
                          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/50" />
                          <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-y-1/2 bg-border/50" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {childLabel}
                          </div>
                          {c.set && (
                            <div className="truncate font-mono text-[10px] text-muted-foreground/60">
                              {c.set}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-foreground">
                      {formatNumber(c.totalInstances)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {c.filesUsed}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill tone={componentStatusTone(c.status as ComponentStatus)}>{c.status}</StatusPill>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <ChangeBadge change={change} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {formatRelative(c.lastSeen)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail sheet */}
      <ComponentDetailSheet componentId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2 text-left align-middle", className)}>
      {typeof children === "string" ? (
        <span className="label-mono">{children}</span>
      ) : (
        children
      )}
    </th>
  );
}

function SortBtn({
  label,
  active,
  dir,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-default opacity-70 hover:text-muted-foreground"
      )}
    >
      <span className="label-mono">{label}</span>
      <ArrowUpDown className={cn("size-3", active ? "text-emerald-600" : "text-muted-foreground/50")} />
      {active && (
        <span className="font-mono text-[9px] text-emerald-600">{dir === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  );
}

function ChangeBadge({ change }: { change: number }) {
  if (change === 0)
    return <span className="font-mono text-[11px] text-muted-foreground">—</span>;
  const Icon = change > 0 ? TrendingUp : TrendingDown;
  const color = change > 0 ? "text-emerald-600" : "text-rose-600";
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums", color)}>
      <Icon className="size-3" />
      {change > 0 ? `+${change}` : change}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Component detail sheet                                                     */
/* -------------------------------------------------------------------------- */

function ComponentDetailSheet({
  componentId,
  onClose,
}: {
  componentId: string | null;
  onClose: () => void;
}) {
  const { data: component, isLoading, isError, error } = useComponent(componentId);
  const fileUsage = component?.fileUsage ?? [];
  const trend = component?.trend ?? [];
  const uniqueFilesUsed = React.useMemo(
    () => new Set(fileUsage.map((f) => f.fileId)).size,
    [fileUsage]
  );

  return (
    <Sheet open={!!componentId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border/70 p-0 sm:max-w-xl lg:max-w-2xl"
      >
        {isLoading && (
          <div className="p-5"><LoadingRows count={4} /></div>
        )}
        {isError && (
          <div className="p-5"><ErrorBanner message={error?.message ?? "Failed to load component"} /></div>
        )}
        {component && (
          <>
            <SheetHeader className="gap-0 border-b border-border/70 p-5">
              <div className="flex items-center gap-1.5 label-mono">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {component.set} · component
              </div>
              <SheetTitle className="text-left text-xl font-semibold tracking-tight text-foreground">
                {component.name}
              </SheetTitle>
              <SheetDescription className="text-left text-sm text-muted-foreground">
                {component.description}
              </SheetDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill tone={componentStatusTone(component.status as ComponentStatus)}>{component.status}</StatusPill>
                <StatusPill tone="neutral" dot={false}>
                  {component.figmaNodeKey ? `node ${component.figmaNodeKey}` : "no node key"}
                </StatusPill>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto scroll-slim">
              <Tabs defaultValue="overview" className="gap-0">
                <div className="border-b border-border/70 px-3 pt-2">
                  <TabsList className="bg-transparent p-0 h-9">
                    <DetailTab value="overview" label="Overview" />
                    <DetailTab value="files" label={`Files (${uniqueFilesUsed})`} />
                    <DetailTab value="instances" label="Instances" />
                    <DetailTab value="trend" label="Trend" />
                    <DetailTab value="metadata" label="Metadata" />
                  </TabsList>
                </div>

                <TabsContent value="overview" className="m-0 p-5">
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/70 bg-border/60 sm:grid-cols-4">
                    <DetailStat label="total instances" value={formatNumber(component.totalInstances)} />
                    <DetailStat label="files used" value={String(component.filesUsed)} />
                    <DetailStat
                      label="change"
                      value={`${component.change > 0 ? "+" : ""}${component.change}`}
                      tone={component.change > 0 ? "up" : component.change < 0 ? "down" : "flat"}
                    />
                    <DetailStat label="last seen" value={formatRelative(component.lastSeen)} />
                  </div>
                  <div className="mt-5">
                    <h4 className="label-mono mb-2">top files</h4>
                    <div className="space-y-1.5">
                      {fileUsage.slice(0, 3).map((f) => (
                        <div
                          key={`${f.fileId}:${f.page ?? "no-page"}`}
                          className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">{f.fileName}</div>
                            {f.page && <div className="font-mono text-[10px] text-muted-foreground">page: {f.page}</div>}
                          </div>
                          <span className="font-mono text-sm tabular-nums text-foreground">{f.instances}</span>
                        </div>
                      ))}
                      {fileUsage.length === 0 && (
                        <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
                          This component was not found in any registered files during the latest scan.
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-5 w-full gap-1.5" asChild>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <ExternalLink className="size-3.5" />
                      Open in Figma
                    </a>
                  </Button>
                </TabsContent>

                <TabsContent value="files" className="m-0 p-5">
                  <div className="space-y-1.5">
                    {fileUsage.map((f) => (
                      <div
                        key={`${f.fileId}:${f.page ?? "no-page"}`}
                        className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30">
                            <FileStack className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">{f.fileName}</div>
                            <div className="truncate font-mono text-[10px] text-muted-foreground">
                              {f.fileTeam}{f.page ? ` · page: ${f.page}` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusPill tone={f.fileStatus === "Healthy" ? "active" : f.fileStatus === "Failed" ? "unused" : "neutral"} dot={false}>
                            {f.fileStatus}
                          </StatusPill>
                          <span className="w-12 text-right font-mono text-sm tabular-nums text-foreground">
                            {f.instances}
                          </span>
                        </div>
                      </div>
                    ))}
                    {fileUsage.length === 0 && (
                      <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
                        No files use this component in the latest scan.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="instances" className="m-0 p-5">
                  <div className="space-y-1.5">
                    {fileUsage.flatMap((f) =>
                      Array.from({ length: Math.min(f.instances > 100 ? 3 : Math.max(1, Math.ceil(f.instances / 50)), 5) }, (_, idx) => ({
                        file: f,
                        no: idx + 1,
                        count: Math.ceil(f.instances / Math.min(f.instances > 100 ? 3 : Math.max(1, Math.ceil(f.instances / 50)), 5)),
                      }))
                    ).map(({ file, count }, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] text-muted-foreground">#{String(i + 1).padStart(3, "0")}</span>
                          <span className="font-medium text-foreground">{file.fileName}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                          {file.page && <span>page: {file.page}</span>}
                          <span>~{count}</span>
                        </div>
                      </div>
                    ))}
                    {fileUsage.length === 0 && (
                      <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
                        No instances to display.
                      </div>
                    )}
                    <p className="pt-2 font-mono text-[10px] text-muted-foreground">
                      instance locations (page/frame) are approximate — based on the latest scan.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="trend" className="m-0 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="label-mono">instances per scan</h4>
                    <span className="font-mono text-[11px] text-muted-foreground">last {trend.length} scans</span>
                  </div>
                  <div className="h-56 w-full">
                    {trend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="compTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                          <XAxis dataKey="scan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 8,
                              border: "1px solid hsl(var(--border))",
                              background: "hsl(var(--background))",
                              fontSize: 12,
                            }}
                            formatter={(v: number) => [formatNumber(v), "Instances"]}
                          />
                          <Area type="monotone" dataKey="instances" stroke="#10b981" strokeWidth={2} fill="url(#compTrendGrad)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No trend data yet.</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="m-0 p-5">
                  <dl className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/70">
                    <MetaRow k="component id" v={component.id} />
                    <MetaRow k="name" v={component.name} />
                    <MetaRow k="set" v={component.set} />
                    <MetaRow k="figma node key" v={component.figmaNodeKey ?? "—"} />
                    <MetaRow k="total instances" v={formatNumber(component.totalInstances)} />
                    <MetaRow k="files used" v={String(component.filesUsed)} />
                    <MetaRow k="previous instances" v={formatNumber(component.prevInstances)} />
                    <MetaRow k="last seen" v={formatDateTime(component.lastSeen)} />
                    <MetaRow k="status" v={component.status} />
                    <MetaRow k="created at" v={formatDateTime(component.createdAt)} />
                    <MetaRow k="updated at" v={formatDateTime(component.updatedAt)} />
                  </dl>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailTab({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-md border border-transparent px-2.5 text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none"
    >
      {label}
    </TabsTrigger>
  );
}

function DetailStat({
  label,
  value,
  tone = "flat",
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "flat";
}) {
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
