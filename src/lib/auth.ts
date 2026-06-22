import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

/**
 * Session-cookie auth.
 *
 *  - Passwords: scrypt + per-user salt, stored as `salt:hash`.
 *  - Sessions: random token, hashed in DB. Cookie holds the raw token.
 *  - Cookie name: "componently_session".
 *  - Default TTL: 30 days, sliding (extended on each read).
 */

export const SESSION_COOKIE = "componently_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export { hashPassword, verifyPassword };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { userId, tokenHash, expiresAt } });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await db.session.deleteMany({ where: { tokenHash } });
}

export type AuthedUser = {
  id: string;
  email: string;
  name: string | null;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  role: string;
};

/**
 * Read the session cookie, validate it, and resolve the active user + workspace.
 * Returns null when the visitor is not signed in or the session is invalid.
 * Sliding-expiration: each successful read bumps `expiresAt`.
 */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          memberships: { include: { workspace: true } },
        },
      },
    },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const membership = session.user.memberships[0];
  if (!membership) return null;

  // Sliding expiration: extend if more than half the TTL has passed.
  const halfTtl = SESSION_TTL_MS / 2;
  if (session.expiresAt.getTime() - Date.now() < halfTtl) {
    await db.session
      .update({
        where: { id: session.id },
        data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
      })
      .catch(() => {});
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    workspaceId: membership.workspace.id,
    workspaceSlug: membership.workspace.slug,
    workspaceName: membership.workspace.name,
    role: membership.role,
  };
}

/** Throw a 401-friendly error. Use inside API handlers. */
export class AuthError extends Error {
  status: number;
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return user;
}
