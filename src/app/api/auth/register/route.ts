import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSession,
  hashPassword,
} from "@/lib/auth";
import { apiError, json } from "@/lib/api";
import { DEFAULT_WORKSPACE_SETTINGS } from "@/lib/workspace-defaults";

/**
 * POST /api/auth/register
 * Body: { email, password, name?, workspaceName? }
 * Creates a user and a personal workspace, then signs the user in.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name, workspaceName } = body as {
      email?: string;
      password?: string;
      name?: string;
      workspaceName?: string;
    };

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "A valid email is required." }, 400);
    }
    if (!password || password.length < 8) {
      return json({ error: "Password must be at least 8 characters." }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return json({ error: "An account with this email already exists." }, 409);
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash: hashPassword(password),
      },
    });

    const baseSlug =
      (workspaceName?.trim() || normalizedEmail.split("@")[0] || "workspace")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "workspace";
    let slug = baseSlug;
    let n = 1;
    while (await db.workspace.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const workspace = await db.workspace.create({
      data: {
        name: workspaceName?.trim() || `${name?.trim() || "My"} Workspace`,
        slug,
        members: { create: { userId: user.id, role: "owner" } },
      },
    });

    // Seed default settings so a brand-new workspace has thresholds + figma flag.
    for (const s of DEFAULT_WORKSPACE_SETTINGS) {
      await db.setting.create({ data: { workspaceId: workspace.id, ...s } });
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

    return json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: workspace.id,
        workspaceSlug: workspace.slug,
        workspaceName: workspace.name,
      },
      201
    );
  } catch (err) {
    return apiError(err);
  }
}
