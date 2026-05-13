import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport.height);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    handleResize();

    return () =>
      window.visualViewport.removeEventListener("resize", handleResize);
  }, []);

  return viewportHeight;
}
