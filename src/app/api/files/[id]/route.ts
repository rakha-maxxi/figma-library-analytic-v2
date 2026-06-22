import { db, json, withWorkspace } from "@/lib/api";
import { getCache, invalidateWorkspaceCache, setCache, workspaceCacheKey } from "@/lib/cache";
import {
  computeFileStatus,
  getLatestSnapshot,
  getThresholds,
} from "@/lib/api-queries";

/**
 * GET /api/files/:id
 * File detail scoped to the active workspace.
 *
 * Performance: queries only this file's data instead of loading all
 * files via getFilesWithUsage.
 */
export const GET = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const cacheKey = workspaceCacheKey(ctx.workspaceId, "files:detail", [id]);
    const cached = await getCache(cacheKey);
    if (cached.hit) return json(cached.value, 200, { headers: { "x-componently-cache": "hit" } });

    const [file, latest, thresholds] = await Promise.all([
      db.registeredFile.findFirst({ where: { id, workspaceId: ctx.workspaceId } }),
      getLatestSnapshot(ctx.workspaceId),
      getThresholds(ctx.workspaceId),
    ]);
    if (!file) return json({ error: "File not found" }, 404);

    let totalInstances = 0;
    let uniqueComponents = 0;
    let componentsUsed: {
      componentId: string;
      componentName: string;
      componentSet: string;
      componentStatus: string;
      instances: number;
      page: string | null;
    }[] = [];

    const [lastSingleScan, lastAllScan] = await Promise.all([
      db.scanJob.findFirst({
        where: { workspaceId: ctx.workspaceId, scope: "single", targetFileId: id },
        orderBy: { startedAt: "desc" },
      }),
      db.scanJob.findFirst({
        where: { workspaceId: ctx.workspaceId, scope: "all", status: "Success" },
        orderBy: { startedAt: "desc" },
      }),
    ]);

    if (latest) {
      const [agg, usages] = await Promise.all([
        db.$queryRaw<{ totalInstances: number; uniqueComponents: number }[]>`
          SELECT SUM(instances) AS "totalInstances", COUNT(DISTINCT "componentId") AS "uniqueComponents"
          FROM component_usages
          WHERE "snapshotId" = ${latest.id} AND "fileId" = ${id}
        `,
        db.componentUsage.findMany({
          where: { snapshotId: latest.id, fileId: id },
          include: { component: true },
        }),
      ]);

      totalInstances = Number(agg[0]?.totalInstances ?? 0);
      uniqueComponents = Number(agg[0]?.uniqueComponents ?? 0);

      componentsUsed = usages
        .map((u) => ({
          componentId: u.component.id,
          componentName: u.component.name,
          componentSet: u.component.set,
          componentStatus: "Tracked",
          instances: u.instances,
          page: u.page,
        }))
        .sort((a, b) => b.instances - a.instances);
    }

    const lastScanned = lastSingleScan?.finishedAt ?? lastAllScan?.finishedAt ?? null;
    const hasFailed = lastSingleScan?.status === "Failed";

    const payload = {
      id: file.id,
      name: file.name,
      url: file.url,
      figmaFileKey: file.figmaFileKey,
      team: file.team,
      disabled: file.disabled,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      totalInstances,
      uniqueComponents,
      status: computeFileStatus(uniqueComponents, lastScanned, hasFailed, thresholds.staleDays, file.disabled),
      lastScanned,
      componentsUsed,
    };
    await setCache(cacheKey, payload, 120);
    return json(payload, 200, { headers: { "x-componently-cache": "miss" } });
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
    await invalidateWorkspaceCache(ctx.workspaceId);
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
    await invalidateWorkspaceCache(ctx.workspaceId);
    return json({ ok: true, id });
  }
);
