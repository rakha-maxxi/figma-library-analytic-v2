const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type CacheResult<T> =
  | { hit: true; value: T }
  | { hit: false; value: null };

function enabled() {
  return Boolean(REST_URL && REST_TOKEN);
}

async function redisCommand<T>(command: unknown[]): Promise<T | null> {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${REST_URL}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${REST_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null) as { result?: T } | null;
    return body?.result ?? null;
  } catch {
    return null;
  }
}

export function cacheAvailable() {
  return enabled();
}

export function hashCachePart(value: unknown): string {
  const raw = JSON.stringify(value ?? {});
  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function workspaceCacheKey(workspaceId: string, name: string, parts: unknown[] = []) {
  const suffix = parts.length > 0 ? `:${hashCachePart(parts)}` : "";
  return `workspace:${workspaceId}:${name}${suffix}:v1`;
}

export async function getCache<T>(key: string): Promise<CacheResult<T>> {
  const raw = await redisCommand<string>(["GET", key]);
  if (!raw) return { hit: false, value: null };
  try {
    return { hit: true, value: JSON.parse(raw) as T };
  } catch {
    return { hit: false, value: null };
  }
}

export async function setCache(key: string, data: unknown, ttlSeconds: number) {
  const raw = JSON.stringify(data);
  if (raw.length > 512_000) return;
  await redisCommand(["SET", key, raw, "EX", ttlSeconds]);
}

export async function deleteCache(key: string) {
  await redisCommand(["DEL", key]);
}

export async function deleteByPattern(pattern: string) {
  if (!enabled()) return;
  let cursor = "0";
  let loops = 0;
  do {
    const result = await redisCommand<[string, string[]]>(["SCAN", cursor, "MATCH", pattern, "COUNT", "100"]);
    if (!result) return;
    cursor = result[0];
    const keys = result[1] ?? [];
    if (keys.length > 0) await redisCommand(["DEL", ...keys]);
    loops += 1;
  } while (cursor !== "0" && loops < 20);
}

export async function invalidateWorkspaceCache(workspaceId: string) {
  await deleteByPattern(`workspace:${workspaceId}:*`);
}

export async function invalidateWorkspaceScanCache(workspaceId: string) {
  await deleteByPattern(`workspace:${workspaceId}:scans:*`);
  await deleteByPattern(`workspace:${workspaceId}:snapshots:*`);
}
