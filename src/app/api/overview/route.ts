import {
  db,
  json,
  qs,
  withWorkspace,
  type WorkspaceContext,
} from "@/lib/api";
import {
  getComponentsWithUsage,
  getFilesWithUsage,
  getLatestSnapshot,
} from "@/lib/api-queries";

/**
 * GET /api/overview
 * High-level dashboard summary scoped to the active workspace.
 */
export const GET = withWorkspace(async (_req, ctx: WorkspaceContext) => {
  const latest = await getLatestSnapshot(ctx.workspaceId);
  const components = await getComponentsWithUsage(ctx.workspaceId);
  const files = await getFilesWithUsage(ctx.workspaceId);

  const totalInstances = components.reduce((s, c) => s + c.totalInstances, 0);
  const unused = components.filter((c) => c.status === "Unused").length;
  const lowUsage = components.filter((c) => c.status === "Low Usage").length;

  const enabledFiles = files.filter((f) => !f.disabled);
  const healthyFiles = files.filter((f) => f.status === "Healthy").length;
  const staleFiles = files.filter((f) => f.status === "Stale").length;
  const failedScans = await db.scanJob.count({
    where: { workspaceId: ctx.workspaceId, status: "Failed" },
  });

  const adoptionRate = enabledFiles.length > 0
    ? Math.round((healthyFiles / enabledFiles.length) * 1000) / 10
    : 0;

  return json({
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
  });
});
