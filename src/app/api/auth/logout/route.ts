import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession, getCurrentUser } from "@/lib/auth";
import { apiError, json } from "@/lib/api";

/**
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) await destroySession(token);
    cookieStore.delete(SESSION_COOKIE);
    return json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
