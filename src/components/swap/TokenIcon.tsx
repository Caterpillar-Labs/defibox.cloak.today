// src/components/swap/TokenIcon.tsx
import { useEffect, useState } from "react";
import { resolveTokenIconColors, resolveTokenIconPath } from "../../lib/tokenIcon";
import { useChainMetadata } from "../../providers/ChainMetadataProvider";
import { Skeleton } from "../Skeleton";

type TokenIconProps = {
  code: string;
  size?: number;
};

export function TokenIcon({ code, size = 40 }: TokenIconProps) {
  const { resolveTokenIcon, expectsTokenIcon } = useChainMetadata();
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [resolveDone, setResolveDone] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const staticIconPath = resolveTokenIconPath(code);
  const expectsIcon = expectsTokenIcon(code);
  const colors = resolveTokenIconColors(code);
  const letter = code.trim().slice(0, 1).toUpperCase() || "?";
  const displayUrl = iconUrl || staticIconPath;

  useEffect(() => {
    let cancelled = false;
    setImageFailed(false);
    setImageLoaded(false);
    setResolveDone(false);
    setIconUrl(null);

    void resolveTokenIcon(code).then((url) => {
      if (cancelled) return;
      setIconUrl(url.trim() || null);
      setResolveDone(true);
    });

    return () => {
      cancelled = true;
    };
  }, [code, resolveTokenIcon]);

  const showSkeleton = expectsIcon && (!resolveDone || !displayUrl || (!imageLoaded && !imageFailed));

  if (showSkeleton) {
    return (
      <span className="tokenIconShell" style={{ width: size, height: size }}>
        <Skeleton width={size} height={size} rounded="full" />
        {displayUrl && !imageFailed && (
          <img
            className="tokenIconPreload"
            src={displayUrl}
            alt=""
            aria-hidden="true"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        )}
      </span>
    );
  }

  if (displayUrl && !imageFailed) {
    return (
      <img
        className="tokenIconImage"
        src={displayUrl}
        width={size}
        height={size}
        alt=""
        onLoad={() => setImageLoaded(true)}
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
