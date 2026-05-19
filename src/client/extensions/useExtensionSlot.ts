import type { ExtensionSlot, SlotEntry } from "./types";
import { useExtensionContext } from "./useExtensionContext";

export function useExtensionSlot(slot: ExtensionSlot): SlotEntry[] {
  return useExtensionContext().slots[slot];
}
