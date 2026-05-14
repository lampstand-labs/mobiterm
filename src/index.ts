import { serve } from "bun";
import index from "./client/index.html";
import { createPushRoutes } from "./server/push";
import { parseArgs } from "./server/args";
import { websocket } from "./server/websocket";
import type { WebSocketData } from "./server/websocket";

const { identifier, vapidContact } = parseArgs();

const server = serve<WebSocketData>({
  routes: {
    "/": index,
    ...createPushRoutes(identifier, vapidContact),
  },

  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      if (server.upgrade(req, { data: {} })) return;
    }
    return new Response("Not Found", { status: 404 });
  },

  websocket,

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
