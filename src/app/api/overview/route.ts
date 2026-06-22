import {
  db,
  cachedJson,
  withWorkspace,
  type WorkspaceContext,
} from "@/lib/api";
import { workspaceCacheKey } from "@/lib/cache";
import {
  getComponentsWithUsage,
  getFilesWithUsage,
  getLatestSnapshot,
  getPreviousSnapshot,
  getThresholds,
} from "@/lib/api-queries";

/**
 * GET /api/overview
 * High-level dashboard summary scoped to the active workspace.
 *
 * Performance: fetches shared data (snapshot, thresholds) once and passes
 * it to both helpers, running them in parallel to minimize round-trips.
 */
export const GET = withWorkspace(async (_req, ctx: WorkspaceContext) => {
  const cacheKey = workspaceCacheKey(ctx.workspaceId, "overview");
  return cachedJson(cacheKey, 45, async () => {
  const [latest, previous, thresholds] = await Promise.all([
    getLatestSnapshot(ctx.workspaceId),
    getPreviousSnapshot(ctx.workspaceId),
    getThresholds(ctx.workspaceId),
  ]);

  const [components, files, failedScans] = await Promise.all([
    getComponentsWithUsage(ctx.workspaceId, { latest, previous, lowUsage: thresholds.lowUsage }),
    getFilesWithUsage(ctx.workspaceId, { latest, staleDays: thresholds.staleDays }),
    db.scanJob.count({
      where: { workspaceId: ctx.workspaceId, status: "Failed" },
    }),
  ]);

  const totalInstances = components.reduce((s, c) => s + c.totalInstances, 0);
  const unused = components.filter((c) => c.status === "Unused").length;
  const lowUsage = components.filter((c) => c.status === "Low Usage").length;

  const enabledFiles = files.filter((f) => !f.disabled);
  const healthyFiles = files.filter((f) => f.status === "Healthy").length;
  const staleFiles = files.filter((f) => f.status === "Stale").length;

  const adoptionRate = enabledFiles.length > 0
    ? Math.round((healthyFiles / enabledFiles.length) * 1000) / 10
    : 0;

  return {
    totalComponents: components.length,
    registeredFiles: files.length,
    totalInstances,
    unusedComponents: unused,
    lowUsageComponents: lowUsage,
    failedScans,
    staleFiles,
    lastScanAt: latest?.at ?? null,
    lastScanLabel: latest?.label ?? null,
    adoptionRate,
    filesScannedInLatest: latest?.filesScanned ?? 0,
  };
  });
});
