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
      className={`bg-white rounded-[24px] border border-[#E5E7EB] scroll-mt-24 ${className}`}
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
    <div className={`px-6 pt-8 pb-3 sm:px-10 sm:pt-10 ${className}`}>
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
  return <div className={`px-6 pb-8 sm:px-10 sm:pb-10 ${className}`}>{children}</div>
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
