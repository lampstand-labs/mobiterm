import type { ComponentType, ReactNode } from "react";
import type { TerminalHandle } from "../Terminal";

export type SlotProps = TerminalHandle;

export enum ExtensionSlot {
  ToolbarAbove = "toolbar-above",
  ToolbarInside = "toolbar-inside",
}

export interface SlotEntry {
  slot: ExtensionSlot;
  Component: ComponentType<SlotProps>;
}

export interface ClientExtension {
  Provider?: ComponentType<{ children: ReactNode }>;
  slots: SlotEntry[];
}

declare global {
  interface Window {
    __mobiterm_extensions?: {
      register: (ext: ClientExtension) => void;
      getAll: () => ClientExtension[];
    };
  }
}
