import { db, json, withWorkspace } from "@/lib/api";

const DEFAULTS: Record<string, string> = {
  figma_connected: "true",
  figma_token_hint: "",
  low_usage_threshold: "500",
  stale_days_threshold: "7",
  auto_scan_enabled: "false",
  preserve_on_failure: "true",
};

async function loadSettings(workspaceId: string) {
  const rows = await db.setting.findMany({ where: { workspaceId } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const merged = { ...DEFAULTS, ...map };
  return {
    figmaConnected: merged.figma_connected === "true",
    figmaTokenHint: merged.figma_token_hint,
    lowUsageThreshold: Number(merged.low_usage_threshold),
    staleDaysThreshold: Number(merged.stale_days_threshold),
    autoScanEnabled: merged.auto_scan_enabled === "true",
    preserveOnFailure: merged.preserve_on_failure === "true",
  };
}

/**
 * GET /api/settings
 */
export const GET = withWorkspace(async (_req, ctx) => {
  return json(await loadSettings(ctx.workspaceId));
});

/**
 * PUT /api/settings
 */
export const PUT = withWorkspace(async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const updates: { key: string; value: string }[] = [];

  if (typeof body.figmaConnected === "boolean")
    updates.push({ key: "figma_connected", value: String(body.figmaConnected) });
  if (typeof body.figmaTokenHint === "string")
    updates.push({ key: "figma_token_hint", value: body.figmaTokenHint });
  if (typeof body.lowUsageThreshold === "number")
    updates.push({ key: "low_usage_threshold", value: String(body.lowUsageThreshold) });
  if (typeof body.staleDaysThreshold === "number")
    updates.push({ key: "stale_days_threshold", value: String(body.staleDaysThreshold) });
  if (typeof body.autoScanEnabled === "boolean")
    updates.push({ key: "auto_scan_enabled", value: String(body.autoScanEnabled) });
  if (typeof body.preserveOnFailure === "boolean")
    updates.push({ key: "preserve_on_failure", value: String(body.preserveOnFailure) });

  for (const u of updates) {
    await db.setting.upsert({
      where: {
        workspaceId_key: { workspaceId: ctx.workspaceId, key: u.key },
      },
      update: { value: u.value },
      create: { workspaceId: ctx.workspaceId, key: u.key, value: u.value },
    });
  }

  return json(await loadSettings(ctx.workspaceId));
});
