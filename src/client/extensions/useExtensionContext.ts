import { createContext, useContext } from "react";
import type { TerminalHandle } from "../Terminal";
import type { ExtensionSlot, SlotEntry } from "./types";

interface ExtensionContextValue {
  slots: Record<ExtensionSlot, SlotEntry[]>;
  terminal: TerminalHandle;
}

export const ExtensionCtx = createContext<ExtensionContextValue | null>(null);

export function useExtensionContext(): ExtensionContextValue {
  const ctx = useContext(ExtensionCtx);
  if (!ctx) {
    throw new Error(
      "useExtensionContext must be used within ExtensionProvider",
    );
  }
  return ctx;
}
