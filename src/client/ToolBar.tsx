import { useState, useEffect, useRef, memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  StandardButton,
  LatchButton,
  ArrowButton,
  ToggleButton,
} from "./buttons";
import { TextInput } from "./TextInput";

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
  onStandardClick: (data: string) => void;
  setActiveCtrl: Dispatch<SetStateAction<boolean>>;
  isActiveCtrl: boolean;
  onCtrlHoldChange?: (isHeld: boolean) => void;
  fitTerminal: () => void;
  focusTerminal: () => void;
}

export const ToolBar = memo(function ToolBar({
  onStandardClick,
  setActiveCtrl,
  isActiveCtrl,
  onCtrlHoldChange,
  fitTerminal,
  focusTerminal,
}: ToolBarProps) {
  const [hasTmux, setHasTmux] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const prevShowInput = useRef(showInput);

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
      focusTerminal();
      fitTerminal();
    }
    prevShowInput.current = showInput;
  }, [showInput]);

  useEffect(() => {
    fitTerminal();
  }, [showExtra]);

  return (
    <>
      {showInput && (
        <TextInput onSend={onStandardClick} fitTerminal={fitTerminal} />
      )}
      {showExtra && (
        <div className="button-bar">
          <StandardButton
            label="S+Tab"
            data="\x1b[Z"
            onClick={onStandardClick}
          />
          <StandardButton label="Space" data=" " onClick={onStandardClick} />
          <StandardButton label="^C" data="\x03" onClick={onStandardClick} />
          <StandardButton label="↵" data="\r" onClick={onStandardClick} />
        </div>
      )}
      <div className="button-bar">
        <StandardButton label="Esc" data="\x1b" onClick={onStandardClick} />
        <StandardButton label="Tab" data="\t" onClick={onStandardClick} />
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
          onClick={() => setShowInput((v) => !v)}
        />
        {hasTmux && (
          <ArrowButton onArrow={onStandardClick} arrows={TMUX_ARROWS} />
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
