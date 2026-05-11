import { useRef } from "react";

export function useTouchScroll(wsRef: React.RefObject<WebSocket>) {
  const touchStartY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    if (window.getSelection().toString().length > 0) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    const threshold = 30; // pixels to consider a scroll gesture
    if (Math.abs(deltaY) >= threshold) {
      const direction = deltaY < 0 ? "down" : "up";
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // SGR mouse wheel mode: 64 for up, 65 for down
        const button = direction === "up" ? 64 : 65;
        const seq = `\x1b[<${button};1;1M`;
        wsRef.current.send(seq);
      }
      // Reset start point to avoid repeated sends for the same gesture
      touchStartY.current = e.touches[0].clientY;
    }
  };

  return { handleTouchStart, handleTouchMove };
}
