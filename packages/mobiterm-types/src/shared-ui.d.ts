declare module "@mobiterm/shared-ui" {
  import type { ComponentType } from "react";
  export const StandardButton: ComponentType<{
    label: string;
    onClick: () => void;
  }>;
  export const ToggleButton: ComponentType<{
    label: string;
    isActive: boolean;
    onClick: () => void;
  }>;
}
