import React from "react";

interface StandardButtonProps {
  label: string;
  onClick: () => void;
}

export function StandardButton({ label, onClick }: StandardButtonProps) {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
  };

  return (
    <button onPointerDown={handlePointerDown} onClick={onClick}>
      {label}
    </button>
  );
}
