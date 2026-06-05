// src/components/ZactionsPreviewSkeleton.tsx
import { Skeleton } from "./Skeleton";

export function ZactionsPreviewSkeleton() {
  return (
    <div className="zactionsSkeleton" aria-busy="true" aria-label="Loading zactions preview">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton
          key={index}
          className="zactionsSkeletonLine"
          width={index % 3 === 0 ? "92%" : index % 3 === 1 ? "78%" : "64%"}
          height={12}
          rounded="sm"
        />
      ))}
    </div>
  );
}
