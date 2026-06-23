import { after } from "next/server";
import { db, json, withWorkspace } from "@/lib/api";
import { invalidateWorkspaceScanCache } from "@/lib/cache";
import { runScan } from "@/lib/scan-worker";

export const maxDuration = 300;

/**
 * GET /api/scans/:id
 * Scan detail scoped to the active workspace.
 */
export const GET = withWorkspace(
  async (_req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const scan = await db.scanJob.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
      include: { targetFile: true, snapshot: true, changes: true },
    });
    if (!scan) return json({ error: "Scan not found" }, 404);
    return json(scan);
  }
);

/**
 * PATCH /api/scans/:id — retry or resume.
 */
export const PATCH = withWorkspace(
  async (req, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: string };

    const scan = await db.scanJob.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
    });
    if (!scan) return json({ error: "Scan not found" }, 404);

    if (action === "retry" || action === "resume") {
      const updated = await db.scanJob.update({
        where: { id },
        data: { status: "Pending", error: null, startedAt: new Date() },
      });
      await invalidateWorkspaceScanCache(ctx.workspaceId);
      // Re-run after the response without relying on unsafe fire-and-forget promises.
      after(() => runScan(id));
      return json(updated);
    }

    return json(
      { error: "Unknown action. Use { action: 'retry' | 'resume' }" },
      400
    );
  }
);
