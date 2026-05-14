import { useState, useEffect } from "react";

const KEYBOARD_THRESHOLD = 150;

export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isDockedKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const getOrientation = () => {
      return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    };

    let fullHeight = vv.height;
    let currentOrientation = getOrientation();

    const handleResize = () => {
      setViewportHeight(vv.height);

      const newOrientation = getOrientation();
      if (newOrientation !== currentOrientation) {
        currentOrientation = newOrientation;
        fullHeight = vv.height;
      } else if (vv.height > fullHeight) {
        fullHeight = vv.height;
      }

      const diff = fullHeight - vv.height;
      const visible = diff > KEYBOARD_THRESHOLD;

      setIsKeyboardVisible(visible);
    };

    vv.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      vv.removeEventListener("resize", handleResize);
    };
  }, []);

  return { viewportHeight, isDockedKeyboardVisible };
}
