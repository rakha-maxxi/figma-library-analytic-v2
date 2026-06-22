import { db, json, withWorkspace } from "@/lib/api";
import {
  getComponentsWithUsage,
  getLatestSnapshot,
  getPreviousSnapshot,
} from "@/lib/api-queries";

/**
 * GET /api/components/:id
 * Component detail scoped to the active workspace.
 */
export const GET = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const component = await db.component.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
    });
    if (!component) return json({ error: "Component not found" }, 404);

    const allComponents = await getComponentsWithUsage(ctx.workspaceId);
    const summary = allComponents.find((c) => c.id === id);
    const latest = await getLatestSnapshot(ctx.workspaceId);
    const previous = await getPreviousSnapshot(ctx.workspaceId);

    let fileUsage: {
      fileId: string;
      fileName: string;
      fileTeam: string;
      fileStatus: string;
      instances: number;
      page: string | null;
    }[] = [];
    if (latest) {
      const usages = await db.componentUsage.findMany({
        where: { snapshotId: latest.id, componentId: id },
        include: { file: true },
      });
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

    const snapshots = await db.snapshot.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { at: "asc" },
      take: 6,
    });
    const trend: { scan: string; instances: number }[] = [];
    for (const s of snapshots) {
      const agg = await db.componentUsage.aggregate({
        where: { snapshotId: s.id, componentId: id },
        _sum: { instances: true },
      });
      trend.push({ scan: s.label, instances: agg._sum.instances ?? 0 });
    }

    return json({
      id: component.id,
      name: component.name,
      set: component.set,
      description: component.description,
      figmaNodeKey: component.figmaNodeKey,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
      totalInstances: summary?.totalInstances ?? 0,
      filesUsed: summary?.filesUsed ?? 0,
      status: summary?.status ?? "Not Scanned",
      lastSeen: summary?.lastSeen ?? null,
      prevInstances: summary?.prevInstances ?? 0,
      change: (summary?.totalInstances ?? 0) - (summary?.prevInstances ?? 0),
      fileUsage,
      trend,
    });
  }
);
