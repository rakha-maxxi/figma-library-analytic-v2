import { db, json, qs, withWorkspace } from "@/lib/api";
import { runScan, triggerScanInBackground } from "@/lib/scan-worker";

/** Auto-recover scans stuck in Pending/Running for more than 5 minutes. */
async function recoverStuckScans(workspaceId: string) {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  await db.scanJob.updateMany({
    where: {
      workspaceId,
      status: { in: ["Pending", "Running"] },
      startedAt: { lt: fiveMinAgo },
    },
    data: {
      status: "Failed",
      error: "Scan timed out (serverless function was likely killed before completion).",
      finishedAt: new Date(),
      durationMs: 5 * 60 * 1000,
    },
  });
}

/**
 * GET /api/scans
 * Query params:
 *   status — Pending | Running | Success | Failed | Paused
 *   scope  — all | single
 *   limit  — default 50
 */
export const GET = withWorkspace(async (req, ctx) => {
  await recoverStuckScans(ctx.workspaceId);

  const url = new URL(req.url);
  const status = qs(url.searchParams.get("status"), "All");
  const scope = qs(url.searchParams.get("scope"), "All");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);

  const where: any = { workspaceId: ctx.workspaceId };
  if (status !== "All") where.status = status;
  if (scope !== "All") where.scope = scope;

  const scans = await db.scanJob.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { targetFile: true, snapshot: true },
  });

  return json({
    total: scans.length,
    items: scans.map((s) => ({
      id: s.id,
      label: s.snapshot?.label ?? `Job ${s.id.slice(-6)}`,
      scope: s.scope,
      status: s.status,
      startedAt: s.startedAt,
      finishedAt: s.finishedAt,
      durationMs: s.durationMs,
      filesOk: s.filesOk,
      filesFailed: s.filesFailed,
      error: s.error,
      target: s.scope === "single" ? s.targetFile?.name ?? "Unknown" : "All files",
      targetFileId: s.targetFileId,
      snapshot: s.snapshot
        ? {
            id: s.snapshot.id,
            label: s.snapshot.label,
            at: s.snapshot.at,
            filesScanned: s.snapshot.filesScanned,
            totalInstances: s.snapshot.totalInstances,
            componentsUsed: s.snapshot.componentsUsed,
          }
        : null,
    })),
  });
});

/**
 * POST /api/scans
 * Body: { scope: "all" | "single", targetFileId?: string }
 */
export const POST = withWorkspace(async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const { scope, targetFileId } = body as {
    scope?: string;
    targetFileId?: string;
  };

  if (scope !== "all" && scope !== "single") {
    return json({ error: "scope must be 'all' or 'single'" }, 400);
  }
  if (scope === "single") {
    if (!targetFileId) {
      return json({ error: "targetFileId is required for single-file scans" }, 400);
    }
    // Ensure the target file belongs to this workspace
    const target = await db.registeredFile.findFirst({
      where: { id: targetFileId, workspaceId: ctx.workspaceId },
    });
    if (!target) {
      return json({ error: "targetFileId not found in this workspace" }, 404);
    }
  }

  const count = await db.scanJob.count({ where: { workspaceId: ctx.workspaceId } });
  const job = await db.scanJob.create({
    data: {
      workspaceId: ctx.workspaceId,
      scope,
      targetFileId: scope === "single" ? targetFileId : null,
      status: "Pending",
    },
  });

  // Run the worker in the background. The POST returns immediately so the
  // dashboard can poll /api/scans and watch Pending → Running → Success.
  triggerScanInBackground(job.id);

  return json(
    {
      id: job.id,
      scope: job.scope,
      status: job.status,
      startedAt: job.startedAt,
      label: `Scan #${count + 1}`,
    },
    201
  );
});
