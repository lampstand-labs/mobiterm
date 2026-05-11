import "@xterm/xterm/css/xterm.css";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { AttachAddon } from "@xterm/addon-attach";
import { useVisualViewport } from "./useVisualViewport";

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>(null);
  const fitAddonRef = useRef<FitAddon>(null);
  const wsRef = useRef<WebSocket>(null);
  const viewportHeight = useVisualViewport();

  useEffect(() => {
    if (!containerRef.current) return;

    terminalRef.current = new XTerm({
      theme: { background: "#1e1e1e" },
      overviewRuler: { width: 1 }, // replace with showScrollbar in 7.0.0 and remove css
      fontSize: 12,
    });
    fitAddonRef.current = new FitAddon();

    terminalRef.current.loadAddon(fitAddonRef.current);
    terminalRef.current.open(containerRef.current);

    const protocol = `${location.protocol === "https:" ? "wss" : "ws"}`;
    let attachAddon: AttachAddon | null = null;

    function connect() {
      if (
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      wsRef.current = new WebSocket(`${protocol}://${location.host}/ws`);
      wsRef.current.binaryType = "arraybuffer";

      wsRef.current.onopen = () => {
        attachAddon = new AttachAddon(wsRef.current);
        terminalRef.current?.loadAddon(attachAddon);
        doFit();
      };

      wsRef.current.onclose = () => {
        terminalRef.current.write(
          "\r\n\x1b[33mConnection closed. Reconnecting...\x1b[0m",
        );
        setTimeout(connect, 2000);
      };

      wsRef.current.onerror = () => {
        wsRef.current.close();
      };
    }

    connect();

    return () => {
      attachAddon?.dispose();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      fitAddonRef.current?.dispose();
      terminalRef.current?.dispose();
    };
  }, []);

  const doFit = () => {
    fitAddonRef.current?.fit();
    const { cols, rows } = terminalRef.current;
    if (cols && rows && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(`\x1b[RESIZE:${cols};${rows}]`);
    }
  };

  useEffect(() => {
    doFit();
  }, [viewportHeight]);

  return <div ref={containerRef} style={{ height: `${viewportHeight}px` }} />;
}
