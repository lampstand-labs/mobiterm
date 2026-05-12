import { StandardButton, ToggleButton } from "./buttons";

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
    </div>
  );
}
