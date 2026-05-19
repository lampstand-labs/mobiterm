import { useState, useEffect, useRef, memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  StandardButton,
  LatchButton,
  ArrowButton,
  ToggleButton,
} from "./buttons";
import { TextInput } from "./TextInput";
import { ExtensionSlot } from "./extensions/ExtensionSlot";
import { ExtensionSlot as Slot } from "@lampstand-labs/mobiterm-types";
import { useExtensionContext } from "./extensions/useExtensionContext";

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
  setActiveCtrl: Dispatch<SetStateAction<boolean>>;
  isActiveCtrl: boolean;
  onCtrlHoldChange?: (isHeld: boolean) => void;
}

export const ToolBar = memo(function ToolBar({
  setActiveCtrl,
  isActiveCtrl,
  onCtrlHoldChange,
}: ToolBarProps) {
  const [showInput, setShowInput] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [hasTmux, setHasTmux] = useState(false);
  const prevShowInput = useRef(showInput);
  const { terminal } = useExtensionContext();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/hasTmux");
        const data = await res.json();
        setHasTmux(data.hasTmux);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (prevShowInput.current && !showInput) {
      terminal.focus();
      terminal.fit();
    }
    prevShowInput.current = showInput;
  }, [showInput]);

  useEffect(() => {
    terminal.fit();
  }, [showExtra]);

  return (
    <>
      {showInput && (
        <TextInput
          onSend={(d) => terminal.send(d)}
          fitTerminal={() => terminal.fit()}
        />
      )}
      <ExtensionSlot slot={Slot.ToolbarAbove} />
      {showExtra && (
        <div className="button-bar">
          <StandardButton
            label="S+Tab"
            onClick={() => terminal.send("\x1b[Z")}
          />
          <StandardButton label="Space" onClick={() => terminal.send(" ")} />
          <StandardButton label="^C" onClick={() => terminal.send("\x03")} />
          <StandardButton label="↵" onClick={() => terminal.send("\r")} />
        </div>
      )}
      <div className="button-bar">
        <StandardButton label="Esc" onClick={() => terminal.send("\x1b")} />
        <StandardButton label="Tab" onClick={() => terminal.send("\t")} />
        <LatchButton
          label="Ctrl"
          setActive={setActiveCtrl}
          isActive={isActiveCtrl}
          onHoldChange={onCtrlHoldChange}
        />
        <ArrowButton
          onArrow={(d) => terminal.send(d)}
          arrows={ARROWS}
          repeatEnabled={true}
        />
        <ToggleButton
          label="Aa"
          isActive={showInput}
          onClick={() => setShowInput((v) => !v)}
        />
        {hasTmux && (
          <ArrowButton onArrow={(d) => terminal.send(d)} arrows={TMUX_ARROWS} />
        )}
        <ToggleButton
          label="…"
          isActive={showExtra}
          onClick={() => setShowExtra((v) => !v)}
        />
        <ExtensionSlot slot={Slot.ToolbarInside} />
      </div>
    </>
  );
});
