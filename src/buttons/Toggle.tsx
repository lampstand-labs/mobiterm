import React, { useRef } from "react";

interface ToggleButtonProps {
  label: string;
  setActive: (state: boolean) => void;
  isActive: boolean;
}

export function ToggleButton({
  label,
  setActive,
  isActive,
}: ToggleButtonProps) {
  const startRef = useRef(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    startRef.current = Date.now();
    setActive(!isActive);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!isInside) {
      setActive(false);
      return;
    }

    if (startRef.current) {
      const duration = Date.now() - startRef.current;
      if (duration >= 300) {
        setActive(false);
      }
      startRef.current = null;
    }
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={isActive ? "toggle-active" : undefined}
    >
      {label}
    </button>
  );
}
