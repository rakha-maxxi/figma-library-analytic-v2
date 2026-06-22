import { db, cachedJson, json, qi, qs, withWorkspace } from "@/lib/api";
import { invalidateWorkspaceCache, workspaceCacheKey } from "@/lib/cache";
import { getFilesWithUsage } from "@/lib/api-queries";

/**
 * GET /api/files
 * Query params:
 *   search — filter by name or team
 *   status — Healthy | Low Adoption | Zero Usage | Failed | Stale | Not Scanned | Disabled
 */
export const GET = withWorkspace(async (req, ctx) => {
  const url = new URL(req.url);
  const search = qs(url.searchParams.get("search")).toLowerCase();
  const status = qs(url.searchParams.get("status"), "All");
  const limit = Math.min(qi(url.searchParams.get("limit"), 100), 250);
  const offset = Math.max(qi(url.searchParams.get("offset"), 0), 0);

  const cacheKey = workspaceCacheKey(ctx.workspaceId, "files:list", [search, status, limit, offset]);
  return cachedJson(cacheKey, 120, async () => {
  let files = await getFilesWithUsage(ctx.workspaceId);

  if (search) {
    files = files.filter(
      (f) =>
        f.name.toLowerCase().includes(search) ||
        f.team.toLowerCase().includes(search)
    );
  }
  if (status !== "All") {
    files = files.filter((f) => f.status === status);
  }

  const total = files.length;
  const items = files.slice(offset, offset + limit);
  return { total, limit, offset, hasMore: offset + items.length < total, items };
  });
});

/**
 * POST /api/files
 * Register one or more Figma files in the active workspace.
 * Body: { files: [{ name, figmaFileKey, url, team? }] }
 */
export const POST = withWorkspace(async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const input = (body as { files?: any[] })?.files;
  if (!Array.isArray(input) || input.length === 0) {
    return json({ error: "files array is required" }, 400);
  }

  const added: any[] = [];
  const skipped: { item: any; reason: string }[] = [];

  for (const item of input) {
    const { name, figmaFileKey, url, team } = item ?? {};
    if (!name || !figmaFileKey || !url) {
      skipped.push({ item, reason: "missing required fields (name, figmaFileKey, url)" });
      continue;
    }
    const existing = await db.registeredFile.findUnique({
      where: {
        workspaceId_figmaFileKey: {
          workspaceId: ctx.workspaceId,
          figmaFileKey,
        },
      },
    });
    if (existing) {
      skipped.push({ item, reason: "file already registered" });
      continue;
    }
    const created = await db.registeredFile.create({
      data: {
        workspaceId: ctx.workspaceId,
        name,
        figmaFileKey,
        url,
        team: team ?? "",
      },
    });
    added.push(created);
  }

  await invalidateWorkspaceCache(ctx.workspaceId);
  return json({ added: added.length, skipped, items: added }, 201);
});
