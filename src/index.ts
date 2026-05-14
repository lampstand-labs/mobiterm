import { serve, which } from "bun";
import index from "./client/index.html";
import { createPushRoutes } from "./server/push";
import { parseArgs } from "./server/args";
import { websocket } from "./server/websocket";
import type { WebSocketData } from "./server/websocket";

const { identifier, vapidContact, port } = parseArgs();
const hasTmux = which("tmux") !== null;

function startServer(port?: number): ReturnType<typeof serve<WebSocketData>> {
  let currentPort = port ?? 3000;
  while (true) {
    try {
      return serve<WebSocketData>({
        port: currentPort,

        routes: {
          "/": index,
          ...createPushRoutes(identifier, vapidContact),
          "/api/hasTmux": {
            GET: () => Response.json({ hasTmux }),
          },
        },

        fetch(req, server) {
          const url = new URL(req.url);
          if (url.pathname === "/ws") {
            if (server.upgrade(req, { data: { identifier, hasTmux } })) return;
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
