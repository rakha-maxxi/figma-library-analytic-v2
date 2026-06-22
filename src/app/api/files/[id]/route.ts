import { db, json, withWorkspace } from "@/lib/api";
import { getFilesWithUsage, getLatestSnapshot } from "@/lib/api-queries";

/**
 * GET /api/files/:id
 * File detail scoped to the active workspace.
 */
export const GET = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const file = await db.registeredFile.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
    });
    if (!file) return json({ error: "File not found" }, 404);

    const allFiles = await getFilesWithUsage(ctx.workspaceId);
    const summary = allFiles.find((f) => f.id === id);
    const latest = await getLatestSnapshot(ctx.workspaceId);

    let componentsUsed: {
      componentId: string;
      componentName: string;
      componentSet: string;
      componentStatus: string;
      instances: number;
      page: string | null;
    }[] = [];
    if (latest) {
      const usages = await db.componentUsage.findMany({
        where: { snapshotId: latest.id, fileId: id },
        include: { component: true },
      });
      componentsUsed = usages
        .map((u) => ({
          componentId: u.component.id,
          componentName: u.component.name,
          componentSet: u.component.set,
          componentStatus: "Tracked",
          instances: u.instances,
          page: u.page,
          figmaNodeKey: u.component.figmaNodeKey,
        }))
        .sort((a, b) => b.instances - a.instances);
    }

    return json({
      id: file.id,
      name: file.name,
      url: file.url,
      figmaFileKey: file.figmaFileKey,
      team: file.team,
      disabled: file.disabled,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      totalInstances: summary?.totalInstances ?? 0,
      uniqueComponents: summary?.uniqueComponents ?? 0,
      status: summary?.status ?? "Not Scanned",
      lastScanned: summary?.lastScanned ?? null,
      componentsUsed,
    });
  }
);

/**
 * PATCH /api/files/:id
 * Update a file in the active workspace.
 */
export const PATCH = withWorkspace(
  async (req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { name, team, disabled } = body as {
      name?: string;
      team?: string;
      disabled?: boolean;
    };

    const existing = await db.registeredFile.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
    });
    if (!existing) return json({ error: "File not found" }, 404);

    const updated = await db.registeredFile.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(team !== undefined ? { team } : {}),
        ...(disabled !== undefined ? { disabled } : {}),
      },
    });
    return json(updated);
  }
);

/**
 * DELETE /api/files/:id
 * Remove a file from tracking in the active workspace.
 */
export const DELETE = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const existing = await db.registeredFile.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
    });
    if (!existing) return json({ error: "File not found" }, 404);
    await db.registeredFile.delete({ where: { id } });
    return json({ ok: true, id });
  }
);
