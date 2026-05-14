import { useState, useEffect, useCallback, useRef, memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  StandardButton,
  LatchButton,
  ArrowButton,
  ToggleButton,
} from "./buttons";
import { TextInput } from "./TextInput";

interface ToolBarProps {
  onStandardClick: (data: string) => void;
  setActiveCtrl: Dispatch<SetStateAction<boolean>>;
  isActiveCtrl: boolean;
  onCtrlHoldChange?: (isHeld: boolean) => void;
  fitTerminal: () => void;
  focusTerminal: () => void;
}

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

export const ToolBar = memo(function ToolBar({
  onStandardClick,
  setActiveCtrl,
  isActiveCtrl,
  onCtrlHoldChange,
  fitTerminal,
  focusTerminal,
}: ToolBarProps) {
  const [showInput, setShowInput] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const prevShowInput = useRef(showInput);

  useEffect(() => {
    if (prevShowInput.current && !showInput) {
      focusTerminal();
    }
    prevShowInput.current = showInput;
  }, [showInput]);

  useEffect(() => {
    fitTerminal();
  }, [showExtra]);

  const handleEsc = useCallback(
    () => onStandardClick("\x1b"),
    [onStandardClick],
  );
  const handleTab = useCallback(() => onStandardClick("\t"), [onStandardClick]);
  const handleShiftTab = useCallback(
    () => onStandardClick("\x1b[Z"),
    [onStandardClick],
  );
  const handleSpace = useCallback(
    () => onStandardClick(" "),
    [onStandardClick],
  );
  const handleCtrlC = useCallback(
    () => onStandardClick("\x03"),
    [onStandardClick],
  );
  const handleEnter = useCallback(
    () => onStandardClick("\r"),
    [onStandardClick],
  );
  const handleToggleInput = useCallback(() => setShowInput((v) => !v), []);
  const handleToggleExtra = useCallback(() => setShowExtra((v) => !v), []);

  return (
    <>
      {showInput && (
        <TextInput onSend={onStandardClick} fitTerminal={fitTerminal} />
      )}
      {showExtra && (
        <div className="button-bar">
          <StandardButton label="S+Tab" onClick={handleShiftTab} />
          <StandardButton label="Space" onClick={handleSpace} />
          <StandardButton label="^C" onClick={handleCtrlC} />
          <StandardButton label="↵" onClick={handleEnter} />
        </div>
      )}
      <div className="button-bar">
        <StandardButton label="Esc" onClick={handleEsc} />
        <StandardButton label="Tab" onClick={handleTab} />
        <LatchButton
          label="Ctrl"
          setActive={setActiveCtrl}
          isActive={isActiveCtrl}
          onHoldChange={onCtrlHoldChange}
        />
        <ArrowButton
          onArrow={onStandardClick}
          arrows={ARROWS}
          repeatEnabled={true}
        />
        <ToggleButton
          label="Aa"
          isActive={showInput}
          onClick={handleToggleInput}
        />
        <ArrowButton onArrow={onStandardClick} arrows={TMUX_ARROWS} />
        <ToggleButton
          label="…"
          isActive={showExtra}
          onClick={handleToggleExtra}
        />
      </div>
    </>
  );
});
