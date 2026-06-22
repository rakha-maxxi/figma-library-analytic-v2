import { db, json, withWorkspace } from "@/lib/api";
import {
  computeComponentStatus,
  getLatestSnapshot,
  getPreviousSnapshot,
  getThresholds,
} from "@/lib/api-queries";

/**
 * GET /api/components/:id
 * Component detail scoped to the active workspace.
 *
 * Performance: queries only this component's data instead of loading
 * all 688 components via getComponentsWithUsage. Trend uses a single
 * groupBy instead of N per-snapshot queries.
 */
export const GET = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const [component, latest, previous, thresholds] = await Promise.all([
      db.component.findFirst({ where: { id, workspaceId: ctx.workspaceId } }),
      getLatestSnapshot(ctx.workspaceId),
      getPreviousSnapshot(ctx.workspaceId),
      getThresholds(ctx.workspaceId),
    ]);
    if (!component) return json({ error: "Component not found" }, 404);

    let totalInstances = 0;
    let filesUsed = 0;
    let lastSeen: Date | null = null;
    let prevInstances = 0;
    let fileUsage: {
      fileId: string;
      fileName: string;
      fileTeam: string;
      fileStatus: string;
      instances: number;
      page: string | null;
    }[] = [];

    if (latest) {
      const [agg, fileCountRow, usages, prevAgg] = await Promise.all([
        db.componentUsage.aggregate({
          where: { snapshotId: latest.id, componentId: id },
          _sum: { instances: true },
        }),
        db.$queryRaw<{ count: number }[]>`
          SELECT COUNT(DISTINCT "fileId") AS count
          FROM component_usages
          WHERE "snapshotId" = ${latest.id} AND "componentId" = ${id}
        `,
        db.componentUsage.findMany({
          where: { snapshotId: latest.id, componentId: id },
          include: { file: true },
        }),
        previous
          ? db.componentUsage.aggregate({
              where: { snapshotId: previous.id, componentId: id },
              _sum: { instances: true },
            })
          : Promise.resolve({ _sum: { instances: 0 } }),
      ]);

      totalInstances = agg._sum.instances ?? 0;
      filesUsed = Number(fileCountRow[0]?.count ?? 0);
      lastSeen = totalInstances > 0 ? latest.at : null;
      prevInstances = prevAgg._sum.instances ?? 0;

      fileUsage = usages
        .map((u) => ({
          fileId: u.file.id,
          fileName: u.file.name,
          fileTeam: u.file.team,
          fileStatus: u.file.disabled ? "Disabled" : "Tracked",
          instances: u.instances,
          page: u.page,
        }))
        .sort((a, b) => b.instances - a.instances);
    }

    // Trend: 2 queries instead of 7
    const snapshots = await db.snapshot.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { at: "asc" },
      take: 6,
    });
    const trendAgg = await db.componentUsage.groupBy({
      by: ["snapshotId"],
      where: { componentId: id, snapshotId: { in: snapshots.map((s) => s.id) } },
      _sum: { instances: true },
    });
    const trendMap = new Map(trendAgg.map((t) => [t.snapshotId, t._sum.instances ?? 0]));
    const trend = snapshots.map((s) => ({
      scan: s.label,
      instances: trendMap.get(s.id) ?? 0,
    }));

    return json({
      id: component.id,
      name: component.name,
      set: component.set,
      description: component.description,
      figmaNodeKey: component.figmaNodeKey,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
      totalInstances,
      filesUsed,
      status: computeComponentStatus(totalInstances, !!latest, thresholds.lowUsage),
      lastSeen,
      prevInstances,
      change: totalInstances - prevInstances,
      fileUsage,
      trend,
    });
  }
);
