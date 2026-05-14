import type { ServerWebSocket, Subprocess } from "bun";

export interface WebSocketData {
  proc?: Subprocess;
}

function handleResize(proc: Subprocess, input: string): boolean {
  const match = input.match(/\x1b\[RESIZE:(\d+);(\d+)\]/);
  if (!match) return false;
  try {
    proc.terminal?.resize(parseInt(match[1]!, 10), parseInt(match[2]!, 10));
  } catch (e) {
    console.error("Failed to resize terminal:", e);
  }
  return true;
}

export const websocket = {
  open(ws: ServerWebSocket<WebSocketData>) {
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

  message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    const { proc } = ws.data;
    if (!proc) return;
    const input =
      typeof message === "string" ? message : new TextDecoder().decode(message);

    if (handleResize(proc, input)) return;
    proc.terminal?.write(message);
  },

  close(ws: ServerWebSocket<WebSocketData>) {
    const { proc } = ws.data;
    if (!proc) return;
    console.log("Client disconnected. Killing process.");
    proc.kill();
    proc.terminal?.close();
  },
};
