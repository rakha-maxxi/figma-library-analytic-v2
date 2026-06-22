import { getComponentsWithUsage } from "@/lib/api-queries";
import { cachedJson, qi, qs, withWorkspace } from "@/lib/api";
import { workspaceCacheKey } from "@/lib/cache";

/**
 * GET /api/components
 * Query params:
 *   search — filter by name or set (case-insensitive)
 *   status — Active | Low Usage | Unused | Not Scanned
 *   set    — filter by component set
 *   sort   — instances | files | name | seen (default: instances)
 *   dir    — asc | desc (default: desc; asc for name)
 */
export const GET = withWorkspace(async (req, ctx) => {
  const url = new URL(req.url);
  const search = qs(url.searchParams.get("search")).toLowerCase();
  const status = qs(url.searchParams.get("status"), "All");
  const setFilter = qs(url.searchParams.get("set"), "All");
  const sort = qs(url.searchParams.get("sort"), "instances") as
    | "instances"
    | "files"
    | "name"
    | "seen";
  const dir = qs(url.searchParams.get("dir"), "desc") as "asc" | "desc";
  const limit = Math.min(qi(url.searchParams.get("limit"), 100), 250);
  const offset = Math.max(qi(url.searchParams.get("offset"), 0), 0);

  const cacheKey = workspaceCacheKey(ctx.workspaceId, "components:list", [search, status, setFilter, sort, dir, limit, offset]);
  return cachedJson(cacheKey, 120, async () => {
  let components = await getComponentsWithUsage(ctx.workspaceId);

  if (search) {
    components = components.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.set.toLowerCase().includes(search)
    );
  }
  if (status !== "All") {
    components = components.filter((c) => c.status === status);
  }
  if (setFilter !== "All") {
    components = components.filter((c) => c.set === setFilter);
  }

  components = [...components].sort((a, b) => {
    let cmp = 0;
    if (sort === "instances") cmp = a.totalInstances - b.totalInstances;
    else if (sort === "files") cmp = a.filesUsed - b.filesUsed;
    else if (sort === "name") cmp = a.name.localeCompare(b.name);
    else if (sort === "seen") {
      cmp = (a.lastSeen?.getTime() ?? 0) - (b.lastSeen?.getTime() ?? 0);
    }
    return dir === "asc" ? cmp : -cmp;
  });

  const total = components.length;
  const items = components.slice(offset, offset + limit);

  return {
    total,
    limit,
    offset,
    hasMore: offset + items.length < total,
    items,
  };
  });
});
