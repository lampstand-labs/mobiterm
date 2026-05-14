import { useRef } from "react";
import type { RefObject, TouchEvent } from "react";
import type { Terminal as XTerm } from "@xterm/xterm";

export function useTouchScroll(
  wsRef: RefObject<WebSocket | null>,
  terminalRef: RefObject<XTerm | null>,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  const getTerminalCoords = (clientX: number, clientY: number) => {
    const term = terminalRef.current;
    const container = containerRef.current;
    if (!term || !container) return { x: 1, y: 1 };

    // change to term.dimensions in 7.0.0
    const dims = (term as any)._core?._renderService?.dimensions?.css?.cell;
    if (!dims?.width || !dims?.height) {
      return { x: 1, y: 1 };
    }

    const rect = container.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    let x = Math.floor(relativeX / dims.width) + 1;
    let y = Math.floor(relativeY / dims.height) + 1;

    x = Math.max(1, Math.min(x, term.cols));
    y = Math.max(1, Math.min(y, term.rows));

    return { x, y };
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (e.touches.length === 1 && touch) {
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (e.touches.length !== 1 || !touch) return;
    if ((window.getSelection()?.toString().length ?? 0) > 0) return;
    const deltaY = touch.clientY - touchStartY.current;
    const threshold = 30;
    if (Math.abs(deltaY) >= threshold) {
      const direction = deltaY < 0 ? "down" : "up";
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const button = direction === "up" ? 64 : 65;
        const { x, y } = getTerminalCoords(touch.clientX, touch.clientY);
        const seq = `\x1b[<${button};${x};${y}M`;
        wsRef.current.send(seq);
      }
      touchStartY.current = touch.clientY;
    }
  };

  return { handleTouchStart, handleTouchMove };
}
