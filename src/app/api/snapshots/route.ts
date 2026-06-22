import { db, json, qi, withWorkspace } from "@/lib/api";

/**
 * GET /api/snapshots
 */
export const GET = withWorkspace(async (req, ctx) => {
  const url = new URL(req.url);
  const limit = Math.min(qi(url.searchParams.get("limit"), 20), 100);
  const snapshots = await db.snapshot.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { at: "desc" },
    take: limit,
    include: { scanJob: true },
  });
  return json({
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
  });
});
