import index from "./client/index.html";
import workerFile from "./client/service-worker.js" with { type: "file" };

import { serve, which, file } from "bun";
import { createPushRoutes } from "./server/webpush";
import { parseArgs } from "./server/args";
import { websocket } from "./server/websocket";
import type { WebSocketData } from "./server/websocket";
import {
  loadExtensions,
  getServerExtensions,
  getClientExtensions,
  getClientBundle,
} from "./server/extensions";

const { identifier, vapidContact, port, extensions } = parseArgs();
await loadExtensions(extensions);
const hasTmux = which("tmux") !== null;

function startServer(port?: number): ReturnType<typeof serve<WebSocketData>> {
  let currentPort = port ?? 7130;
  while (true) {
    try {
      return serve<WebSocketData>({
        port: currentPort,

        routes: {
          "/": index,
          ...createPushRoutes(identifier, vapidContact),
          ...getServerExtensions(),
          "/service-worker.js": () =>
            new Response(file(workerFile as URL), {
              headers: { "Content-Type": "application/javascript" },
            }),
          "/api/hasTmux": {
            GET: () => Response.json({ hasTmux }),
          },
          "/clientExtensions": {
            GET: () => Response.json(getClientExtensions()),
          },
        },

        fetch(req, server) {
          const url = new URL(req.url);
          if (url.pathname === "/ws") {
            if (server.upgrade(req, { data: { identifier, hasTmux } })) return;
          }
          const match = url.pathname.match(
            /^\/extensions\/([^/]+)\/client\.js$/,
          );
          if (match) {
            const bundle = getClientBundle(match[1]!);
            if (bundle) {
              return new Response(new Uint8Array(bundle), {
                headers: { "Content-Type": "application/javascript" },
              });
            }
          }
          return new Response("Not Found", { status: 404 });
        },

        websocket,

        development: process.env.NODE_ENV !== "production" && {
          hmr: true,
          console: true,
        },
      });
    } catch (err) {
      if ((err as { code?: string }).code !== "EADDRINUSE") throw err;
      if (port !== undefined) throw err;
      console.error(
        `Port ${currentPort} is in use, trying ${currentPort + 1}...`,
      );
      currentPort++;
    }
  }
}

const server = startServer(port);

console.log(`🚀 Server running at ${server.url}`);
