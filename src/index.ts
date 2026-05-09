import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/": index,
  },

  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return;
    }
    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      console.log("Client connected. Spawning shell...");

      // 1. Spawn the process with a terminal attached
      const proc = Bun.spawn(["bash"], {
        terminal: {
          data(terminal, data) {
            // 2. Forward process output to the WebSocket client
            ws.send(data);
          },
        },
      });

      // Attach the process to the WebSocket object for cleanup
      ws.data = { proc };
    },
    message(ws, message) {
      const { proc } = ws.data as { proc: any };
      const input =
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message);

      // Handle terminal resize requests from the client
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

      // 3. Forward client input to the process terminal
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
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
