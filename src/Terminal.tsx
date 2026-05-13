import "@xterm/xterm/css/xterm.css";

import { useEffect, useRef, useCallback, useImperativeHandle } from "react";
import type { Ref } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useTouchScroll } from "./useTouchScroll";
import { useWebSocket } from "./useWebSocket";

interface TerminalProps {
  ref: Ref<TerminalHandle>;
  viewportHeight: number;
  isLatchedCtrl: boolean;
  setLatchedCtrl: (state: boolean) => void;
  isCtrlHeld: boolean;
}

export interface TerminalHandle {
  send: (message: string) => void;
  fit: () => void;
  focus: () => void;
}

export function Terminal({
  ref,
  viewportHeight,
  isLatchedCtrl,
  setLatchedCtrl,
  isCtrlHeld,
}: TerminalProps) {
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
  const { handleTouchStart, handleTouchMove } = useTouchScroll(
    wsRef,
    terminalRef,
    containerRef,
  );

  useEffect(() => {
    if (!containerRef.current) return;

    terminalRef.current = new XTerm({
      theme: { background: "#1e1e1e" },
      overviewRuler: { width: 1 }, // replace with showScrollbar in 7.0.0 and remove css
      fontSize: 12,
      macOptionClickForcesSelection: true,
    });
    fitAddonRef.current = new FitAddon();

    terminalRef.current.loadAddon(fitAddonRef.current);
    terminalRef.current.open(containerRef.current);

    return () => {
      fitAddonRef.current?.dispose();
      terminalRef.current?.dispose();
    };
  }, []);

  const doFit = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      fitAddonRef.current?.fit();
      const cols = terminalRef.current?.cols;
      const rows = terminalRef.current?.rows;
      if (cols && rows && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(`\x1b[RESIZE:${cols};${rows}]`);
      }
    });
  }, []);

  useEffect(doFit, [viewportHeight, doFit]);

  useImperativeHandle(
    ref,
    () => ({
      send: (message: string) => {
        wsRef.current?.send(message);
      },
      fit: doFit,
      focus: () => terminalRef.current?.focus(),
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
