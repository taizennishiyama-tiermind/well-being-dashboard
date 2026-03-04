'use client'

import { useEffect, useState } from 'react'
import { getStatusLevel, STATUS_CONFIG } from '@/data/constants'

interface ScoreGaugeProps {
  readonly score: number
  readonly maxScore?: number
  readonly size?: number
  readonly strokeWidth?: number
  readonly label?: string
}

export function ScoreGauge({
  score,
  maxScore = 10,
  size = 160,
  strokeWidth = 10,
  label,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const status = getStatusLevel(score)
  const { color, label: statusLabel } = STATUS_CONFIG[status]

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = animatedScore / maxScore
  const offset = circumference * (1 - progress)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#D9DCE2" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={offset} className="score-circle"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-std-36B-140 text-solid-gray-900">{score.toFixed(1)}</span>
          <span className="text-dns-14N-130 text-solid-gray-500">/ {maxScore}</span>
        </div>
      </div>
      {label && <span className="text-dns-14B-130 text-solid-gray-600">{label}</span>}
      <span
        className="text-oln-14B-100 px-3 py-0.5 rounded-8"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {statusLabel}
      </span>
    </div>
  )
}

interface MiniGaugeProps {
  readonly score: number
  readonly maxScore?: number
  readonly size?: number
}

export function MiniGauge({ score, maxScore = 10, size = 44 }: MiniGaugeProps) {
  const status = getStatusLevel(score)
  const { color } = STATUS_CONFIG[status]
  const sw = 3
  const radius = (size - sw) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / maxScore)

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#D9DCE2" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-dns-14B-130 text-solid-gray-900">
        {score.toFixed(1)}
      </span>
    </div>
  )
}
