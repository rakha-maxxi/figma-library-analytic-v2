import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Pure-node password helpers, safe to import from any context
 * (including the seed script, which is run outside Next.js).
 *
 * Format: `salt:hash` (hex). Verified with timingSafeEqual.
 */

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
