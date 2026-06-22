import { db } from "@/lib/db";

export async function getWorkspaceSetting(workspaceId: string, key: string): Promise<string | null> {
  const row = await db.setting.findUnique({
    where: { workspaceId_key: { workspaceId, key } },
  });
  return row?.value ?? null;
}

export async function setWorkspaceSetting(workspaceId: string, key: string, value: string) {
  return db.setting.upsert({
    where: { workspaceId_key: { workspaceId, key } },
    update: { value },
    create: { workspaceId, key, value },
  });
}

export async function clearWorkspaceSetting(workspaceId: string, key: string) {
  await db.setting.deleteMany({ where: { workspaceId, key } });
}
