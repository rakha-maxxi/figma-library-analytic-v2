"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Typed API client for Componently.
 * All data fetching/mutations go through here. Dates arrive as ISO strings.
 */

/* -------------------------------------------------------------------------- */
/* Types (matching API response shapes)                                       */
/* -------------------------------------------------------------------------- */

export interface OverviewStats {
  totalComponents: number;
  registeredFiles: number;
  totalInstances: number;
  unusedComponents: number;
  lowUsageComponents: number;
  failedScans: number;
  staleFiles: number;
  lastScanAt: string | null;
  lastScanLabel: string | null;
  adoptionRate: number;
  filesScannedInLatest: number;
}

export interface SourceUiKit {
  id: string;
  fileName: string;
  figmaFileKey: string;
  url: string;
  componentCount: number;
  connectedAt: string;
  lastSyncedAt: string;
  actualComponentCount: number;
}

export interface ComponentItem {
  id: string;
  name: string;
  set: string;
  description: string;
  figmaNodeKey: string | null;
  totalInstances: number;
  filesUsed: number;
  status: string;
  lastSeen: string | null;
  prevInstances: number;
}

export interface ComponentDetail extends ComponentItem {
  createdAt: string;
  updatedAt: string;
  change: number;
  fileUsage: {
    fileId: string;
    fileName: string;
    fileTeam: string;
    fileStatus: string;
    instances: number;
    page: string | null;
  }[];
  trend: { scan: string; instances: number }[];
}

export interface FileItem {
  id: string;
  name: string;
  url: string;
  figmaFileKey: string;
  team: string;
  disabled: boolean;
  totalInstances: number;
  uniqueComponents: number;
  status: string;
  lastScanned: string | null;
}

export interface FileDetail extends FileItem {
  createdAt: string;
  updatedAt: string;
  componentsUsed: {
    componentId: string;
    componentName: string;
    componentSet: string;
    componentStatus: string;
    instances: number;
    page: string | null;
    figmaNodeKey: string | null;
  }[];
}

export interface ScanItem {
  id: string;
  label: string;
  scope: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  filesOk: number;
  filesFailed: number;
  error: string | null;
  target: string;
  targetFileId: string | null;
  snapshot: {
    id: string;
    label: string;
    at: string;
    filesScanned: number;
    totalInstances: number;
    componentsUsed: number;
  } | null;
}

export interface SnapshotItem {
  id: string;
  label: string;
  at: string;
  filesScanned: number;
  totalInstances: number;
  componentsUsed: number;
  scanJobId: string;
  scanStatus: string;
}

export interface ChangeItem {
  id: string;
  componentName: string;
  componentSet: string;
  fileName: string;
  fileTeam: string;
  previous: number;
  current: number;
  type: string;
  at: string;
}

export interface InsightsData {
  thresholds: { lowUsage: number; staleDays: number };
  lastScanLabel: string | null;
  summary: {
    unused: number;
    lowUsage: number;
    mostUsed: number;
    staleFiles: number;
    failedScans: number;
  };
  unused: { id: string; name: string; set: string; totalInstances: number }[];
  lowUsage: { id: string; name: string; set: string; totalInstances: number; filesUsed: number }[];
  mostUsed: { id: string; name: string; set: string; totalInstances: number; filesUsed: number }[];
  staleFiles: { id: string; name: string; team: string; lastScanned: string | null }[];
  failedScans: { id: string; target: string; startedAt: string; error: string | null }[];
  recentChanges: {
    id: string;
    componentName: string;
    fileName: string;
    previous: number;
    current: number;
    type: string;
    at: string;
  }[];
}

export interface Settings {
  figmaConnected: boolean;
  figmaTokenHint: string;
  lowUsageThreshold: number;
  staleDaysThreshold: number;
  autoScanEnabled: boolean;
  preserveOnFailure: boolean;
}

