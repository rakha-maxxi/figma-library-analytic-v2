import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Reversible encryption for local secret storage.
 *
 * SQLite is local for this app, but we still avoid storing the raw Figma PAT.
 * Set COMPONENTLY_SECRET in production. In dev, a stable fallback keeps local
 * login usable across restarts.
 */

const SECRET = process.env.COMPONENTLY_SECRET || "componently-local-dev-secret";
const KEY = createHash("sha256").update(SECRET).digest();

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptSecret(value: string): string | null {
  try {
    const [ivRaw, tagRaw, dataRaw] = value.split(":");
    if (!ivRaw || !tagRaw || !dataRaw) return null;
    const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivRaw, "base64"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataRaw, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
