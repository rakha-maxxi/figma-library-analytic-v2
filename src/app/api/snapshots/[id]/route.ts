import { db, json, withWorkspace } from "@/lib/api";

/**
 * GET /api/snapshots/:id
 */
export const GET = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const snapshot = await db.snapshot.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
      include: { scanJob: true },
    });
    if (!snapshot) return json({ error: "Snapshot not found" }, 404);

    const usages = await db.componentUsage.findMany({
      where: { snapshotId: id },
      include: { component: true, file: true },
      orderBy: { instances: "desc" },
    });

    return json({
      id: snapshot.id,
      label: snapshot.label,
      at: snapshot.at,
      filesScanned: snapshot.filesScanned,
      totalInstances: snapshot.totalInstances,
      componentsUsed: snapshot.componentsUsed,
      scanJob: {
        id: snapshot.scanJob.id,
        status: snapshot.scanJob.status,
        scope: snapshot.scanJob.scope,
        startedAt: snapshot.scanJob.startedAt,
        finishedAt: snapshot.scanJob.finishedAt,
      },
      usages: usages.map((u) => ({
        componentId: u.componentId,
        componentName: u.component.name,
        componentSet: u.component.set,
        fileId: u.fileId,
        fileName: u.file.name,
        instances: u.instances,
        page: u.page,
      })),
    });
  }
);
