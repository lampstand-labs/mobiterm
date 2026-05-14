import { useEffect, useRef } from "react";
import type { Terminal as XTerm } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import { AttachAddon } from "@xterm/addon-attach";

export function useWebSocket(
  terminalRef: React.RefObject<XTerm | null>,
  fitAddonRef: React.RefObject<FitAddon | null>,
  isLatchedCtrl: boolean,
  setLatchedCtrl: (state: boolean) => void,
  isCtrlHeld: boolean,
) {
  const wsRef = useRef<WebSocket>(null);
  const ctrlLatchedRef = useRef(isLatchedCtrl);
  const ctrlHeldRef = useRef(isCtrlHeld);
  const protocol = `${location.protocol === "https:" ? "wss" : "ws"}`;

  useEffect(() => {
    ctrlLatchedRef.current = isLatchedCtrl;
  }, [isLatchedCtrl]);

  useEffect(() => {
    ctrlHeldRef.current = isCtrlHeld;
  }, [isCtrlHeld]);

  useEffect(() => {
    let attachAddon: AttachAddon | null = null;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      if (
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      wsRef.current = new WebSocket(`${protocol}://${location.host}/ws`);
      wsRef.current.binaryType = "arraybuffer";

      const originalSend = wsRef.current.send;
      wsRef.current.send = function (data) {
        if (ctrlLatchedRef.current && typeof data === "string") {
          const m = data.match(/^([a-zA-Z])$/);
          if (m) {
            data = String.fromCharCode(m[1]!.charCodeAt(0) & 0x1f);
            if (!ctrlHeldRef.current) {
              setLatchedCtrl(false);
            }
          }
        }
        originalSend.call(this, data);
      };

      wsRef.current.onopen = () => {
        if (terminalRef.current) {
          attachAddon = new AttachAddon(wsRef.current!);
          terminalRef.current.loadAddon(attachAddon);
          // perform initial fit
          if (fitAddonRef.current) {
            fitAddonRef.current.fit();
            const { cols, rows } = terminalRef.current;
            if (cols && rows) {
              wsRef.current!.send(`\x1b[RESIZE:${cols};${rows}]`);
            }
          }
        }
      };

      wsRef.current.onclose = () => {
        attachAddon?.dispose();
        attachAddon = null;
        terminalRef.current?.write(
          "\r\n\x1b[33mConnection closed. Reconnecting...\x1b[0m",
        );
        if (!disposed) {
          setTimeout(connect, 2000);
        }
      };

      wsRef.current.onerror = () => {
        wsRef.current?.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      attachAddon?.dispose();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return wsRef;
}
