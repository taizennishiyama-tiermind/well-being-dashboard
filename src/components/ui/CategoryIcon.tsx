import Image from 'next/image'
import type { CategoryId } from '@/data/types'
import { getCategoryMeta } from '@/data/constants'

interface CategoryIconProps {
  readonly categoryId: CategoryId
  readonly size?: number
  readonly className?: string
  readonly showLabel?: boolean
}

export function CategoryIcon({
  categoryId,
  size = 28,
  className = '',
  showLabel = false,
}: CategoryIconProps) {
  const meta = getCategoryMeta(categoryId)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex items-center justify-center rounded-4 p-1"
        style={{ backgroundColor: `${meta.color}12` }}
      >
        <Image
          src={`/icons/${meta.icon}`}
          alt={meta.label}
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
      {showLabel && (
        <span className="text-std-16B-170 text-solid-gray-900">{meta.label}</span>
      )}
    </div>
  )
}
