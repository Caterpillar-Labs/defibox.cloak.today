// src/components/swap/TokenIcon.tsx
import { useState } from "react";
import { resolveTokenIconColors, resolveTokenIconPath } from "../../lib/tokenIcon";

type TokenIconProps = {
  code: string;
  size?: number;
};

export function TokenIcon({ code, size = 40 }: TokenIconProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const iconPath = resolveTokenIconPath(code);
  const colors = resolveTokenIconColors(code);
  const letter = code.trim().slice(0, 1).toUpperCase() || "?";

  if (iconPath && !imageFailed) {
    return (
      <img
        className="tokenIconImage"
        src={iconPath}
        width={size}
        height={size}
        alt=""
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className="tokenIconFallback"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
      }}>
      {letter}
    </span>
  );
}
