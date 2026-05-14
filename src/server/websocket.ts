import type { ServerWebSocket, Subprocess } from "bun";
import { which } from "bun";

export interface WebSocketData {
  proc?: Subprocess;
  identifier: string;
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
    const hasTmux = which("tmux");
    if (!hasTmux) {
      console.log(`tmux is recommended but not found, falling back to ${process.env.SHELL || "bash"}`);
    }
    const shellCmd = hasTmux
      ? ["tmux", "new", "-A", "-s", ws.data.identifier]
      : [process.env.SHELL || "bash"];
    const proc = Bun.spawn(shellCmd, {
      terminal: {
        data(terminal, data) {
          ws.send(data);
        },
      },
    });
    ws.data = { ...ws.data, proc };
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
