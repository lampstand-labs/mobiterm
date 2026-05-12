import { useState, useEffect } from "react";
import { StandardButton, ToggleButton, ArrowButton } from "./buttons";
import { TextInput } from "./TextInput";

interface ButtonBarProps {
  onStandardClick: (data: string) => void;
  setActiveCtrl: (state: boolean) => void;
  isActiveCtrl: boolean;
  onCtrlHoldChange?: (isHeld: boolean) => void;
  fitTerminal?: () => void;
  focusTerminal?: () => void;
}

export function ButtonBar({
  onStandardClick,
  setActiveCtrl,
  isActiveCtrl,
  onCtrlHoldChange,
  fitTerminal,
  focusTerminal,
}: ButtonBarProps) {
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fitTerminal();
    if (!showInput) {
      focusTerminal();
    }
  }, [showInput]);

  return (
    <>
      {showInput && (
        <TextInput onSend={onStandardClick} fitTerminal={fitTerminal} />
      )}
      <div className="button-bar">
        <StandardButton label="Esc" onClick={() => onStandardClick("\x1b")} />
        <StandardButton label="Tab" onClick={() => onStandardClick("\t")} />
        <ToggleButton
          label="Ctrl"
          setActive={setActiveCtrl}
          isActive={isActiveCtrl}
          onHoldChange={onCtrlHoldChange}
        />
        <ArrowButton
          onArrow={onStandardClick}
          arrows={{
            up: { char: "↑", seq: "\x1b[A" },
            down: { char: "↓", seq: "\x1b[B" },
            left: { char: "←", seq: "\x1b[D" },
            right: { char: "→", seq: "\x1b[C" },
          }}
          repeatEnabled={true}
        />
        <button
          onPointerDown={(e) => e.preventDefault()}
          className={showInput ? "toggle-active" : undefined}
          onClick={() => setShowInput((v) => !v)}
        >
          Aa
        </button>
      </div>
    </>
  );
}
