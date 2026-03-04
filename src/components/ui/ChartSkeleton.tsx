interface ChartSkeletonProps {
  readonly height?: number
  readonly className?: string
}

export function ChartSkeleton({ height = 320, className = '' }: ChartSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-2xl ${className}`}
      style={{ height }}
      role="status"
      aria-label="読み込み中"
    />
  )
}
