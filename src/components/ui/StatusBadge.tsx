import type { StatusLevel } from '@/data/types'
import { STATUS_CONFIG } from '@/data/constants'

interface StatusBadgeProps {
  readonly status: StatusLevel
  readonly size?: 'sm' | 'md'
  readonly showLabel?: boolean
}

export function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-8 font-bold ${config.bgClass} ${
        size === 'sm' ? 'text-oln-14B-100 px-2 py-0.5' : 'text-oln-16B-100 px-3 py-1'
      }`}
      style={{ color: config.color }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {showLabel && config.label}
    </span>
  )
}

interface StatusBarProps {
  readonly value: number
  readonly max?: number
  readonly color: string
  readonly height?: number
  readonly showValue?: boolean
  readonly label?: string
}

export function StatusBar({
  value,
  max = 10,
  color,
  height = 8,
  showValue = true,
  label,
}: StatusBarProps) {
  const percentage = Math.min(100, (value / max) * 100)

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-dns-14N-130 text-solid-gray-600">{label}</span>}
          {showValue && <span className="text-dns-14B-130 text-solid-gray-900">{value.toFixed(1)}</span>}
        </div>
      )}
      <div className="w-full bg-solid-gray-100 rounded-full overflow-hidden" style={{ height }}>
        <div
          className="status-bar rounded-full"
          style={{ width: `${percentage}%`, height: '100%', backgroundColor: color }}
        />
      </div>
    </div>
  )
}