/* -------------------------------------------------------------------------- */
/* Fetch helpers                                                              */
/* -------------------------------------------------------------------------- */

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error((b as any).error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Query keys                                                                 */
/* -------------------------------------------------------------------------- */

export const qk = {
  overview: ["overview"] as const,
  sourceUiKit: ["source-ui-kit"] as const,
  components: (params: Record<string, string>) => ["components", params] as const,
  component: (id: string) => ["component", id] as const,
  files: (params: Record<string, string>) => ["files", params] as const,
  file: (id: string) => ["file", id] as const,
  scans: (params: Record<string, string>) => ["scans", params] as const,
  snapshots: ["snapshots"] as const,
  changes: (params: Record<string, string>) => ["changes", params] as const,
  insights: ["insights"] as const,
  settings: ["settings"] as const,
};

/* -------------------------------------------------------------------------- */
/* Query hooks                                                                */
/* -------------------------------------------------------------------------- */

export function useOverview() {
  return useQuery({
    queryKey: qk.overview,
    queryFn: () => get<OverviewStats>("/api/overview"),
  });
}

export function useSourceUiKit() {
  return useQuery({
    queryKey: qk.sourceUiKit,
    queryFn: () => get<SourceUiKit>("/api/source-ui-kit"),
  });
}

export function useComponents(params: Record<string, string> = {}) {
  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
  ).toString();
  return useQuery({
    queryKey: qk.components(params),
    queryFn: () => get<{ total: number; items: ComponentItem[] }>(`/api/components${search ? `?${search}` : ""}`),
  });
}

export function useComponent(id: string | null) {
  return useQuery({
    queryKey: qk.component(id ?? ""),
    queryFn: () => get<ComponentDetail>(`/api/components/${id}`),
    enabled: !!id,
  });
}

export function useFiles(params: Record<string, string> = {}) {
  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
  ).toString();
  return useQuery({
    queryKey: qk.files(params),
    queryFn: () => get<{ total: number; items: FileItem[] }>(`/api/files${search ? `?${search}` : ""}`),
  });
}

export function useFile(id: string | null) {
  return useQuery({
    queryKey: qk.file(id ?? ""),
    queryFn: () => get<FileDetail>(`/api/files/${id}`),
    enabled: !!id,
  });
}

export function useScans(params: Record<string, string> = {}, options: { refetchInterval?: number | false } = {}) {
  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
  ).toString();
  return useQuery({
    queryKey: qk.scans(params),
    queryFn: () => get<{ total: number; items: ScanItem[] }>(`/api/scans${search ? `?${search}` : ""}`),
    refetchInterval: options.refetchInterval,
  });
}

export function useSnapshots() {
  return useQuery({
    queryKey: qk.snapshots,
    queryFn: () => get<{ total: number; items: SnapshotItem[] }>("/api/snapshots"),
  });
}

export function useChanges(params: Record<string, string> = {}) {
  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
  ).toString();
  return useQuery({
    queryKey: qk.changes(params),
    queryFn: () => get<{ total: number; lastScanLabel: string | null; items: ChangeItem[] }>(`/api/changes${search ? `?${search}` : ""}`),
  });
}

export function useInsights() {
  return useQuery({
    queryKey: qk.insights,
    queryFn: () => get<InsightsData>("/api/insights"),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: qk.settings,
    queryFn: () => get<Settings>("/api/settings"),
  });
}

/* -------------------------------------------------------------------------- */
/* Scan notifications                                                         */
/* -------------------------------------------------------------------------- */

export type ScanNotificationKind = "success" | "failed";

export type ScanNotification = {
  id: string;
  scanId: string;
  label: string;
  scope: string;
  target: string;
  kind: ScanNotificationKind;
  message: string;
  createdAt: number;
};

const NOTIF_MAX = 50;
const NOTIF_STORAGE_PREFIX = "componently.scanNotif.lastSeenAt";

type NotifState = {
  notifications: ScanNotification[];
  unreadCount: number;
};

const notifListeners = new Set<(state: NotifState) => void>();
let notifState: NotifState = { notifications: [], unreadCount: 0 };
let notifSeen = new Set<string>();

