import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { TerminalHandle } from "../Terminal";
import type {
  ClientExtension,
  SlotEntry,
} from "@lampstand-labs/mobiterm-types";
import { ExtensionSlot } from "@lampstand-labs/mobiterm-types";
import { ExtensionCtx } from "./useExtensionContext";

interface ExtensionProviderProps {
  terminal: TerminalHandle;
  children: ReactNode;
}

export function ExtensionProvider({
  terminal,
  children,
}: ExtensionProviderProps) {
  const [extensions, setExtensions] = useState<ClientExtension[]>([]);

  useEffect(() => {
    const reg = window.__mobiterm_extensions;
    if (reg?.getAll) {
      setExtensions(reg.getAll());
    }
  }, []);

  const slots = useMemo(() => {
    const map = {
      [ExtensionSlot.ToolbarAbove]: [] as SlotEntry[],
      [ExtensionSlot.ToolbarInside]: [] as SlotEntry[],
    };
    for (const ext of extensions) {
      for (const entry of ext.slots) {
        map[entry.slot].push(entry);
      }
    }
    return map;
  }, [extensions]);

  let wrapped = children;
  for (const ext of extensions) {
    if (ext.Provider) {
      const P = ext.Provider;
      wrapped = <P>{wrapped}</P>;
    }
  }

  return (
    <ExtensionCtx.Provider value={{ slots, terminal }}>
      {wrapped}
    </ExtensionCtx.Provider>
  );
}
