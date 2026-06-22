import { apiError, json } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    return json({ user });
  } catch (err) {
    return apiError(err);
  }
}
