import { type PointerEvent } from "react";

interface ToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function ToggleButton({ label, isActive, onClick }: ToggleButtonProps) {
  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      className={isActive ? "toggle-active" : undefined}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
