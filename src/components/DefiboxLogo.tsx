// src/components/DefiboxLogo.tsx
import type { SVGProps } from "react";

type DefiboxLogoProps = SVGProps<SVGSVGElement> & {
  topColor?: string;
  bottomColor?: string;
};

export function DefiboxLogo({
  width = 32,
  height,
  topColor = "#D17100",
  bottomColor = "#FF9111",
  ...props
}: DefiboxLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1039 1024"
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M0 687.602849V345.459098L468.568962 16.134686a88.409238 88.409238 0 0 1 101.670624 0L1038.808547 345.459098v342.143751L544.82193 340.375567a44.204619 44.204619 0 0 0-50.835312 0z"
        fill={topColor}
      />
      <path
        d="M0 336.397151V678.540902l468.568962 329.324412a88.409238 88.409238 0 0 0 101.670624 0L1038.808547 678.540902V336.397151L544.82193 683.624433a44.204619 44.204619 0 0 1-50.835312 0z"
        fill={bottomColor}
      />
    </svg>
  );
}