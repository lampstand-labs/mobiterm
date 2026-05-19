import type { ExtensionSlot as ExtSlot } from "@lampstand-labs/mobiterm-types";
import { useExtensionContext } from "./useExtensionContext";

interface ExtensionSlotProps {
  slot: ExtSlot;
}

export function ExtensionSlot({ slot }: ExtensionSlotProps) {
  const ctx = useExtensionContext();
  return ctx.slots[slot].map((entry, i) => (
    <entry.Component key={i} {...ctx.terminal} />
  ));
}
