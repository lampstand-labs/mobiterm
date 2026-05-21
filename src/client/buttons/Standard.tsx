import { memo } from "react";
import type { PointerEvent } from "react";

interface StandardButtonProps {
  label: string;
  data: string;
  onClick: (data: string) => void;
}

export const StandardButton = memo(function StandardButton({
  label,
  data,
  onClick,
}: StandardButtonProps) {
  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
  };

  return (
    <button onPointerDown={handlePointerDown} onClick={() => onClick(data)}>
      {label}
    </button>
  );
});
