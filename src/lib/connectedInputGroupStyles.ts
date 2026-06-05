// src/lib/connectedInputGroupStyles.ts
import type { CSSProperties } from "react";
import { CONNECTED_INPUT_GROUP } from "../constants/connectedInputGroupConstants";

export function resolveConnectedInputGroupBorderColor(active: boolean, hasError = false): string {
  if (hasError) return "#c53030";
  return active ? CONNECTED_INPUT_GROUP.borderActive : CONNECTED_INPUT_GROUP.borderDefault;
}

function connectedInputGroupSegmentBase(extra?: CSSProperties): CSSProperties {
  return {
    boxSizing: "border-box",
    height: CONNECTED_INPUT_GROUP.height,
    background: CONNECTED_INPUT_GROUP.background,
    ...extra,
  };
}

export function connectedInputGroupEmbeddedDropdownStyle(borderColor: string): CSSProperties {
  return {
    ...connectedInputGroupSegmentBase(),
    border: "none",
    borderRight: `1px solid ${borderColor}`,
    borderRadius: 0,
    height: "100%",
  };
}
