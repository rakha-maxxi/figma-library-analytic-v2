import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { apiError, json } from "@/lib/api";

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      return json({ error: "Email and password are required." }, 400);
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { memberships: { include: { workspace: true } } },
    });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return json({ error: "Invalid email or password." }, 401);
    }

    const membership = user.memberships[0];
    if (!membership) {
      return json(
        { error: "This account is not associated with a workspace." },
        403
      );
    }

    const token = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return json({
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: membership.workspace.id,
      workspaceSlug: membership.workspace.slug,
      workspaceName: membership.workspace.name,
      role: membership.role,
    });
  } catch (err) {
    return apiError(err);
  }
}
