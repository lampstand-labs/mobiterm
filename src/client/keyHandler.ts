import type { Terminal } from "@xterm/xterm";

export function setupKeyHandler(terminal: Terminal) {
  terminal.attachCustomKeyEventHandler((ev) => {
    // Detect Safari's bug: keyCode is 13 (Enter) but the physical key is 'c' with Control
    if (
      ev.type === "keydown" &&
      ev.keyCode === 13 &&
      ev.key === "c" &&
      ev.ctrlKey
    ) {
      terminal.input("\x03");
      ev.preventDefault();
      return false;
    }
    return true;
  });
}
