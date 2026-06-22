import { db } from "@/lib/db";

/**
 * Workspace-scoped query helpers. Every helper takes a `workspaceId` and
 * only returns rows that belong to that workspace — the multi-tenant guarantee
 * is enforced at the Prisma `where` level, not at the call site.
 */

export type ComponentWithUsage = {
  id: string;
  name: string;
  set: string;
  description: string;
  figmaNodeKey: string | null;
  totalInstances: number;
  filesUsed: number;
  status: string; // Active | Low Usage | Unused | Not Scanned
  lastSeen: Date | null;
  prevInstances: number;
};

export type FileWithUsage = {
  id: string;
  name: string;
  url: string;
  figmaFileKey: string;
  team: string;
  disabled: boolean;
  totalInstances: number;
  uniqueComponents: number;
  status: string;
  lastScanned: Date | null;
};

/** Latest successful snapshot for the workspace. */
export async function getLatestSnapshot(workspaceId: string) {
  return db.snapshot.findFirst({
    where: { workspaceId },
    orderBy: { at: "desc" },
    include: { scanJob: true },
  });
}

/** Second-latest successful snapshot (for change detection). */
export async function getPreviousSnapshot(workspaceId: string) {
  const snapshots = await db.snapshot.findMany({
    where: { workspaceId },
    orderBy: { at: "desc" },
    take: 2,
  });
  return snapshots[1] ?? null;
}

/** Threshold settings (workspace-scoped). */
export async function getThresholds(workspaceId: string) {
  const rows = await db.setting.findMany({
    where: { workspaceId, key: { in: ["low_usage_threshold", "stale_days_threshold"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    lowUsage: map.low_usage_threshold ? Number(map.low_usage_threshold) : 500,
    staleDays: map.stale_days_threshold ? Number(map.stale_days_threshold) : 7,
  };
}

export function computeComponentStatus(
  totalInstances: number,
  hasAnySnapshot: boolean,
  lowUsageThreshold: number
): string {
  if (!hasAnySnapshot) return "Not Scanned";
  if (totalInstances === 0) return "Unused";
  if (totalInstances < lowUsageThreshold) return "Low Usage";
  return "Active";
}

export function computeFileStatus(
  uniqueComponents: number,
  lastScanned: Date | null,
  hasFailedScan: boolean,
  staleDays: number,
  disabled: boolean
): string {
  if (disabled) return "Disabled";
  if (!lastScanned) return "Not Scanned";
  if (hasFailedScan) return "Failed";
  const ageDays = (Date.now() - lastScanned.getTime()) / 86_400_000;
  if (ageDays > staleDays) return "Stale";
  if (uniqueComponents === 0) return "Zero Usage";
  if (uniqueComponents < 15) return "Low Adoption";
  return "Healthy";
}

/** Component list with usage computed from the workspace's latest snapshot. */
export async function getComponentsWithUsage(
  workspaceId: string
): Promise<ComponentWithUsage[]> {
  const latest = await getLatestSnapshot(workspaceId);
  const previous = await getPreviousSnapshot(workspaceId);
  const { lowUsage } = await getThresholds(workspaceId);

  const components = await db.component.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });

  if (!latest) {
    return components.map((c) => ({
      id: c.id,
      name: c.name,
      set: c.set,
      description: c.description,
      figmaNodeKey: c.figmaNodeKey,
      totalInstances: 0,
      filesUsed: 0,
      status: "Not Scanned",
      lastSeen: null,
      prevInstances: 0,
    }));
  }

  const latestUsages = await db.componentUsage.findMany({
    where: { snapshotId: latest.id },
  });
  const prevUsages = previous
    ? await db.componentUsage.findMany({ where: { snapshotId: previous.id } })
    : [];

  const latestByComp = new Map<string, { total: number; files: Set<string>; lastSeen: Date }>();
  for (const u of latestUsages) {
    const entry = latestByComp.get(u.componentId) ?? {
      total: 0,
      files: new Set<string>(),
      lastSeen: latest.at,
    };
    entry.total += u.instances;
    entry.files.add(u.fileId);
    latestByComp.set(u.componentId, entry);
  }

  const prevByComp = new Map<string, number>();
  for (const u of prevUsages) {
    prevByComp.set(u.componentId, (prevByComp.get(u.componentId) ?? 0) + u.instances);
  }

  return components.map((c) => {
    const entry = latestByComp.get(c.id);
    const totalInstances = entry?.total ?? 0;
    const filesUsed = entry?.files.size ?? 0;
    return {
      id: c.id,
      name: c.name,
      set: c.set,
      description: c.description,
      figmaNodeKey: c.figmaNodeKey,
      totalInstances,
      filesUsed,
      status: computeComponentStatus(totalInstances, true, lowUsage),
      lastSeen: entry ? latest.at : null,
      prevInstances: prevByComp.get(c.id) ?? 0,
    };
  });
}

/** File list with adoption computed from the workspace's latest snapshot. */
export async function getFilesWithUsage(workspaceId: string): Promise<FileWithUsage[]> {
  const latest = await getLatestSnapshot(workspaceId);
  const { staleDays } = await getThresholds(workspaceId);

  const files = await db.registeredFile.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });

  const allScans = await db.scanJob.findMany({
    where: { workspaceId },
    orderBy: { startedAt: "desc" },
  });
  const lastScanByFile = new Map<string, { at: Date | null; failed: boolean }>();
  for (const s of allScans) {
    if (s.scope === "single" && s.targetFileId) {
      if (!lastScanByFile.has(s.targetFileId)) {
        lastScanByFile.set(s.targetFileId, {
          at: s.finishedAt,
          failed: s.status === "Failed",
        });
      }
    }
  }
  const lastAllScan = allScans.find((s) => s.scope === "all" && s.status === "Success");

  if (!latest) {
    return files.map((f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      figmaFileKey: f.figmaFileKey,
      team: f.team,
      disabled: f.disabled,
      totalInstances: 0,
      uniqueComponents: 0,
      status: computeFileStatus(0, null, false, staleDays, f.disabled),
      lastScanned: null,
    }));
  }

  const latestUsages = await db.componentUsage.findMany({
    where: { snapshotId: latest.id },
  });

  const byFile = new Map<string, { total: number; components: Set<string> }>();
  for (const u of latestUsages) {
    const entry = byFile.get(u.fileId) ?? { total: 0, components: new Set<string>() };
    entry.total += u.instances;
    entry.components.add(u.componentId);
    byFile.set(u.fileId, entry);
  }

  return files.map((f) => {
    const entry = byFile.get(f.id);
    const totalInstances = entry?.total ?? 0;
    const uniqueComponents = entry?.components.size ?? 0;
    const single = lastScanByFile.get(f.id);
    const lastScanned = single?.at ?? lastAllScan?.finishedAt ?? null;
    const hasFailed = single?.failed ?? false;
    return {
      id: f.id,
      name: f.name,
      url: f.url,
      figmaFileKey: f.figmaFileKey,
      team: f.team,
      disabled: f.disabled,
      totalInstances,
      uniqueComponents,
      status: computeFileStatus(uniqueComponents, lastScanned, hasFailed, staleDays, f.disabled),
      lastScanned,
    };
  });
}
