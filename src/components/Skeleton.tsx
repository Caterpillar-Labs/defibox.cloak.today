// src/components/Skeleton.tsx
import type { CSSProperties } from "react";

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "pill" | "full";
  style?: CSSProperties;
};

const roundedClass: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "skeletonRoundedSm",
  md: "skeletonRoundedMd",
  lg: "skeletonRoundedLg",
  pill: "skeletonRoundedPill",
  full: "skeletonRoundedFull",
};

export function Skeleton({ className = "", width, height, rounded = "md", style }: SkeletonProps) {
  return (
    <span
      className={`skeleton ${roundedClass[rounded]} ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
