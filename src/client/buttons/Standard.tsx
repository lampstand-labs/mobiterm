import { memo } from "react";
import type { PointerEvent } from "react";

interface StandardButtonProps {
  label: string;
  data: string;
  onClick: (data: string) => void;
  preventKeyboardDismissal: () => void;
}

export const StandardButton = memo(function StandardButton({
  label,
  data,
  onClick,
  preventKeyboardDismissal,
}: StandardButtonProps) {
  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    preventKeyboardDismissal();
    onClick(data);
  };

  return (
    <button onPointerDown={handlePointerDown} onClick={handleClick}>
      {label}
    </button>
  );
});
