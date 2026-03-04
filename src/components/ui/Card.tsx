'use client'

import type { ReactNode } from 'react'

// ===== MainColumnCard (marumie pattern: 24px radius, responsive padding) =====

interface CardProps {
  readonly children: ReactNode
  readonly className?: string
  readonly accent?: string
  readonly id?: string
}

export function Card({ children, className = '', accent, id }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl sm:rounded-[24px] border border-[#E5E7EB] scroll-mt-20 sm:scroll-mt-24 ${className}`}
      style={accent ? { borderTopWidth: 3, borderTopColor: accent } : undefined}
    >
      {children}
    </div>
  )
}

// ===== CardHeader =====

interface CardHeaderProps {
  readonly children: ReactNode
  readonly className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-4 pt-5 pb-2 sm:px-6 sm:pt-8 sm:pb-3 md:px-10 md:pt-10 ${className}`}>
      {children}
    </div>
  )
}

// ===== CardBody =====

interface CardBodyProps {
  readonly children: ReactNode
  readonly className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`px-4 pb-5 sm:px-6 sm:pb-8 md:px-10 md:pb-10 ${className}`}>{children}</div>
}

// ===== BaseCard (simple inner card - marumie pattern) =====

interface BaseCardProps {
  readonly children: ReactNode
  readonly className?: string
}

export function BaseCard({ children, className = '' }: BaseCardProps) {
  return (
    <div className={`border border-[#E5E7EB] rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  )
}
