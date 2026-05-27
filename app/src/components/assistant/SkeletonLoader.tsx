export function SkeletonLoader() {
  return (
    <div className="skeleton">
      {/* Source tag skeleton */}
      <div className="skeleton-tag shimmer" />
      {/* Copy box skeleton */}
      <div className="skeleton-copy-box" />
      {/* Char count skeleton */}
      <div className="skeleton-char shimmer" />
      {/* Action buttons skeleton */}
      <div className="skeleton-actions-bar shimmer" />
    </div>
  )
}
