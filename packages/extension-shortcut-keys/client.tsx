import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { ExtensionSlot } from "@lampstand-labs/mobiterm-types";
import type {
  ClientExtension,
  SlotProps,
} from "@lampstand-labs/mobiterm-types";
import { StandardButton, ToggleButton } from "@mobiterm/shared-ui";

type ShortcutKeyDef = { label: string; seq: string };

const SHORTCUT_KEYS: ShortcutKeyDef[] = [
  { label: "Home", seq: "\x1b[H" },
  { label: "End", seq: "\x1b[F" },
  { label: "PgUp", seq: "\x1b[5~" },
  { label: "PgDn", seq: "\x1b[6~" },
];

const ShortcutKeysCtx = createContext({
  showExtra: false,
  toggle: () => {},
});

function ShortcutKeysProvider({ children }: { children: ReactNode }) {
  const [showExtra, setShowExtra] = useState(false);
  return (
    <ShortcutKeysCtx.Provider
      value={{ showExtra, toggle: () => setShowExtra((v) => !v) }}
    >
      {children}
    </ShortcutKeysCtx.Provider>
  );
}

function ShortcutKeysBar({ send }: SlotProps) {
  const { showExtra } = useContext(ShortcutKeysCtx);
  if (!showExtra) return null;
  return (
    <div className="button-bar">
      {SHORTCUT_KEYS.map((k) => (
        <StandardButton
          key={k.label}
          label={k.label}
          onClick={() => send(k.seq)}
        />
      ))}
    </div>
  );
}

function ToggleBtn(_: SlotProps) {
  const { showExtra, toggle } = useContext(ShortcutKeysCtx);
  return (
    <ToggleButton
      label={showExtra ? "Hide" : "…"}
      isActive={showExtra}
      onClick={toggle}
    />
  );
}

const extension: ClientExtension = {
  Provider: ShortcutKeysProvider,
  slots: [
    { slot: ExtensionSlot.ToolbarAbove, Component: ShortcutKeysBar },
    { slot: ExtensionSlot.ToolbarInside, Component: ToggleBtn },
  ],
};

window.__mobiterm_extensions!.register(extension);
