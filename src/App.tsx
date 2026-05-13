import "./index.css";

import { useRef, useCallback, useState } from "react";
import { Terminal, type TerminalHandle } from "./Terminal";
import { ToolBar } from "./ToolBar";
import { useVisualViewport } from "./useVisualViewport";

export function App() {
  const viewportHeight = useVisualViewport();
  const terminalRef = useRef<TerminalHandle | null>(null);
  const [isLatchedCtrl, setLatchedCtrl] = useState(false);
  const [isCtrlHeld, setCtrlHeld] = useState(false);

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
    <div className="app" style={{ height: `${viewportHeight}px` }}>
      <Terminal
        ref={terminalRef}
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
      />
    </div>
  );
}

export default App;
