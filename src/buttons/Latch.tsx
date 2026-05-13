import {
  useRef,
  memo,
  type PointerEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

interface LatchButtonProps {
  label: string;
  setActive: Dispatch<SetStateAction<boolean>>;
  isActive: boolean;
  onHoldChange?: (isHeld: boolean) => void;
}

export const LatchButton = memo(function LatchButton({
  label,
  setActive,
  isActive,
  onHoldChange,
}: LatchButtonProps) {
  const startRef = useRef<number | null>(null);

  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
    startRef.current = Date.now();
    setActive((v) => !v);
    onHoldChange?.(true);
  };

  const handlePointerUp = (e: PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!isInside) {
      setActive(false);
    }

    if (startRef.current) {
      const duration = Date.now() - startRef.current;
      if (duration >= 300) {
        setActive(false);
      }
      startRef.current = null;
    }

    onHoldChange?.(false);
  };

  const handlePointerCancel = () => {
    startRef.current = null;
    onHoldChange?.(false);
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={isActive ? "toggle-active" : undefined}
    >
      {label}
    </button>
  );
});
