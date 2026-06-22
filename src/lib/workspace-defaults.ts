/**
 * Default settings applied to every new workspace.
 * Used by the seed script and the /api/auth/register handler so that
 * freshly-created workspaces always have a consistent baseline.
 */
export const DEFAULT_WORKSPACE_SETTINGS: { key: string; value: string }[] = [
  { key: "figma_connected", value: "false" },
  { key: "figma_token_hint", value: "" },
  { key: "low_usage_threshold", value: "500" },
  { key: "stale_days_threshold", value: "7" },
  { key: "auto_scan_enabled", value: "false" },
  { key: "preserve_on_failure", value: "true" },
];
