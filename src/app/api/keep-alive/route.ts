import { db } from "@/lib/db";

/**
 * GET /api/keep-alive
 * Lightweight DB ping to prevent Neon free-tier auto-suspend.
 * Set up an external cron (UptimeRobot, cron-job.org) to hit this
 * endpoint every 4 minutes.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  await db.user.count();
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
