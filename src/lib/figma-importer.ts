import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/secret";
import { getWorkspaceSetting } from "@/lib/settings-store";

type FigmaFileResponse = {
  name?: string;
  document?: FigmaNode;
  components?: Record<string, {
    key?: string;
    name?: string;
    description?: string;
    componentSetId?: string;
  }>;
  componentSets?: Record<string, { key?: string; name?: string; description?: string }>;
};

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};

type ImportedComponent = {
  figmaNodeKey: string;
  figmaComponentKey: string | null;
  name: string;
  set: string;
  description: string;
};

function inferSetName(componentName: string): string {
  const [first] = componentName.split("/").map((part) => part.trim()).filter(Boolean);
  return first || "Components";
}

function collectComponentNodes(
  node: FigmaNode | undefined,
  setName = "Components",
  out: ImportedComponent[] = []
): ImportedComponent[] {
  if (!node) return out;
  const nextSetName = node.type === "COMPONENT_SET" ? node.name : setName;
  if (node.type === "COMPONENT") {
    out.push({
      figmaNodeKey: node.id,
      figmaComponentKey: null,
      name: node.name,
      set: nextSetName || inferSetName(node.name),
      description: "",
    });
  }
  for (const child of node.children ?? []) {
    collectComponentNodes(child, nextSetName, out);
  }
  return out;
}

async function getFigmaToken(workspaceId: string): Promise<string | null> {
  const encrypted = await getWorkspaceSetting(workspaceId, "figma_token_encrypted");
  return encrypted ? decryptSecret(encrypted) : null;
}

async function fetchFigmaFile(figmaFileKey: string, token: string): Promise<FigmaFileResponse> {
  const res = await fetch(`https://api.figma.com/v1/files/${encodeURIComponent(figmaFileKey)}`, {
    headers: { "X-Figma-Token": token },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Figma API failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<FigmaFileResponse>;
}

function extractComponents(file: FigmaFileResponse): ImportedComponent[] {
  const fromMetadata = Object.entries(file.components ?? {}).map(([nodeId, meta]) => {
    const componentSet = meta.componentSetId ? file.componentSets?.[meta.componentSetId] : undefined;
    const name = meta.name?.trim() || nodeId;
    return {
      // Store the node ID (e.g. "12131:26308"), which is what
      // INSTANCE.componentId can reference in consumer files.
      figmaNodeKey: nodeId,
      figmaComponentKey: meta.key?.trim() || null,
      name,
      set: componentSet?.name?.trim() || inferSetName(name),
      description: meta.description?.trim() || "",
    } satisfies ImportedComponent;
  });

  const components = fromMetadata.length > 0
    ? fromMetadata
    : collectComponentNodes(file.document);

  const unique = new Map<string, ImportedComponent>();
  for (const component of components) {
    if (!component.name) continue;
    unique.set(component.figmaNodeKey, component);
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function importSourceUiKitComponents(input: {
  workspaceId: string;
  sourceUiKitId: string;
  figmaFileKey: string;
}): Promise<{ imported: number; fileName?: string }> {
  const token = await getFigmaToken(input.workspaceId);
  if (!token) {
    throw new Error("Connect a Figma personal access token before importing a source UI Kit.");
  }

  const file = await fetchFigmaFile(input.figmaFileKey, token);
  const components = extractComponents(file);
  if (components.length === 0) {
    throw new Error("No components were found in this Figma file.");
  }

  // Batch upserts without a transaction to avoid Neon/Vercel timeouts.
  const batchSize = 50;
  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize);
    await Promise.all(
      batch.map((component) =>
        db.component.upsert({
          where: {
            sourceUiKitId_figmaNodeKey: {
              sourceUiKitId: input.sourceUiKitId,
              figmaNodeKey: component.figmaNodeKey,
            },
          },
          update: {
            workspaceId: input.workspaceId,
            name: component.name,
            set: component.set,
            description: component.description,
            figmaComponentKey: component.figmaComponentKey,
          },
          create: {
            workspaceId: input.workspaceId,
            sourceUiKitId: input.sourceUiKitId,
            figmaNodeKey: component.figmaNodeKey,
            figmaComponentKey: component.figmaComponentKey,
            name: component.name,
            set: component.set,
            description: component.description,
          },
        })
      )
    );
  }

  await db.sourceUiKit.update({
    where: { id: input.sourceUiKitId },
    data: {
      componentCount: components.length,
      lastSyncedAt: new Date(),
    },
  });

  return { imported: components.length, fileName: file.name };
}
