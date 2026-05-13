import { useState, useEffect } from "react";
import { StandardButton, LatchButton, ArrowButton } from "./buttons";
import { TextInput } from "./TextInput";

interface ButtonBarProps {
  onStandardClick: (data: string) => void;
  setActiveCtrl: (state: boolean) => void;
  isActiveCtrl: boolean;
  onCtrlHoldChange?: (isHeld: boolean) => void;
  fitTerminal?: () => void;
  focusTerminal?: () => void;
}

const extraButtons = [
  { label: "S+Tab", seq: "\x1b[Z" },
  { label: "Space", seq: " " },
  { label: "^C", seq: "\x03" },
  { label: "↵", seq: "\r" },
];

export function ButtonBar({
  onStandardClick,
  setActiveCtrl,
  isActiveCtrl,
  onCtrlHoldChange,
  fitTerminal,
  focusTerminal,
}: ButtonBarProps) {
  const [showInput, setShowInput] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    fitTerminal();
    if (!showInput && !showExtra) {
      focusTerminal();
    }
  }, [showInput, showExtra]);

  return (
    <>
      {showInput && (
        <TextInput onSend={onStandardClick} fitTerminal={fitTerminal} />
      )}
      {showExtra && (
        <div className="button-bar">
          {extraButtons.map((b) => (
            <StandardButton
              label={b.label}
              onClick={() => onStandardClick(b.seq)}
            />
          ))}
        </div>
      )}
      <div className="button-bar">
        <StandardButton label="Esc" onClick={() => onStandardClick("\x1b")} />
        <StandardButton label="Tab" onClick={() => onStandardClick("\t")} />
        <LatchButton
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
        <ArrowButton
          onArrow={onStandardClick}
          arrows={{
            left: { char: "◀", seq: "\x02p" },
            right: { char: "▶", seq: "\x02n" },
          }}
        />
        <button
          onPointerDown={(e) => e.preventDefault()}
          className={showExtra ? "toggle-active" : undefined}
          onClick={() => setShowExtra((v) => !v)}
        >
          …
        </button>
      </div>
    </>
  );
}
