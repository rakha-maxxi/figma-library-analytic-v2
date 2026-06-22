import { db, json, withWorkspace } from "@/lib/api";
import {
  getComponentsWithUsage,
  getFilesWithUsage,
  getLatestSnapshot,
  getPreviousSnapshot,
  getThresholds,
} from "@/lib/api-queries";

/**
 * GET /api/insights
 *
 * Performance: fetches shared data once and passes it to helpers,
 * running them in parallel to minimize DB round-trips.
 */
export const GET = withWorkspace(async (_req, ctx) => {
  const [latest, previous, thresholds] = await Promise.all([
    getLatestSnapshot(ctx.workspaceId),
    getPreviousSnapshot(ctx.workspaceId),
    getThresholds(ctx.workspaceId),
  ]);

  const [components, files, failedScans] = await Promise.all([
    getComponentsWithUsage(ctx.workspaceId, { latest, previous, lowUsage: thresholds.lowUsage }),
    getFilesWithUsage(ctx.workspaceId, { latest, staleDays: thresholds.staleDays }),
    db.scanJob.findMany({
      where: { workspaceId: ctx.workspaceId, status: "Failed" },
      orderBy: { startedAt: "desc" },
      include: { targetFile: true },
    }),
  ]);

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
    thresholds: { lowUsage: thresholds.lowUsage, staleDays: thresholds.staleDays },
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