function emitNotif() {
  for (const listener of notifListeners) listener(notifState);
}

function getLastSeenAt(workspaceId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(`${NOTIF_STORAGE_PREFIX}:${workspaceId}`);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function writeLastSeenAt(workspaceId: string, value: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${NOTIF_STORAGE_PREFIX}:${workspaceId}`, String(value));
  } catch {
    /* ignore quota errors */
  }
}

function buildScanMessage(scan: ScanItem): { kind: ScanNotificationKind; message: string } {
  if (scan.status === "Success") {
    const total = scan.snapshot?.totalInstances ?? 0;
    const components = scan.snapshot?.componentsUsed ?? 0;
    return {
      kind: "success",
      message: `Found ${total.toLocaleString()} instances across ${components} components.`,
    };
  }
  return {
    kind: "failed",
    message: scan.error ?? "Scan failed. Check the scans page for details.",
  };
}

function pushScanNotification(notification: ScanNotification) {
  notifState = {
    notifications: [notification, ...notifState.notifications].slice(0, NOTIF_MAX),
    unreadCount: notifState.unreadCount,
  };
  emitNotif();
}

function recomputeUnread(workspaceId: string) {
  const lastSeen = getLastSeenAt(workspaceId);
  const unread = notifState.notifications.filter((n) => n.createdAt > lastSeen).length;
  notifState = { ...notifState, unreadCount: unread };
  emitNotif();
}

/**
 * Watch the scans query and emit a toast + history entry when a scan
 * transitions to `Success` or `Failed`. Also keeps a small in-memory
 * notification list and an unread count.
 *
 * The hook should be mounted once in a top-level component (the topbar).
 */
export function useScanNotifications(workspaceId: string | null) {
  const scansQuery = useScans(
    {},
    { refetchInterval: workspaceId ? 3_000 : false }
  );
  const [state, setState] = React.useState<NotifState>(notifState);

  React.useEffect(() => {
    const listener: typeof notifListeners extends Set<infer L> ? L : never =
      ((next: NotifState) => setState(next)) as never;
    notifListeners.add(listener as never);
    return () => {
      notifListeners.delete(listener as never);
    };
  }, []);

  React.useEffect(() => {
    if (!workspaceId) return;
    const data = scansQuery.data;
    if (!data) return;

    let changed = false;
    for (const scan of data.items) {
      if (notifSeen.has(scan.id)) continue;
      notifSeen.add(scan.id);
      if (scan.status !== "Success" && scan.status !== "Failed") continue;

      const meta = buildScanMessage(scan);
      const notification: ScanNotification = {
        id: `${scan.id}:${scan.status}`,
        scanId: scan.id,
        label: scan.label,
        scope: scan.scope,
        target: scan.target,
        kind: meta.kind,
        message: meta.message,
        createdAt: Date.now(),
      };
      pushScanNotification(notification);
      changed = true;

      const description =
        scan.target +
        " · " +
        (scan.scope === "all" ? "All files" : "Single file");
      if (meta.kind === "success") {
        toast.success(`${scan.label} completed`, {
          description: `${description} — ${meta.message}`,
        });
      } else {
        toast.error(`${scan.label} failed`, {
          description: `${description} — ${meta.message}`,
        });
      }
    }

    if (changed) {
      recomputeUnread(workspaceId);
    } else {
      // Always recompute on first load so unread count reflects current state.
      recomputeUnread(workspaceId);
    }
  }, [scansQuery.data, workspaceId]);

  const markAllRead = React.useCallback(() => {
    if (!workspaceId) return;
    writeLastSeenAt(workspaceId, Date.now());
    notifState = { ...notifState, unreadCount: 0 };
    emitNotif();
  }, [workspaceId]);

  const clear = React.useCallback(() => {
    notifState = { notifications: [], unreadCount: 0 };
    emitNotif();
  }, []);

  return { ...state, markAllRead, clear };
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

/** Invalidate everything that scan results affect. */
function useInvalidateAfterScan() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.overview });
    qc.invalidateQueries({ queryKey: ["components"] });
    qc.invalidateQueries({ queryKey: ["component"] });
    qc.invalidateQueries({ queryKey: ["files"] });
    qc.invalidateQueries({ queryKey: ["file"] });
    qc.invalidateQueries({ queryKey: ["scans"] });
    qc.invalidateQueries({ queryKey: qk.snapshots });
    qc.invalidateQueries({ queryKey: ["changes"] });
    qc.invalidateQueries({ queryKey: qk.insights });
  };
}

export function useStartScan() {
  const invalidate = useInvalidateAfterScan();
  return useMutation({
    mutationFn: (body: { scope: "all" | "single"; targetFileId?: string }) =>
      send<{ id: string; scope: string; status: string; startedAt: string; label: string }>("/api/scans", "POST", body),
    onSuccess: () => {
      invalidate();
      [1500, 4000, 10000, 20000].forEach((delay) => setTimeout(invalidate, delay));
    },
  });
}

export function useRetryScan() {
  const invalidate = useInvalidateAfterScan();
  return useMutation({
    mutationFn: (id: string) =>
      send(`/api/scans/${id}`, "PATCH", { action: "retry" }),
    onSuccess: invalidate,
  });
}

export function useAddFiles() {
  const invalidate = useInvalidateAfterScan();
  return useMutation({
    mutationFn: (files: { name: string; figmaFileKey: string; url: string; team?: string }[]) =>
      send<{ added: number; skipped: { item: any; reason: string }[]; items: FileItem[] }>(
        "/api/files",
        "POST",
        { files }
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => send<Settings>("/api/settings", "PUT", patch),
    onSuccess: (data) => {
      qc.setQueryData(qk.settings, data);
      // thresholds affect components/insights status computation
      qc.invalidateQueries({ queryKey: qk.components({}) });
      qc.invalidateQueries({ queryKey: qk.insights });
      qc.invalidateQueries({ queryKey: qk.files({}) });
    },
  });
}

export function useRefreshSourceUiKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => send<SourceUiKit>("/api/source-ui-kit", "PATCH"),
    onSuccess: (data) => qc.setQueryData(qk.sourceUiKit, data),
  });
}

export function useUpdateFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { name?: string; team?: string; disabled?: boolean } }) =>
      send<FileItem>(`/api/files/${id}`, "PATCH", patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.files({}) });
      qc.invalidateQueries({ queryKey: qk.overview });
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      send<{ ok: boolean }>(`/api/files/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["file"] });
      qc.invalidateQueries({ queryKey: qk.overview });
    },
  });
}

