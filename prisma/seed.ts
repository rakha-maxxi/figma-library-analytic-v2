/**
 * Seed script for Componently.
 *
 * Creates a single demo user + a personal workspace — NO demo data.
 * New users should see an empty dashboard on first login and set up their
 * own source UI Kit + files before they can scan anything.
 *
 *  - demo@componently.app / demo1234
 *  - rakhacimano@gmail.com / Rakha123!
 *
 * Run: bun run db:seed (or: node --experimental-strip-types prisma/seed.ts)
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const db = new PrismaClient();

const DEFAULT_WORKSPACE_SETTINGS: { key: string; value: string }[] = [
  { key: "figma_connected", value: "false" },
  { key: "figma_token_hint", value: "" },
  { key: "low_usage_threshold", value: "500" },
  { key: "stale_days_threshold", value: "7" },
  { key: "auto_scan_enabled", value: "false" },
  { key: "preserve_on_failure", value: "true" },
];

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function ensureUser(input: { email: string; name: string; password: string }) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    console.log(`• user ${input.email} already exists — skipped`);
    return existing;
  }
  return db.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(input.password),
    },
  });
}

async function main() {
  console.log("🌱 Seeding Componently database (empty workspaces)…");

  // Clean slate
  await db.change.deleteMany();
  await db.componentUsage.deleteMany();
  await db.snapshot.deleteMany();
  await db.scanJob.deleteMany();
  await db.component.deleteMany();
  await db.registeredFile.deleteMany();
  await db.sourceUiKit.deleteMany();
  await db.setting.deleteMany();
  await db.session.deleteMany();
  await db.workspaceMember.deleteMany();
  await db.workspace.deleteMany();
  await db.user.deleteMany();

  /* ---------- Users ---------- */
  const users = await Promise.all([
    ensureUser({ email: "demo@componently.app", name: "Demo User", password: "demo1234" }),
    ensureUser({ email: "rakhacimano@gmail.com", name: "Rakha", password: "Rakha123!" }),
  ]);

  /* ---------- Workspaces (one per user) ---------- */
  for (const user of users) {
    const baseSlug = user.email.split("@")[0];
    const workspace = await db.workspace.create({
      data: {
        name: user.name ? `${user.name}'s Workspace` : "My Workspace",
        slug: `${baseSlug}-workspace`,
        members: { create: { userId: user.id, role: "owner" } },
      },
    });
    for (const s of DEFAULT_WORKSPACE_SETTINGS) {
      await db.setting.create({ data: { workspaceId: workspace.id, ...s } });
    }
  }

  console.log(`✅ Seeded ${users.length} user(s) with empty workspace(s). No demo data.`);
  console.log(`   sign in with:`);
  for (const u of users) {
    const password = u.email === "demo@componently.app" ? "demo1234" : "Rakha123!";
    console.log(`     - ${u.email} / ${password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
