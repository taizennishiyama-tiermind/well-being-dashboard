'use client'

import { memo } from 'react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { CATEGORIES } from '@/data/constants'
import type { CategoryId, FiscalYear } from '@/data/types'

interface TrendEntry {
  readonly year: FiscalYear
  readonly budget: number
  readonly executed: number
}

interface BudgetTrendPanelProps {
  readonly trendData: Record<CategoryId, readonly TrendEntry[]>
}

function getDirectionColor(first: number, last: number): string {
  const change = last - first
  const pct = first > 0 ? (change / first) * 100 : 0
  if (pct > 3) return '#1A8C3D'
  if (pct < -3) return '#D32F2F'
  return '#757780'
}

function MiniSparkline({ data, color }: { data: readonly TrendEntry[]; color: string }) {
  if (data.length < 2) return null

  const values = data.map((d) => d.budget)
  const max = Math.max(...values) * 1.1
  const min = Math.min(...values) * 0.9
  const range = max - min || 1

  const w = 100
  const h = 28
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  })

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return (
          <circle key={i} cx={x} cy={y} r={2.5} fill={color} />
        )
      })}
    </svg>
  )
}

export const BudgetTrendPanel = memo(function BudgetTrendPanel({
  trendData,
}: BudgetTrendPanelProps) {
  const yearTotals: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    const entries = trendData[cat.id]
    if (!entries) continue
    for (const entry of entries) {
      yearTotals[entry.year] = (yearTotals[entry.year] ?? 0) + entry.budget
    }
  }

  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const entries = trendData[cat.id]
        if (!entries || entries.length < 2) return null

        const latest = entries[entries.length - 1]
        const prev = entries[entries.length - 2]
        const first = entries[0]
        const yoyChange = prev.budget > 0
          ? Math.round(((latest.budget - prev.budget) / prev.budget) * 1000) / 10
          : 0
        const execRate = latest.budget > 0
          ? Math.round((latest.executed / latest.budget) * 1000) / 10
          : 0

        const sparkColor = getDirectionColor(first.budget, latest.budget)

        const latestRatio = yearTotals[latest.year] > 0
          ? Math.round((latest.budget / yearTotals[latest.year]) * 1000) / 10
          : 0
        const firstRatio = yearTotals[first.year] > 0
          ? Math.round((first.budget / yearTotals[first.year]) * 1000) / 10
          : 0

        return (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3 rounded-8 bg-solid-gray-50"
          >
            <CategoryIcon categoryId={cat.id} size={20} />
            <span className="text-dns-14N-130 text-solid-gray-800 w-24 truncate flex-shrink-0">
              {cat.label}
            </span>

            <MiniSparkline data={entries} color={sparkColor} />

            {/* 前年比 */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[10px] text-solid-gray-400 mb-0.5">前年比</span>
              <span
                className={`text-oln-14B-100 px-2 py-0.5 rounded-4 ${
                  yoyChange >= 0
                    ? 'bg-cyan-50 text-cyan-900'
                    : 'bg-red-50 text-red-900'
                }`}
              >
                {yoyChange > 0 ? '+' : ''}{yoyChange}%
              </span>
            </div>

            {/* 配分比率 */}
            {(() => {
              const ratioDiff = Math.round((latestRatio - firstRatio) * 10) / 10
              const isUp = ratioDiff > 0
              const isDown = ratioDiff < 0
              return (
                <div className="flex flex-col items-center flex-shrink-0 min-w-[72px]">
                  <span className="text-[10px] text-solid-gray-400 mb-0.5">配分比率</span>
                  <div className="flex items-center gap-1">
                    <span className="text-oln-14B-100 text-solid-gray-800">
                      {latestRatio}%
                    </span>
                    {ratioDiff !== 0 && (
                      <span
                        className={`text-[10px] font-bold px-1 py-px rounded ${
                          isUp
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {isUp ? '▲' : '▼'}{Math.abs(ratioDiff).toFixed(1)}
                      </span>
                    )}
                    {ratioDiff === 0 && (
                      <span className="text-[10px] text-solid-gray-400">→</span>
                    )}
                  </div>
                </div>
              )
            })()}

            <div className="flex-1 text-right min-w-0">
              <p className="text-oln-14B-100 text-solid-gray-900">
                {(latest.budget / 100_000_000).toFixed(1)}億
              </p>
              <p className="text-dns-14N-130 text-solid-gray-500">
                執行率{execRate}%
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
})
