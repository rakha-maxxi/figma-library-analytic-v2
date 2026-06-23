import { db } from "@/lib/db";
import { invalidateWorkspaceCache, invalidateWorkspaceScanCache } from "@/lib/cache";
import { importSourceUiKitComponents } from "@/lib/figma-importer";
import { decryptSecret } from "@/lib/secret";
import { getWorkspaceSetting } from "@/lib/settings-store";

async function getFigmaToken(workspaceId: string): Promise<string | null> {
  const encrypted = await getWorkspaceSetting(workspaceId, "figma_token_encrypted");
  return encrypted ? decryptSecret(encrypted) : null;
}

type FigmaComponentMetadata = {
  key?: string;
  name?: string;
  node_id?: string;
  componentSetId?: string;
};

type FigmaFileResponse = {
  document?: FigmaDocument;
  components?: Record<string, FigmaComponentMetadata>;
};

async function fetchFigmaFile(figmaFileKey: string, figmaToken: string): Promise<FigmaFileResponse | null> {
  const res = await fetch(
    `https://api.figma.com/v1/files/${encodeURIComponent(figmaFileKey)}`,
    { headers: { "X-Figma-Token": figmaToken }, cache: "no-store", signal: AbortSignal.timeout(45_000) }
  );
  if (!res.ok) return null;
  return res.json() as Promise<FigmaFileResponse>;
}

function normalizeFigmaNodeId(value: string): string {
  const trimmed = value.trim();
  return /^\d+-\d+/.test(trimmed) ? trimmed.replace(/-/g, ":") : trimmed;
}

function addLookupKey(map: Map<string, string>, key: string | null | undefined, componentId: string) {
  if (!key) return;
  const trimmed = key.trim();
  if (!trimmed) return;
  map.set(trimmed, componentId);
  map.set(normalizeFigmaNodeId(trimmed), componentId);
}

function resolveComponentId(
  figmaComponentId: string,
  componentLookup: Map<string, string>,
  componentMetadata: Record<string, FigmaComponentMetadata> | undefined
): string | null {
  const direct = componentLookup.get(figmaComponentId) ?? componentLookup.get(normalizeFigmaNodeId(figmaComponentId));
  if (direct) return direct;

  const metadata = componentMetadata?.[figmaComponentId] ?? componentMetadata?.[normalizeFigmaNodeId(figmaComponentId)];
  if (!metadata) return null;

  const fromKey = metadata.key ? componentLookup.get(metadata.key) : undefined;
  if (fromKey) return fromKey;

  const fromNode = metadata.node_id
    ? componentLookup.get(metadata.node_id) ?? componentLookup.get(normalizeFigmaNodeId(metadata.node_id))
    : undefined;
  return fromNode ?? null;
}

function aggregateUsagesByComponentFile(usages: { componentId: string; fileId: string; instances: number }[]) {
  const map = new Map<string, number>();
  for (const usage of usages) {
    const key = `${usage.componentId}|${usage.fileId}`;
    map.set(key, (map.get(key) ?? 0) + usage.instances);
  }
  return map;
}

/**
 * Walk a Figma file's document tree and count INSTANCE nodes whose
 * componentId matches a known UI Kit component key.
 */
