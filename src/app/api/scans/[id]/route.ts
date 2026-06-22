import { db, json, withWorkspace } from "@/lib/api";
import { triggerScanInBackground } from "@/lib/scan-worker";

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
      // Re-run the worker in the background.
      triggerScanInBackground(id);
      return json(updated);
    }

    return json(
      { error: "Unknown action. Use { action: 'retry' | 'resume' }" },
      400
    );
  }
);
