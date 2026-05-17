import type { ServerWebSocket, Subprocess } from "bun";

export interface WebSocketData {
  proc?: Subprocess;
  identifier: string;
  hasTmux: boolean;
}

function getBestTerminalProfile(): string {
  try {
    const process = Bun.spawnSync(["infocmp", "tmux-256color"]);
    if (process.success) {
      return "tmux-256color";
    }
  } catch (e) {}
  return "screen-256color";
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
    if (!ws.data.hasTmux) {
      console.log(
        `tmux is recommended but not found, falling back to ${process.env.SHELL || "bash"}`,
      );
    }
    const shell = process.env.SHELL || "bash";
    // prettier-ignore
    const cmd = ws.data.hasTmux
      ? [
          "tmux", "-u", "-L", "mobiterm",
          "set-option", "-g", "default-terminal", getBestTerminalProfile(),
          ";",
          "new", "-A", "-s", ws.data.identifier, shell,
          ";",
          "set-option", "-g", "mouse", "on",
        ]
      : [shell];
    const locale = process.platform === "darwin" ? "en_US.UTF-8" : "C.UTF-8";
    const proc = Bun.spawn(cmd, {
      env: {
        ...process.env,
        TERM: "xterm-256color",
        LANG: locale,
        LC_ALL: locale,
      },
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
