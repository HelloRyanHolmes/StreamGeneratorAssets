import React, { memo } from "react";

interface SkeletonLoaderProps {
  isLoaded: boolean;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = memo(
  ({ isLoaded, className = "" }) => {
    if (isLoaded) return null;

    return (
      <div
        className={`absolute inset-0 skeleton-loader rounded-md animate-pulse bg-gray-200 ${className}`}
        aria-hidden="true"
      />
    );
  }
);

SkeletonLoader.displayName = "SkeletonLoader";

export default SkeletonLoader;
