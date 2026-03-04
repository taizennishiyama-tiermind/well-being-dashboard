'use client'

import { useState } from 'react'
import type { ObjectiveIndicatorMeta, ObjectiveIndicatorValue, ObjectiveDomainMeta } from '@/data/types'

interface HeatmapCell {
  readonly indicator: ObjectiveIndicatorMeta
  readonly value: ObjectiveIndicatorValue
}

interface IndicatorHeatmapProps {
  readonly domain: ObjectiveDomainMeta
  readonly indicators: readonly ObjectiveIndicatorMeta[]
  readonly values: readonly ObjectiveIndicatorValue[]
  readonly onSelectIndicator?: (indicatorId: string) => void
  readonly selectedIndicatorId?: string | null
}

const INITIAL_VISIBLE = 6

function scoreToColor(score: number): string {
  if (score >= 70) return '#0031D8'
  if (score >= 60) return '#264AF4'
  if (score >= 50) return '#D4920B'
  if (score >= 40) return '#E07930'
  return '#D32F2F'
}

function scoreToBgClass(score: number): string {
  if (score >= 70) return 'bg-blue-50'
  if (score >= 60) return 'bg-sky-50'
  if (score >= 50) return 'bg-yellow-50'
  if (score >= 40) return 'bg-orange-50'
  return 'bg-red-50'
}

export function IndicatorHeatmap({
  domain,
  indicators,
  values,
  onSelectIndicator,
  selectedIndicatorId,
}: IndicatorHeatmapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedSubDomains, setExpandedSubDomains] = useState<ReadonlySet<string>>(new Set())

  const valueMap = new Map(values.map((v) => [v.indicatorId, v]))

  const groupedBySubDomain = domain.subDomains.map((sd) => {
    const cells: HeatmapCell[] = sd.indicatorIds
      .map((id) => {
        const ind = indicators.find((i) => i.id === id)
        const val = valueMap.get(id)
        return ind && val ? { indicator: ind, value: val } : null
      })
      .filter((c): c is HeatmapCell => c !== null)

    return { subDomain: sd, cells }
  })

  function toggleSubDomain(sdId: string) {
    setExpandedSubDomains((prev) => {
      const next = new Set(prev)
      if (next.has(sdId)) {
        next.delete(sdId)
      } else {
        next.add(sdId)
      }
      return next
    })
  }

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex items-center justify-end gap-3">
        <span className="text-dns-14N-130 text-solid-gray-500">スコア:</span>
        {[
          { min: 70, label: '70+', color: '#0031D8' },
          { min: 60, label: '60-69', color: '#264AF4' },
          { min: 50, label: '50-59', color: '#D4920B' },
          { min: 40, label: '40-49', color: '#E07930' },
          { min: 0, label: '~39', color: '#D32F2F' },
        ].map((item) => (
          <div key={item.min} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-2"
              style={{ backgroundColor: item.color, opacity: 0.85 }}
            />
            <span className="text-dns-14N-130 text-solid-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Sub-domain groups */}
      {groupedBySubDomain.map(({ subDomain, cells }) => {
        const isExpanded = expandedSubDomains.has(subDomain.id)
        const hasMore = cells.length > INITIAL_VISIBLE
        const visibleCells = isExpanded ? cells : cells.slice(0, INITIAL_VISIBLE)

        return (
          <div key={subDomain.id}>
            <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 pl-1">
              {subDomain.label}
            </h4>
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visibleCells.map(({ indicator, value }) => {
                  const isSelected = selectedIndicatorId === indicator.id
                  const isHovered = hoveredId === indicator.id
                  const score = value.normalizedScore
                  const color = scoreToColor(score)
                  const diff = score - value.nationalAverage
                  const trend = value.normalizedScore - value.previousYearScore

                  return (
                    <button
                      key={indicator.id}
                      onClick={() => onSelectIndicator?.(indicator.id)}
                      onMouseEnter={() => setHoveredId(indicator.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`
                        text-left p-4 rounded-8 border transition-colors
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500
                        ${isSelected ? 'ring-2 ring-blue-900 ring-offset-1 border-blue-900' : 'border-solid-gray-200'}
                        ${isHovered ? 'shadow-sm' : ''}
                        ${scoreToBgClass(score)}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-dns-14N-130 text-solid-gray-800 leading-tight line-clamp-2">
                          {indicator.label}
                        </span>
                        <span
                          className="text-std-16B-170 flex-shrink-0"
                          style={{ color }}
                        >
                          {score}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-dns-14N-130">
                        <span className={diff >= 0 ? 'text-green-900' : 'text-red-900'}>
                          全国比{diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                        <span className={trend >= 0 ? 'text-cyan-900' : 'text-orange-800'}>
                          {trend >= 0 ? '↑' : '↓'}{Math.abs(trend).toFixed(1)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {hasMore && !isExpanded && (
                <div className="relative mt-0">
                  <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => toggleSubDomain(subDomain.id)}
                      className="text-dns-14N-130 text-[#0031D8] hover:underline transition-colors px-4 py-2"
                    >
                      もっと見る（残り{cells.length - INITIAL_VISIBLE}件）
                    </button>
                  </div>
                </div>
              )}

              {hasMore && isExpanded && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => toggleSubDomain(subDomain.id)}
                    className="text-dns-14N-130 text-[#0031D8] hover:underline transition-colors px-4 py-2"
                  >
                    折りたたむ
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
