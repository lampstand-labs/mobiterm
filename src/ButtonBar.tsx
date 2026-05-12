import { StandardButton, ToggleButton, ArrowButton } from "./buttons";

interface ButtonBarProps {
  onStandardClick: (data: string) => void;
  setActiveCtrl: (state: boolean) => void;
  isActiveCtrl: boolean;
}

export function ButtonBar({
  onStandardClick,
  setActiveCtrl,
  isActiveCtrl,
}: ButtonBarProps) {
  return (
    <div className="button-bar">
      <StandardButton label="Esc" onClick={() => onStandardClick("\x1b")} />
      <StandardButton label="Tab" onClick={() => onStandardClick("\t")} />
      <ToggleButton
        label="Ctrl"
        setActive={setActiveCtrl}
        isActive={isActiveCtrl}
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
    </div>
  );
}
