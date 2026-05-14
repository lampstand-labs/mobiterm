import { serve } from "bun";
import type { ServerWebSocket, Subprocess } from "bun";
import index from "./index.html";
import { createPushRoutes } from "./server/push";
import { parseArgs } from "./server/args";

const { identifier, vapidContact } = parseArgs();

interface WebSocketData {
  proc?: Subprocess;
}

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

  websocket: {
    open(ws) {
      console.log("Client connected. Spawning shell...");
      const proc = Bun.spawn(["tmux", "new", "-A", "-s", "dev"], {
        terminal: {
          data(terminal, data) {
            ws.send(data);
          },
        },
      });
      ws.data = { proc };
    },
    message(ws, message) {
      const { proc } = ws.data as { proc: any };
      const input =
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message);

      if (input.startsWith("\x1b[RESIZE:")) {
        const match = input.match(/\x1b\[RESIZE:(\d+);(\d+)\]/);
        if (match) {
          try {
            proc.terminal.resize(
              parseInt(match[1]!, 10),
              parseInt(match[2]!, 10),
            );
          } catch (e) {
            console.error("Failed to resize terminal:", e);
          }
        }
        return;
      }

      proc.terminal.write(message);
    },
    close(ws) {
      const { proc } = ws.data as { proc: any };
      console.log("Client disconnected. Killing process.");
      proc.kill();
      proc.terminal.close();
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
