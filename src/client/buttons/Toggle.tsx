import { memo } from "react";
import type { PointerEvent } from "react";

interface ToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  preventKeyboardDismissal?: () => void;
}

export const ToggleButton = memo(function ToggleButton({
  label,
  isActive,
  onClick,
  preventKeyboardDismissal,
}: ToggleButtonProps) {
  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    preventKeyboardDismissal?.();
    onClick();
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      className={isActive ? "toggle-active" : undefined}
      onClick={handleClick}
    >
      {label}
    </button>
  );
});
