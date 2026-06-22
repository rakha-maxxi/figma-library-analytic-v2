import { db, cachedJson, qs, withWorkspace } from "@/lib/api";
import { workspaceCacheKey } from "@/lib/cache";
import { getLatestSnapshot } from "@/lib/api-queries";

/**
 * GET /api/changes
 * Recent changes in the active workspace (latest scan vs previous).
 */
export const GET = withWorkspace(async (req, ctx) => {
  const url = new URL(req.url);
  const type = qs(url.searchParams.get("type"), "All");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
  const cacheKey = workspaceCacheKey(ctx.workspaceId, "recent-changes", [type, limit]);
  return cachedJson(cacheKey, 60, async () => {

  const latest = await getLatestSnapshot(ctx.workspaceId);
  if (!latest) return { total: 0, items: [], lastScanLabel: null };

  const where: any = {
    workspaceId: ctx.workspaceId,
    scanJobId: latest.scanJobId,
  };
  if (type !== "All") where.type = type;

  const changes = await db.change.findMany({
    where,
    orderBy: { at: "desc" },
    take: limit,
    include: { component: true, file: true },
  });

  return {
    total: changes.length,
    lastScanLabel: latest.label,
    items: changes.map((c) => ({
      id: c.id,
      componentName: c.component.name,
      componentSet: c.component.set,
      fileName: c.file?.name ?? "—",
      fileTeam: c.file?.team ?? "—",
      previous: c.previous,
      current: c.current,
      type: c.type,
      at: c.at,
    })),
  };
  });
});
