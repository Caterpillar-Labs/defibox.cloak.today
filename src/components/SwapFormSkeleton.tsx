// src/components/SwapFormSkeleton.tsx
import { Skeleton } from "./Skeleton";

export function SwapFormSkeleton() {
  return (
    <div className="swapFormSkeleton" aria-busy="true" aria-label="Loading swap form">
      <div className="swapCard">
        <TokenBoxSkeleton />
        <div className="switchButtonSkeleton" aria-hidden="true" />
        <TokenBoxSkeleton />
      </div>

      <div className="details skeletonDetails">
        <div className="detailsHeader">
          <Skeleton width={56} height={14} rounded="sm" />
          <Skeleton width={48} height={14} rounded="sm" />
        </div>
        <div className="detailsBody">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="detailRow" key={index}>
              <Skeleton width="34%" height={14} rounded="sm" />
              <Skeleton width="42%" height={14} rounded="sm" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="skeletonPrimaryButton" height={52} rounded="md" />
    </div>
  );
}

function TokenBoxSkeleton() {
  return (
    <div className="tokenBox skeletonTokenBox">
      <div className="tokenBoxTop">
        <Skeleton width={72} height={12} rounded="sm" />
        <Skeleton width={110} height={12} rounded="sm" />
      </div>
      <div className="tokenMain">
        <div className="tokenBadge">
          <Skeleton width={40} height={40} rounded="full" />
          <span className="skeletonTokenMeta">
            <Skeleton width={56} height={14} rounded="sm" />
            <Skeleton width={96} height={11} rounded="sm" />
          </span>
        </div>
        <Skeleton className="skeletonAmount" height={34} rounded="sm" />
      </div>
    </div>
  );
}
