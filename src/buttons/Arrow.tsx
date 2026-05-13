import {
  useRef,
  useState,
  useEffect,
  useCallback,
  memo,
  type PointerEvent,
} from "react";

/**
 * ArrowButton - a swipeable directional button.
 * Emits terminal arrow escape sequences when a direction is selected.
 * Supports mouse and touch dragging to choose direction and auto-repeat on hold.
 */
interface ArrowButtonProps {
  /** Callback receiving the escape sequence for the selected arrow direction */
  onArrow: (seq: string) => void;
  /** Enable auto-repeat on press and hold (default: false) */
  repeatEnabled?: boolean;
  /** Optional custom arrow definitions */
  arrows?: {
    up?: { char?: string; seq?: string };
    down?: { char?: string; seq?: string };
    left?: { char?: string; seq?: string };
    right?: { char?: string; seq?: string };
  };
}

export const ArrowButton = memo(function ArrowButton({
  onArrow,
  repeatEnabled = false,
  arrows = {},
}: ArrowButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const repeatTimer = useRef<NodeJS.Timeout | null>(null);
  const arrowsRef = useRef(arrows);
  const [direction, setDirection] = useState<string>(""); // "up"|"down"|"left"|"right"

  const clearTimers = () => {
    if (repeatTimer.current) clearTimeout(repeatTimer.current);
    repeatTimer.current = null;
    setDirection("");
  };

  const sendDirection = useCallback(
    (dir: string) => {
      const seq = arrowsRef.current[dir as keyof typeof arrows]?.seq;
      if (!seq) return;
      onArrow?.(seq);
    },
    [onArrow],
  );

  const determineDirection = (dx: number, dy: number): string => {
    const distance = Math.hypot(dx, dy);
    if (distance < 20) return ""; // no clear direction
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  };

  const startTracking = (x: number, y: number) => {
    startPoint.current = { x, y };
    setDirection("");
  };

  const moveTracking = (x: number, y: number) => {
    if (!startPoint.current) return;
    const dir = determineDirection(
      x - startPoint.current.x,
      y - startPoint.current.y,
    );
    if (dir && dir !== direction) {
      setDirection(dir);
      sendDirection(dir);
      // start auto-repeat after initial delay
      if (repeatTimer.current) clearTimeout(repeatTimer.current);
      if (repeatEnabled) {
        repeatTimer.current = setInterval(() => sendDirection(dir), 150);
      }
    }
  };

  const endTracking = () => {
    clearTimers();
    startPoint.current = null;
  };

  // Pointer event handlers (covers mouse, touch, stylus)
  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startTracking(e.clientX, e.clientY);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.buttons === 0) return; // ignore when not pressed
    moveTracking(e.clientX, e.clientY);
  };

  const onPointerUp = (e: PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    endTracking();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <button
      ref={containerRef}
      className="arrow-button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Four overlay arrows */}
      {arrows.up?.char && (
        <div className={`arrow up ${direction === "up" ? "active" : ""}`}>
          {arrows.up.char}
        </div>
      )}
      {arrows.down?.char && (
        <div className={`arrow down ${direction === "down" ? "active" : ""}`}>
          {arrows.down.char}
        </div>
      )}
      {arrows.left?.char && (
        <div className={`arrow left ${direction === "left" ? "active" : ""}`}>
          {arrows.left.char}
        </div>
      )}
      {arrows.right?.char && (
        <div className={`arrow right ${direction === "right" ? "active" : ""}`}>
          {arrows.right.char}
        </div>
      )}
    </button>
  );
});
