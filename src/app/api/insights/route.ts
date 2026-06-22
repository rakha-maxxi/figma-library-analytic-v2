import { db, json, withWorkspace } from "@/lib/api";
import {
  getComponentsWithUsage,
  getFilesWithUsage,
  getLatestSnapshot,
  getThresholds,
} from "@/lib/api-queries";

/**
 * GET /api/insights
 */
export const GET = withWorkspace(async (_req, ctx) => {
  const components = await getComponentsWithUsage(ctx.workspaceId);
  const files = await getFilesWithUsage(ctx.workspaceId);
  const { lowUsage, staleDays } = await getThresholds(ctx.workspaceId);
  const latest = await getLatestSnapshot(ctx.workspaceId);

  const unused = components
    .filter((c) => c.status === "Unused")
    .map((c) => ({ id: c.id, name: c.name, set: c.set, totalInstances: c.totalInstances }));

  const lowUsageList = components
    .filter((c) => c.status === "Low Usage")
    .sort((a, b) => a.totalInstances - b.totalInstances)
    .map((c) => ({
      id: c.id,
      name: c.name,
      set: c.set,
      totalInstances: c.totalInstances,
      filesUsed: c.filesUsed,
    }));

  const mostUsed = [...components]
    .sort((a, b) => b.totalInstances - a.totalInstances)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.name,
      set: c.set,
      totalInstances: c.totalInstances,
      filesUsed: c.filesUsed,
    }));

  const staleFiles = files
    .filter((f) => f.status === "Stale")
    .map((f) => ({
      id: f.id,
      name: f.name,
      team: f.team,
      lastScanned: f.lastScanned,
    }));

  const failedScans = await db.scanJob.findMany({
    where: { workspaceId: ctx.workspaceId, status: "Failed" },
    orderBy: { startedAt: "desc" },
    include: { targetFile: true },
  });

  let recentChanges: any[] = [];
  if (latest) {
    const changes = await db.change.findMany({
      where: { workspaceId: ctx.workspaceId, scanJobId: latest.scanJobId },
      orderBy: { at: "desc" },
      take: 10,
      include: { component: true, file: true },
    });
    recentChanges = changes.map((c) => ({
      id: c.id,
      componentName: c.component.name,
      fileName: c.file?.name ?? "—",
      previous: c.previous,
      current: c.current,
      type: c.type,
      at: c.at,
    }));
  }

  return json({
    thresholds: { lowUsage, staleDays },
    lastScanLabel: latest?.label ?? null,
    summary: {
      unused: unused.length,
      lowUsage: lowUsageList.length,
      mostUsed: mostUsed.length,
      staleFiles: staleFiles.length,
      failedScans: failedScans.length,
    },
    unused,
    lowUsage: lowUsageList,
    mostUsed,
    staleFiles,
    failedScans: failedScans.map((s) => ({
      id: s.id,
      target: s.scope === "single" ? s.targetFile?.name ?? "Unknown" : "All files",
      startedAt: s.startedAt,
      error: s.error,
    })),
    recentChanges,
  });
});
