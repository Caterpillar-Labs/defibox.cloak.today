// src/types/dropdownTypes.ts
import type { CSSProperties, ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  icon?: string;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  arrowType?: "vertical" | "horizontal";
  style?: CSSProperties;
  showLabel?: boolean;
  openDirection?: "down" | "up";
  icon?: ReactNode;
  hideArrow?: boolean;
  controlledIsOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  connectedRight?: boolean;
  connectedLeft?: boolean;
  embeddedInGroup?: boolean;
  height?: string;
  groupFocused?: boolean;
  groupHovered?: boolean;
  onGroupFocus?: () => void;
  onGroupBlur?: () => void;
  onGroupMouseEnter?: () => void;
  onGroupMouseLeave?: () => void;
  enableSearch?: boolean;
}
