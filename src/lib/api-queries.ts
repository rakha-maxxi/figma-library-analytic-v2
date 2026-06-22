import { db } from "@/lib/db";

/**
 * Workspace-scoped query helpers. Every helper takes a `workspaceId` and
 * only returns rows that belong to that workspace — the multi-tenant guarantee
 * is enforced at the Prisma `where` level, not at the call site.
 *
 * Performance: helpers accept optional pre-fetched data (latest snapshot,
 * thresholds) so callers that need multiple helpers can fetch shared data
 * once and pass it through, avoiding duplicate round-trips.
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

type SnapshotData = Awaited<ReturnType<typeof db.snapshot.findFirst>>;
type ThresholdData = { lowUsage: number; staleDays: number };

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
export async function getThresholds(workspaceId: string): Promise<ThresholdData> {
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

type ComponentUsageAgg = { componentId: string; totalInstances: number; filesUsed: number };

async function getComponentUsageAgg(snapshotId: string): Promise<Map<string, ComponentUsageAgg>> {
  const [sums, fileCounts] = await Promise.all([
    db.componentUsage.groupBy({
      by: ["componentId"],
      where: { snapshotId },
      _sum: { instances: true },
    }),
    db.$queryRaw<{ componentId: string; filesUsed: number }[]>`
      SELECT "componentId", COUNT(DISTINCT "fileId") AS "filesUsed"
      FROM component_usages
      WHERE "snapshotId" = ${snapshotId}
      GROUP BY "componentId"
    `,
  ]);

  const map = new Map<string, ComponentUsageAgg>();
  for (const s of sums) {
    map.set(s.componentId, {
      componentId: s.componentId,
      totalInstances: s._sum.instances ?? 0,
      filesUsed: 0,
    });
  }
  for (const f of fileCounts) {
    const entry = map.get(f.componentId);
    if (entry) entry.filesUsed = Number(f.filesUsed);
  }
  return map;
}

type FileUsageAgg = { fileId: string; totalInstances: number; uniqueComponents: number };

async function getFileUsageAgg(snapshotId: string): Promise<Map<string, FileUsageAgg>> {
  const rows = await db.$queryRaw<{ fileId: string; totalInstances: number; uniqueComponents: number }[]>`
    SELECT "fileId", SUM(instances) AS "totalInstances", COUNT(DISTINCT "componentId") AS "uniqueComponents"
    FROM component_usages
    WHERE "snapshotId" = ${snapshotId}
    GROUP BY "fileId"
  `;
  return new Map(rows.map((r) => [r.fileId, { ...r, totalInstances: Number(r.totalInstances), uniqueComponents: Number(r.uniqueComponents) }]));
}

/** Component list with usage computed from the workspace's latest snapshot. */
export async function getComponentsWithUsage(
  workspaceId: string,
  opts?: {
    latest?: SnapshotData;
    previous?: SnapshotData | null;
    lowUsage?: number;
  }
): Promise<ComponentWithUsage[]> {
  const latest = opts?.latest ?? await getLatestSnapshot(workspaceId);
  const previous = opts?.previous ?? await getPreviousSnapshot(workspaceId);
  const lowUsage = opts?.lowUsage ?? (await getThresholds(workspaceId)).lowUsage;

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

  const [latestAgg, prevAgg] = await Promise.all([
    getComponentUsageAgg(latest.id),
    previous
      ? db.componentUsage.groupBy({
          by: ["componentId"],
          where: { snapshotId: previous.id },
          _sum: { instances: true },
        })
      : Promise.resolve([]),
  ]);

  const prevByComp = new Map<string, number>();
  for (const p of prevAgg) {
    prevByComp.set(p.componentId, p._sum.instances ?? 0);
  }

  return components.map((c) => {
    const entry = latestAgg.get(c.id);
    const totalInstances = entry?.totalInstances ?? 0;
    const filesUsed = entry?.filesUsed ?? 0;
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
export async function getFilesWithUsage(
  workspaceId: string,
  opts?: {
    latest?: SnapshotData;
    staleDays?: number;
  }
): Promise<FileWithUsage[]> {
  const latest = opts?.latest ?? await getLatestSnapshot(workspaceId);
  const staleDays = opts?.staleDays ?? (await getThresholds(workspaceId)).staleDays;

  const [files, lastAllScan, recentSingleScans] = await Promise.all([
    db.registeredFile.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    }),
    db.scanJob.findFirst({
      where: { workspaceId, scope: "all", status: "Success" },
      orderBy: { startedAt: "desc" },
    }),
    db.$queryRaw<{ targetFileId: string; finishedAt: Date | null; status: string }[]>`
      SELECT DISTINCT ON ("targetFileId") "targetFileId", "finishedAt", "status"
      FROM scan_jobs
      WHERE "workspaceId" = ${workspaceId} AND scope = 'single' AND "targetFileId" IS NOT NULL
      ORDER BY "targetFileId", "startedAt" DESC
    `,
  ]);

  const lastScanByFile = new Map<string, { at: Date | null; failed: boolean }>();
  for (const s of recentSingleScans) {
    lastScanByFile.set(s.targetFileId, {
      at: s.finishedAt,
      failed: s.status === "Failed",
    });
  }

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

  const byFile = await getFileUsageAgg(latest.id);

  return files.map((f) => {
    const entry = byFile.get(f.id);
    const totalInstances = entry?.totalInstances ?? 0;
    const uniqueComponents = entry?.uniqueComponents ?? 0;
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
