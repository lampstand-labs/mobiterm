import { useState, useEffect, useRef, useCallback, memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  StandardButton,
  LatchButton,
  ArrowButton,
  ToggleButton,
} from "./buttons";
import { TextInput } from "./TextInput";
import type { TerminalHandle } from "./Terminal";

const ARROWS = {
  up: { char: "↑", seq: "\x1b[A" },
  down: { char: "↓", seq: "\x1b[B" },
  left: { char: "←", seq: "\x1b[D" },
  right: { char: "→", seq: "\x1b[C" },
};

const TMUX_ARROWS = {
  left: { char: "◀", seq: "\x02p" },
  right: { char: "▶", seq: "\x02n" },
};

interface ToolBarProps {
  terminalHandler: TerminalHandle;
  setActiveCtrl: Dispatch<SetStateAction<boolean>>;
  isActiveCtrl: boolean;
  isDockedKeyboardVisible: boolean;
  onCtrlHoldChange?: (isHeld: boolean) => void;
}

export const ToolBar = memo(function ToolBar({
  terminalHandler,
  setActiveCtrl,
  isActiveCtrl,
  isDockedKeyboardVisible,
  onCtrlHoldChange,
}: ToolBarProps) {
  const [hasTmux, setHasTmux] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const prevShowInput = useRef(showInput);

  // Prevent keyboard from dismissing on iOS 27 by restoring terminal focus after
  // a toolbar tap. Attached to the bar containers so button clicks bubble to it.
  const preventKeyboardDismissal = useCallback(() => {
    if (isDockedKeyboardVisible) {
      terminalHandler.focus();
    }
  }, [isDockedKeyboardVisible, terminalHandler]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/hasTmux");
        const d = await r.json();
        setHasTmux(d.hasTmux);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (prevShowInput.current && !showInput) {
      terminalHandler.focus();
      terminalHandler.fit();
    }
    prevShowInput.current = showInput;
  }, [showInput]);

  useEffect(() => {
    terminalHandler.fit();
  }, [showExtra]);

  return (
    <>
      {showInput && (
        <TextInput
          onSend={terminalHandler.send}
          fitTerminal={terminalHandler.fit}
        />
      )}
      {showExtra && (
        <div className="button-bar" onClick={preventKeyboardDismissal}>
          <StandardButton
            label="S+Tab"
            data={"\x1b[Z"}
            onClick={terminalHandler.send}
          />
          <StandardButton
            label="Space"
            data=" "
            onClick={terminalHandler.send}
          />
          <StandardButton
            label="^C"
            data={"\x03"}
            onClick={terminalHandler.send}
          />
          <StandardButton
            label="↵"
            data={"\r"}
            onClick={terminalHandler.send}
          />
        </div>
      )}
      <div className="button-bar" onClick={preventKeyboardDismissal}>
        <StandardButton
          label="Esc"
          data={"\x1b"}
          onClick={terminalHandler.send}
        />
        <StandardButton
          label="Tab"
          data={"\t"}
          onClick={terminalHandler.send}
        />
        <LatchButton
          label="Ctrl"
          setActive={setActiveCtrl}
          isActive={isActiveCtrl}
          onHoldChange={onCtrlHoldChange}
        />
        <ArrowButton
          onArrow={terminalHandler.send}
          arrows={ARROWS}
          repeatEnabled={true}
        />
        <ToggleButton
          label="Aa"
          isActive={showInput}
          onClick={() => setShowInput((v) => !v)}
        />
        {hasTmux && (
          <ArrowButton onArrow={terminalHandler.send} arrows={TMUX_ARROWS} />
        )}
        <ToggleButton
          label="…"
          isActive={showExtra}
          onClick={() => setShowExtra((v) => !v)}
        />
      </div>
    </>
  );
});
