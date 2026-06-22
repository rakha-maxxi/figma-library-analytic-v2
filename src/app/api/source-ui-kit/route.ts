import { db, json, withWorkspace } from "@/lib/api";
import { importSourceUiKitComponents } from "@/lib/figma-importer";

type SourceUiKitWithCount = NonNullable<Awaited<ReturnType<typeof db.sourceUiKit.findFirst>>> & {
  _count: { components: number };
};

function sourceUiKitPayload(kit: SourceUiKitWithCount) {
  return {
    id: kit.id,
    fileName: kit.fileName,
    figmaFileKey: kit.figmaFileKey,
    url: kit.url,
    componentCount: kit.componentCount,
    connectedAt: kit.connectedAt,
    lastSyncedAt: kit.lastSyncedAt,
    actualComponentCount: kit._count.components,
  };
}

/**
 * GET /api/source-ui-kit
 * Returns the active workspace's source UI Kit (or 404).
 */
export const GET = withWorkspace(async (_req, ctx) => {
  const kit = await db.sourceUiKit.findFirst({
    where: { workspaceId: ctx.workspaceId },
    include: { _count: { select: { components: true } } },
    orderBy: { connectedAt: "desc" },
  });
  if (!kit) return json({ error: "No source UI Kit registered" }, 404);
  return json(sourceUiKitPayload(kit));
});

/**
 * POST /api/source-ui-kit
 * Register or replace the source UI Kit for the active workspace.
 * The existing component inventory is re-assigned to the new kit so historical
 * snapshots/usage remain valid.
 */
export const POST = withWorkspace(async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const { fileName, figmaFileKey, url } = body as {
    fileName?: string;
    figmaFileKey?: string;
    url?: string;
  };

  if (!fileName || !figmaFileKey || !url) {
    return json({ error: "fileName, figmaFileKey, and url are required" }, 400);
  }

  const existingByKey = await db.sourceUiKit.findUnique({
    where: { workspaceId_figmaFileKey: { workspaceId: ctx.workspaceId, figmaFileKey } },
  });
  if (existingByKey) {
    try {
      await importSourceUiKitComponents({
        workspaceId: ctx.workspaceId,
        sourceUiKitId: existingByKey.id,
        figmaFileKey,
      });
    } catch (err) {
      return json(
        { error: err instanceof Error ? err.message : "Failed to import source UI Kit components." },
        400
      );
    }
    const refreshed = await db.sourceUiKit.findUnique({
      where: { id: existingByKey.id },
      include: { _count: { select: { components: true } } },
    });
    if (!refreshed) return json({ error: "Source UI Kit not found after refresh." }, 404);
    return json(sourceUiKitPayload(refreshed));
  }

  const oldKit = await db.sourceUiKit.findFirst({
    where: { workspaceId: ctx.workspaceId },
  });
  const kit = await db.sourceUiKit.create({
    data: {
      workspaceId: ctx.workspaceId,
      fileName,
      figmaFileKey,
      url,
      componentCount: 0,
      lastSyncedAt: new Date(),
    },
  });

  try {
    await importSourceUiKitComponents({
      workspaceId: ctx.workspaceId,
      sourceUiKitId: kit.id,
      figmaFileKey,
    });
  } catch (err) {
    await db.sourceUiKit.delete({ where: { id: kit.id } }).catch(() => {});
    return json(
      { error: err instanceof Error ? err.message : "Failed to import source UI Kit components." },
      400
    );
  }

  if (oldKit) {
    await db.sourceUiKit.delete({ where: { id: oldKit.id } });
  }

  const refreshed = await db.sourceUiKit.findUnique({
    where: { id: kit.id },
    include: { _count: { select: { components: true } } },
  });
  if (!refreshed) return json({ error: "Source UI Kit not found after import." }, 404);
  return json(sourceUiKitPayload(refreshed), 201);
});

/**
 * PATCH /api/source-ui-kit
 * Refresh source UI Kit component inventory from Figma.
 */
export const PATCH = withWorkspace(async (_req, ctx) => {
  const kit = await db.sourceUiKit.findFirst({
    where: { workspaceId: ctx.workspaceId },
  });
  if (!kit) return json({ error: "No source UI Kit registered" }, 404);

  try {
    await importSourceUiKitComponents({
      workspaceId: ctx.workspaceId,
      sourceUiKitId: kit.id,
      figmaFileKey: kit.figmaFileKey,
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Failed to refresh source UI Kit components." },
      400
    );
  }

  const updated = await db.sourceUiKit.findUnique({
    where: { id: kit.id },
    include: { _count: { select: { components: true } } },
  });
  if (!updated) return json({ error: "Source UI Kit not found after refresh." }, 404);
  return json(sourceUiKitPayload(updated));
});
