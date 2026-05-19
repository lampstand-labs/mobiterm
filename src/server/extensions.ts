import path from "path";

type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Extension routes merged into Bun.serve().
 * @example
 * {
 *   "/api/hello": { GET: () => Response.json({ msg: "hello" }) },
 *   "/api/data":  { POST: (req) => req.json().then((d) => Response.json(d)) },
 * }
 */
type ServerRoutes = Record<
  string,
  Partial<Record<HTTPMethod, (req: Request) => Response | Promise<Response>>>
>;

const serverRoutes = new Map<string, ServerRoutes>();

const clientBundles = new Map<string, Uint8Array>();

export async function loadExtensions(dirs: string[]): Promise<void> {
  for (const dir of dirs) {
    const resolved = path.resolve(dir);
    const id = path.basename(resolved);
    try {
      await loadSingleExtension(id, resolved);
    } catch (err) {
      console.warn(
        `[extensions] Failed to load "${id}" from ${resolved}:`,
        err,
      );
    }
  }
}

async function loadSingleExtension(id: string, dirPath: string): Promise<void> {
  const serverPath = path.join(dirPath, "server.ts");
  const serverFile = Bun.file(serverPath);
  if (await serverFile.exists()) {
    const module: Record<string, unknown> = await import(serverPath);
    const routes = (module.default ?? module) as ServerRoutes;
    serverRoutes.set(id, routes);
  }

  const clientPath = path.join(dirPath, "client.tsx");
  const clientFile = Bun.file(clientPath);
  if (await clientFile.exists()) {
    const result = await Bun.build({
      entrypoints: [clientPath],
      external: ["react", "react-dom"],
      format: "esm",
    });
    if (result.success && result.outputs.length > 0) {
      const artifact = result.outputs[0]!;
      clientBundles.set(id, await artifact.bytes());
    } else {
      console.warn(`[extensions] Client build failed for "${id}"`);
    }
  }
}

export function getServerExtensions(): ServerRoutes[] {
  return [...serverRoutes.values()];
}

export function getClientExtensions(): string[] {
  return [...clientBundles.keys()];
}

export function getClientBundle(id: string): Uint8Array | undefined {
  return clientBundles.get(id);
}
