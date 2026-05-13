import { type PointerEvent, memo } from "react";

interface StandardButtonProps {
  label: string;
  onClick: () => void;
}

export const StandardButton = memo(function StandardButton({
  label,
  onClick,
}: StandardButtonProps) {
  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
  };

  return (
    <button onPointerDown={handlePointerDown} onClick={onClick}>
      {label}
    </button>
  );
});
