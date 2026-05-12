import "@xterm/xterm/css/xterm.css";

import { useEffect, useRef, useImperativeHandle } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useVisualViewport } from "./useVisualViewport";
import { useTouchScroll } from "./useTouchScroll";
import { useWebSocket } from "./useWebSocket";

export function Terminal({
  ref,
  isLatchedCtrl,
  setLatchedCtrl,
  isCtrlHeld,
}: {
  ref: any;
  isLatchedCtrl: boolean;
  setLatchedCtrl: (state: boolean) => void;
  isCtrlHeld: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>(null);
  const fitAddonRef = useRef<FitAddon>(null);
  const wsRef = useWebSocket(
    terminalRef,
    fitAddonRef,
    isLatchedCtrl,
    setLatchedCtrl,
    isCtrlHeld,
  );
  const viewportHeight = useVisualViewport();
  const { handleTouchStart, handleTouchMove } = useTouchScroll(wsRef);

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

    return () => {
      fitAddonRef.current?.dispose();
      terminalRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      fitAddonRef.current?.fit();
      const { cols, rows } = terminalRef.current;
      if (cols && rows && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(`\x1b[RESIZE:${cols};${rows}]`);
      }
    });
  }, [viewportHeight]);

  useImperativeHandle(
    ref,
    () => ({
      send: (message: string) => {
        wsRef.current?.send(message);
      },
    }),
    [],
  );

  return (
    <div
      ref={containerRef}
      className="container-terminal"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    />
  );
}
