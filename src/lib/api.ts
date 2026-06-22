import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dbMetrics, type DbMetricStore } from "@/lib/db";
import { AuthError, getCurrentUser } from "@/lib/auth";
import { cacheAvailable, getCache, setCache } from "@/lib/cache";

/**
 * Helpers for App Router API handlers.
 *
 *  - `withWorkspace(handler)` resolves the active user + workspace and passes
 *    them to the handler. Authed users are guaranteed to be present.
 *  - `apiError(err)` converts thrown errors into uniform JSON responses.
 *  - `requireWorkspaceUser()` is a thin wrapper for handlers that don't use
 *    the higher-order helper (e.g. nested route handlers that want explicit
 *    control).
 */

export type WorkspaceContext = {
  workspaceId: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
};

export async function requireWorkspaceUser(): Promise<WorkspaceContext> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return {
    workspaceId: user.workspaceId,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Higher-order wrapper. Use as:
 *
 *   export const GET = withWorkspace(async (_req, ctx) => {
 *     // ctx.workspaceId is always defined
 *   });
 */
export function withWorkspace<Args extends unknown[]>(
  handler: (req: Request, ctx: WorkspaceContext, ...args: Args) => Promise<Response>
) {
  return async (req: Request, ...args: Args): Promise<Response> => {
    const start = Date.now();
    const metrics: DbMetricStore = { count: 0, slow: [] };
    let response: Response;
    try {
      const ctx = await requireWorkspaceUser();
      response = await dbMetrics.run(metrics, () => handler(req, ctx, ...args));
    } catch (err) {
      response = apiError(err);
    }

    logApiMetrics(req, response, start, metrics);
    return response;
  };
}

function logApiMetrics(req: Request, res: Response, start: number, metrics: DbMetricStore) {
  const url = new URL(req.url);
  const duration = Date.now() - start;
  const payload = res.headers.get("content-length") ?? "?";
  const cache = res.headers.get("x-componently-cache") ?? "bypass";
  const slow = metrics.slow.length > 0 ? ` slow=${metrics.slow.join(" | ")}` : "";
  console.log(`[api] ${req.method} ${url.pathname} ${duration}ms db=${metrics.count} cache=${cache} payload=${payload}${slow}`);
}

export function json(data: unknown, status = 200, init?: ResponseInit) {
  const raw = JSON.stringify(data);
  const headers = new Headers(init?.headers);
  headers.set("content-length", String(Buffer.byteLength(raw)));
  headers.set("content-type", "application/json");
  return new NextResponse(raw, { ...init, status, headers });
}

export async function cachedJson<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>
) {
  if (!cacheAvailable()) {
    return json(await load(), 200, { headers: { "x-componently-cache": "bypass" } });
  }

  const cached = await getCache<T>(key);
  if (cached.hit) {
    return json(cached.value, 200, { headers: { "x-componently-cache": "hit" } });
  }

  const data = await load();
  await setCache(key, data, ttlSeconds);
  return json(data, 200, { headers: { "x-componently-cache": "miss" } });
}

export function apiError(err: unknown): Response {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err && typeof err === "object" && "issues" in err) {
    // zod-style validation errors
    return NextResponse.json(
      { error: "Invalid request", details: (err as any).issues },
      { status: 400 }
    );
  }
  console.error("[api] unexpected error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Re-export Prisma db so route files can import everything from one place. */
export { db };

/** Query-string helpers. */
export function qs(value: string | null, fallback = ""): string {
  return value ?? fallback;
}

export function qi(value: string | null, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
