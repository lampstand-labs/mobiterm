import "./index.css";

import { useRef, useState, useMemo } from "react";
import { Terminal } from "./Terminal";
import type { TerminalHandle } from "./Terminal";
import { ToolBar } from "./ToolBar";
import { useVisualViewport } from "./useVisualViewport";
import { PushBanner } from "./PushBanner";
import { ExtensionProvider } from "./extensions/ExtensionProvider";

export function App() {
  const { viewportHeight, isDockedKeyboardVisible } = useVisualViewport();
  const terminalRef = useRef<TerminalHandle | null>(null);
  const [isLatchedCtrl, setLatchedCtrl] = useState(false);
  const [isCtrlHeld, setCtrlHeld] = useState(false);

  const terminalHandle = useMemo<TerminalHandle>(
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
    <div
      className="app"
      style={{
        height: `${viewportHeight}px`,
        paddingBottom: isDockedKeyboardVisible ? 0 : undefined,
      }}
    >
      <PushBanner />
      <ExtensionProvider terminal={terminalHandle}>
        <Terminal
          ref={terminalRef}
          viewportHeight={viewportHeight}
          isLatchedCtrl={isLatchedCtrl}
          setLatchedCtrl={setLatchedCtrl}
          isCtrlHeld={isCtrlHeld}
        />
        <ToolBar
          setActiveCtrl={setLatchedCtrl}
          isActiveCtrl={isLatchedCtrl}
          onCtrlHoldChange={setCtrlHeld}
        />
      </ExtensionProvider>
    </div>
  );
}

export default App;