/** Connect / replace the Figma PAT. */
export function useReplaceFigmaToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      send<{ ok: boolean; figmaConnected: boolean; figmaTokenHint: string }>(
        "/api/settings/figma-token",
        "PUT",
        { token }
      ),
    onSuccess: (data) => {
      qc.setQueryData(qk.settings, (old: Settings | undefined) =>
        old
          ? { ...old, figmaConnected: data.figmaConnected, figmaTokenHint: data.figmaTokenHint }
          : old
      );
    },
  });
}

/** Disconnect the Figma PAT. */
export function useDisconnectFigma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      send<{ ok: boolean; figmaConnected: false; figmaTokenHint: "" }>(
        "/api/settings/figma-token",
        "DELETE"
      ),
    onSuccess: (data) => {
      qc.setQueryData(qk.settings, (old: Settings | undefined) =>
        old
          ? { ...old, figmaConnected: data.figmaConnected, figmaTokenHint: data.figmaTokenHint }
          : old
      );
    },
  });
}

/** Register/replace the source UI Kit and import its component inventory. */
export function useReplaceSourceUiKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { fileName: string; figmaFileKey: string; url: string }) =>
      send<SourceUiKit>("/api/source-ui-kit", "POST", input),
    onSuccess: (data) => {
      qc.setQueryData(qk.sourceUiKit, data);
      qc.invalidateQueries({ queryKey: qk.overview });
    },
  });
}
