import { db, cachedJson, qi, withWorkspace } from "@/lib/api";
import { workspaceCacheKey } from "@/lib/cache";

/**
 * GET /api/snapshots
 */
export const GET = withWorkspace(async (req, ctx) => {
  const url = new URL(req.url);
  const limit = Math.min(qi(url.searchParams.get("limit"), 20), 100);
  const cacheKey = workspaceCacheKey(ctx.workspaceId, "snapshots:list", [limit]);
  return cachedJson(cacheKey, 60, async () => {
  const snapshots = await db.snapshot.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { at: "desc" },
    take: limit,
    include: { scanJob: true },
  });
  return {
    total: snapshots.length,
    items: snapshots.map((s) => ({
      id: s.id,
      label: s.label,
      at: s.at,
      filesScanned: s.filesScanned,
      totalInstances: s.totalInstances,
      componentsUsed: s.componentsUsed,
      scanJobId: s.scanJobId,
      scanStatus: s.scanJob.status,
    })),
  };
  });
});