function walkFileForInstances(
  document: FigmaDocument,
  componentLookup: Map<string, string>,
  componentMetadata: Record<string, FigmaComponentMetadata> | undefined,
): { componentId: string; instances: number; page: string }[] {
  const result = new Map<string, { componentId: string; instances: number; page: string }>();

  function walk(node: FigmaDocNode, pageName: string) {
    const currentPage = node.type === "CANVAS" ? node.name : pageName;

    if (node.type === "INSTANCE" && node.componentId) {
      const componentId = resolveComponentId(node.componentId, componentLookup, componentMetadata);
      if (!componentId) {
        if (node.children) {
          for (const child of node.children) {
            walk(child, currentPage);
          }
        }
        return;
      }

      const key = `${componentId}|${currentPage}`;
      const existing = result.get(key);
      if (existing) {
        existing.instances++;
      } else {
        result.set(key, {
          componentId,
          instances: 1,
          page: currentPage,
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        walk(child, currentPage);
      }
    }
  }

  if (document.children) {
    for (const page of document.children) {
      walk(page, page.name);
    }
  }

  return Array.from(result.values());
}

type FigmaDocNode = {
  id: string;
  name: string;
  type: string;
  componentId?: string;
  children?: FigmaDocNode[];
};

type FigmaDocument = {
  name: string;
  children: FigmaDocNode[];
};

export type ScanRunResult = {
  scanJobId: string;
  status: "Success" | "Failed";
  filesOk: number;
  filesFailed: number;
  snapshotId: string | null;
  error?: string;
};

type UsageRow = { componentId: string; fileId: string; instances: number; page: string | null };

export async function runScan(scanJobId: string): Promise<ScanRunResult> {
  const job = await db.scanJob.findUnique({
    where: { id: scanJobId },
    include: { targetFile: true },
  });
  if (!job) {
    return { scanJobId, status: "Failed", filesOk: 0, filesFailed: 0, snapshotId: null, error: "scan job not found" };
  }

  // Mark as Running.
  await db.scanJob.update({
    where: { id: job.id },
    data: { status: "Running", error: null },
  });

  try {
    let components = await db.component.findMany({
      where: { workspaceId: job.workspaceId },
      orderBy: { name: "asc" },
    });
    const enabledFiles = await db.registeredFile.findMany({
      where: { workspaceId: job.workspaceId, disabled: false },
      orderBy: { name: "asc" },
    });
    const sourceKits = await db.sourceUiKit.findMany({ where: { workspaceId: job.workspaceId } });

    if (components.length === 0 && sourceKits.length > 0) {
      for (const kit of sourceKits) {
        await importSourceUiKitComponents({
          workspaceId: job.workspaceId,
          sourceUiKitId: kit.id,
          figmaFileKey: kit.figmaFileKey,
        });
      }

      components = await db.component.findMany({
        where: { workspaceId: job.workspaceId },
        orderBy: { name: "asc" },
      });
    }

    if (sourceKits.length === 0 || components.length === 0 || enabledFiles.length === 0) {
      const err = sourceKits.length === 0
        ? "Add a source UI Kit before scanning."
        : components.length === 0
          ? "Source UI Kit has no imported components. Refresh it from Figma before scanning."
          : "Add at least one registered file before scanning.";
      await db.scanJob.update({
        where: { id: job.id },
        data: {
          status: "Failed",
          error: err,
          finishedAt: new Date(),
          durationMs: 100,
        },
      });
      return { scanJobId, status: "Failed", filesOk: 0, filesFailed: 0, snapshotId: null, error: err };
    }

    const targetFiles =
      job.scope === "single" && job.targetFileId
        ? enabledFiles.filter((f) => f.id === job.targetFileId)
        : enabledFiles;

    if (job.scope === "single" && targetFiles.length === 0) {
      const err = "Target file is missing or disabled.";
      await db.scanJob.update({
        where: { id: job.id },
        data: { status: "Failed", error: err, finishedAt: new Date(), durationMs: 50 },
      });
      return { scanJobId, status: "Failed", filesOk: 0, filesFailed: 1, snapshotId: null, error: err };
    }

    // Pull the previous snapshot for change detection.
    const previousSnapshot = await db.snapshot.findFirst({
      where: { workspaceId: job.workspaceId },
      orderBy: { at: "desc" },
    });
    const previousUsages = previousSnapshot
      ? await db.componentUsage.findMany({ where: { snapshotId: previousSnapshot.id } })
      : [];
    const prevMap = aggregateUsagesByComponentFile(previousUsages);

    const startedAt = Date.now();

    const figmaToken = await getFigmaToken(job.workspaceId);
    if (!figmaToken) {
      const err = "Connect a Figma personal access token to enable real component scanning.";
      await db.scanJob.update({
        where: { id: job.id },
        data: { status: "Failed", error: err, finishedAt: new Date(), durationMs: 100 },
      });
      return { scanJobId, status: "Failed", filesOk: 0, filesFailed: 0, snapshotId: null, error: err };
    }

    // Build UI Kit lookup: source node ID and stable published component key → DB component.id.
    const componentLookup = new Map<string, string>();
    const componentsBySourceNode = new Map<string, (typeof components)[number]>();
    for (const c of components) {
      addLookupKey(componentLookup, c.figmaNodeKey, c.id);
      addLookupKey(componentLookup, c.figmaComponentKey, c.id);
      if (c.figmaNodeKey) {
        componentsBySourceNode.set(`${c.sourceUiKitId}|${normalizeFigmaNodeId(c.figmaNodeKey)}`, c);
      }
    }

    // Backfill component keys from source metadata only when older imports need it.
    // This fetch can be expensive for large UI kits, so it must not block normal scans.
    const componentKeyUpdates: { id: string; figmaComponentKey: string }[] = [];
    for (const kit of sourceKits) {
      const needsBackfill = components.some(
        (component) => component.sourceUiKitId === kit.id && component.figmaNodeKey && !component.figmaComponentKey
      );
      if (!needsBackfill) continue;

      let sourceFile: FigmaFileResponse | null = null;
      try {
        sourceFile = await fetchFigmaFile(kit.figmaFileKey, figmaToken);
      } catch (err) {
        console.warn("[scan] skipped source UI Kit key backfill:", err instanceof Error ? err.message : String(err));
        continue;
      }

      for (const [nodeId, meta] of Object.entries(sourceFile?.components ?? {})) {
        if (!meta.key) continue;
        const component = componentsBySourceNode.get(`${kit.id}|${normalizeFigmaNodeId(nodeId)}`);
        if (!component) continue;
        addLookupKey(componentLookup, meta.key, component.id);
        if (component.figmaComponentKey !== meta.key) {
          componentKeyUpdates.push({ id: component.id, figmaComponentKey: meta.key });
        }
      }
    }

    if (componentKeyUpdates.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < componentKeyUpdates.length; i += batchSize) {
        const batch = componentKeyUpdates.slice(i, i + batchSize);
        await Promise.all(
          batch.map((update) =>
            db.component.update({
              where: { id: update.id },
              data: { figmaComponentKey: update.figmaComponentKey },
            })
          )
        );
      }
    }

    if (componentLookup.size === 0) {
      const err = "No UI Kit components have Figma identifiers. Re-import your source UI Kit from Figma first.";
      await db.scanJob.update({
        where: { id: job.id },
        data: { status: "Failed", error: err, finishedAt: new Date(), durationMs: 100 },
      });
      return { scanJobId, status: "Failed", filesOk: 0, filesFailed: 0, snapshotId: null, error: err };
    }

    // Build usage rows by scanning each file against the Figma API.
    let filesOk = 0;
    let filesFailed = 0;
    const rows: UsageRow[] = [];
    const successfullyScannedFileIds = new Set<string>();

    for (const file of targetFiles) {
      try {
        const data = await fetchFigmaFile(file.figmaFileKey, figmaToken);
        if (!data?.document) {
          filesFailed++;
          continue;
        }

        const matches = walkFileForInstances(data.document, componentLookup, data.components);
        for (const m of matches) {
          rows.push({
            componentId: m.componentId,
            fileId: file.id,
            instances: m.instances,
            page: m.page || null,
          });
        }

        successfullyScannedFileIds.add(file.id);
        filesOk++;
      } catch {
        filesFailed++;
      }
    }

    const enabledFileIds = new Set(enabledFiles.map((f) => f.id));
    const snapshotRows: UsageRow[] =
      job.scope === "single" && previousUsages.length > 0
        ? [
            ...previousUsages
              .filter((u) => enabledFileIds.has(u.fileId) && !successfullyScannedFileIds.has(u.fileId))
              .map((u) => ({
                componentId: u.componentId,
                fileId: u.fileId,
                instances: u.instances,
                page: u.page,
              })),
            ...rows,
          ]
        : rows;

    const usedComponentIds = new Set(snapshotRows.map((r) => r.componentId));
    const totalInstances = snapshotRows.reduce((s, r) => s + r.instances, 0);

    // Determine label (Scan #N for the workspace).
    const prevCount = await db.scanJob.count({ where: { workspaceId: job.workspaceId } });
    const label = `Scan #${prevCount}`;

    const snapshot = await db.snapshot.create({
      data: {
        workspaceId: job.workspaceId,
        scanJobId: job.id,
        label,
        at: new Date(),
        filesScanned: filesOk,
        totalInstances,
        componentsUsed: usedComponentIds.size,
      },
    });

    if (snapshotRows.length > 0) {
      await db.componentUsage.createMany({ data: snapshotRows.map((r) => ({ snapshotId: snapshot.id, ...r })) });
    }

    // Change detection vs previous snapshot.
    const latestMap = aggregateUsagesByComponentFile(snapshotRows);
    const allKeys = new Set<string>([...prevMap.keys(), ...latestMap.keys()]);
    const changeRows: {
      workspaceId: string;
      scanJobId: string;
      componentId: string;
      fileId: string;
      previous: number;
      current: number;
      type: string;
    }[] = [];

    for (const key of allKeys) {
      const [componentId, fileId] = key.split("|") as [string, string];
      const p = prevMap.get(key) ?? 0;
      const c = latestMap.get(key) ?? 0;
      let type = "No Change";
      if (p === 0 && c > 0) type = "Newly Used";
      else if (c === 0 && p > 0) type = "Removed";
      else if (c > p) type = "Increased";
      else if (c < p) type = "Decreased";
      if (type === "No Change") continue;
      changeRows.push({
        workspaceId: job.workspaceId,
        scanJobId: job.id,
        componentId,
        fileId,
        previous: p,
        current: c,
        type,
      });
    }

    if (changeRows.length > 0) {
      await db.change.createMany({ data: changeRows });
    }

    const durationMs = Date.now() - startedAt + 200;
    await db.scanJob.update({
      where: { id: job.id },
      data: {
        status: "Success",
        finishedAt: new Date(),
        durationMs,
        filesOk,
        filesFailed,
      },
    });
    await invalidateWorkspaceCache(job.workspaceId);

    return {
      scanJobId,
      status: "Success",
      filesOk,
      filesFailed,
      snapshotId: snapshot.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scan] worker failed:", message, err);
    await db.scanJob.update({
      where: { id: scanJobId },
      data: {
        status: "Failed",
        error: message,
        finishedAt: new Date(),
        durationMs: 0,
      },
    });
    await invalidateWorkspaceScanCache(job.workspaceId);
    return { scanJobId, status: "Failed", filesOk: 0, filesFailed: 0, snapshotId: null, error: message };
  }
}

/** Best-effort: trigger the worker without awaiting it (fire-and-forget). */
export function triggerScanInBackground(scanJobId: string): void {
  runScan(scanJobId).catch((err) => {
    console.error("[scan] background run failed:", err);
  });
}
