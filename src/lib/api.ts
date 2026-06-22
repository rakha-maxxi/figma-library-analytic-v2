import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AuthError, getCurrentUser } from "@/lib/auth";

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
    try {
      const ctx = await requireWorkspaceUser();
      return await handler(req, ctx, ...args);
    } catch (err) {
      return apiError(err);
    }
  };
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
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
