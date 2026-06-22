import { json, withWorkspace } from "@/lib/api";
import { encryptSecret } from "@/lib/secret";
import { setWorkspaceSetting, clearWorkspaceSetting } from "@/lib/settings-store";

/**
 * PUT /api/settings/figma-token
 * Connect / replace the Figma PAT for the active workspace.
 * Stores a masked hint (never the full token) and sets figma_connected=true.
 */
export const PUT = withWorkspace(async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const { token } = body as { token?: string };
  if (!token || token.trim().length < 8) {
    return json(
      { error: "A valid Figma personal access token is required (min 8 chars)." },
      400
    );
  }
  const t = token.trim();
  const hint = t.length > 12 ? `${t.slice(0, 10)}••••${t.slice(-4)}` : "figma_pat_••••";

  await setWorkspaceSetting(ctx.workspaceId, "figma_connected", "true");
  await setWorkspaceSetting(ctx.workspaceId, "figma_token_hint", hint);
  await setWorkspaceSetting(ctx.workspaceId, "figma_token_encrypted", encryptSecret(t));

  return json({ ok: true, figmaConnected: true, figmaTokenHint: hint });
});

/**
 * DELETE /api/settings/figma-token
 */
export const DELETE = withWorkspace(async (_req, ctx) => {
  await setWorkspaceSetting(ctx.workspaceId, "figma_connected", "false");
  await setWorkspaceSetting(ctx.workspaceId, "figma_token_hint", "");
  await clearWorkspaceSetting(ctx.workspaceId, "figma_token_encrypted");
  return json({ ok: true, figmaConnected: false, figmaTokenHint: "" });
});
