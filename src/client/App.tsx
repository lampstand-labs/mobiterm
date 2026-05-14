import "./index.css";

import { useRef, useCallback, useState, useEffect } from "react";
import { Terminal } from "./Terminal";
import type { TerminalHandle } from "./Terminal";
import { ToolBar } from "./ToolBar";
import { useVisualViewport } from "./useVisualViewport";
import { PushBanner } from "./PushBanner";

export function App() {
  const { viewportHeight, isDockedKeyboardVisible } = useVisualViewport();
  const terminalRef = useRef<TerminalHandle | null>(null);
  const [isLatchedCtrl, setLatchedCtrl] = useState(false);
  const [isCtrlHeld, setCtrlHeld] = useState(false);
  const [hasTmux, setHasTmux] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/hasTmux");
        const d = await r.json();
        setHasTmux(d.hasTmux);
      } catch {}
    })();
  }, []);

  const standardHandler = useCallback((data: string) => {
    terminalRef.current?.send(data);
  }, []);

  const fitTerminal = useCallback(() => {
    terminalRef.current?.fit();
  }, []);

  const focusTerminal = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  return (
    <div
      className="app"
      style={{
        height: `${viewportHeight}px`,
        paddingBottom: isDockedKeyboardVisible ? 0 : undefined,
      }}
    >
      <PushBanner />
      <Terminal
        ref={terminalRef}
        viewportHeight={viewportHeight}
        isLatchedCtrl={isLatchedCtrl}
        setLatchedCtrl={setLatchedCtrl}
        isCtrlHeld={isCtrlHeld}
      />
      <ToolBar
        onStandardClick={standardHandler}
        setActiveCtrl={setLatchedCtrl}
        isActiveCtrl={isLatchedCtrl}
        onCtrlHoldChange={setCtrlHeld}
        fitTerminal={fitTerminal}
        focusTerminal={focusTerminal}
        hasTmux={hasTmux}
      />
    </div>
  );
}

export default App;
