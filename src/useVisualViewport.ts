import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      setViewportHeight(vv.height);
    };

    vv.addEventListener("resize", handleResize);
    handleResize();

    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  return viewportHeight;
}
