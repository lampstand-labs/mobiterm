import "./index.css";

import { useRef, useCallback, useState } from "react";
import { Terminal } from "./Terminal";
import { ButtonBar } from "./ButtonBar";
import { useVisualViewport } from "./useVisualViewport";

export function App() {
  const viewportHeight = useVisualViewport();
  const terminalRef = useRef(null);
  const [isLatchedCtrl, setLatchedCtrl] = useState(false);
  const [isCtrlHeld, setCtrlHeld] = useState(false);

  const standardHandler = useCallback((data: string) => {
    terminalRef.current?.send(data);
  }, []);

  return (
    <div className="app" style={{ height: `${viewportHeight}px` }}>
      <Terminal
        ref={terminalRef}
        isLatchedCtrl={isLatchedCtrl}
        setLatchedCtrl={setLatchedCtrl}
        isCtrlHeld={isCtrlHeld}
      />
      <ButtonBar
        onStandardClick={standardHandler}
        setActiveCtrl={setLatchedCtrl}
        isActiveCtrl={isLatchedCtrl}
        onCtrlHoldChange={setCtrlHeld}
      />
    </div>
  );
}

export default App;
