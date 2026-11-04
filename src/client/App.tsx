import "./index.css";

import { useRef, useState, useMemo, useEffect } from "react";
import { Terminal } from "./Terminal";
import type { TerminalHandle } from "./Terminal";
import { ToolBar } from "./ToolBar";
import { useVisualViewport } from "./useVisualViewport";
import { PushBanner } from "./PushBanner";
import { setPendingFocusPane } from "./useWebSocket";

export function App() {
  const { viewportHeight, isDockedKeyboardVisible } = useVisualViewport();
  const terminalRef = useRef<TerminalHandle | null>(null);
  const [isLatchedCtrl, setLatchedCtrl] = useState(false);
  const [isCtrlHeld, setCtrlHeld] = useState(false);

  useEffect(() => {
    const pane = new URLSearchParams(location.search).get("focusTmuxPane");
    if (pane) {
      setPendingFocusPane(pane);
      history.replaceState(null, "", "/");
    }
  }, []);

  const terminalHandler = useMemo<TerminalHandle>(
    () => ({
      send(data) {
        terminalRef.current?.send(data);
      },
      fit() {
        terminalRef.current?.fit();
      },
      focus() {
        terminalRef.current?.focus();
      },
    }),
    [],
  );

  return (
    <>
      <div className="status-bar-backdrop" aria-hidden="true" />
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
          terminalHandler={terminalHandler}
          setActiveCtrl={setLatchedCtrl}
          isActiveCtrl={isLatchedCtrl}
          isDockedKeyboardVisible={isDockedKeyboardVisible}
          onCtrlHoldChange={setCtrlHeld}
        />
      </div>
    </>
  );
}

export default App;
