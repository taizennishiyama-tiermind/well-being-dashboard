'use client'

import { memo } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import type { CrossAnalysisPoint } from '@/data/types'

interface BudgetScoreCrossProps {
  readonly crossData: readonly CrossAnalysisPoint[]
}

function getEfficiencyRank(points: readonly CrossAnalysisPoint[], current: CrossAnalysisPoint): number {
  const sorted = [...points].sort((a, b) => b.efficiencyIndex - a.efficiencyIndex)
  return sorted.findIndex((p) => p.categoryId === current.categoryId) + 1
}

function getEfficiencyBadge(point: CrossAnalysisPoint): { label: string; className: string } {
  if (point.efficiencyIndex >= 110) return { label: '高効率', className: 'bg-cyan-100 text-cyan-900' }
  if (point.efficiencyIndex >= 90) return { label: '標準', className: 'bg-solid-gray-100 text-solid-gray-600' }
  return { label: '要改善', className: 'bg-orange-100 text-orange-900' }
}

function getScoreIndicator(score: number, threshold: { good: number; bad: number }): { label: string; color: string } {
  if (score >= threshold.good) return { label: '良好', color: '#0031D8' }
  if (score >= threshold.bad) return { label: '標準', color: '#757780' }
  return { label: '要改善', color: '#D32F2F' }
}

function EfficiencyBar({ label, value, color }: {
  readonly label: string
  readonly value: number
  readonly color: string
}) {
  const diff = value - 100
  const isAbove = diff >= 0

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-solid-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-oln-14B-100" style={{ color }}>
          {value}
        </span>
        <span className={`text-[10px] font-bold ${isAbove ? 'text-blue-900' : 'text-red-900'}`}>
          {isAbove ? '▲' : '▼'}{Math.abs(diff)}pt
        </span>
      </div>
    </div>
  )
}

function BudgetBar({ budget, benchmark, maxBar }: {
  readonly budget: number
  readonly benchmark: number
  readonly maxBar: number
}) {
  const budgetPct = (budget / maxBar) * 100
  const benchmarkPct = (benchmark / maxBar) * 100
  const isOverBenchmark = budget >= benchmark

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-dns-14N-130 text-solid-gray-600">予算/人</span>
        <span className="text-oln-14B-100 text-solid-gray-900">
          {(budget / 10000).toFixed(1)}万円
        </span>
      </div>
      <div className="relative h-2 bg-solid-gray-100 rounded-full overflow-visible">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${Math.min(100, budgetPct)}%`,
            backgroundColor: '#264AF4',
          }}
        />
        <div
          className="absolute top-[-3px] w-[2px] rounded-full"
          style={{
            left: `${Math.min(100, benchmarkPct)}%`,
            height: 8 + 6,
            backgroundColor: '#D32F2F',
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[10px] text-solid-gray-400 flex items-center gap-1">
          <span className="inline-block w-[6px] h-[2px] bg-red-500 rounded-full" />
          全国平均 {(benchmark / 10000).toFixed(1)}万円
        </p>
        <p className={`text-[10px] font-bold ${isOverBenchmark ? 'text-blue-900' : 'text-red-900'}`}>
          {isOverBenchmark ? '+' : ''}{Math.round(((budget - benchmark) / benchmark) * 100)}%
        </p>
      </div>
    </div>
  )
}

export const BudgetScoreCross = memo(function BudgetScoreCross({
  crossData,
}: BudgetScoreCrossProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {crossData.map((point) => {
        const rank = getEfficiencyRank(crossData, point)
        const badge = getEfficiencyBadge(point)
        const subjInd = getScoreIndicator(point.subjectiveScore, { good: 7.0, bad: 5.5 })
        const objInd = getScoreIndicator(point.objectiveComposite, { good: 55, bad: 45 })
        const maxBar = Math.max(point.budgetPerCapita, point.nationalBenchmark.budgetPerCapita) * 1.3

        return (
          <Card key={point.categoryId}>
            <CardBody className="py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <CategoryIcon categoryId={point.categoryId} showLabel />
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-4 text-oln-14B-100 ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="text-oln-14B-100 text-solid-gray-500">
                    #{rank}
                  </span>
                </div>
              </div>

              {/* Budget Bar with national benchmark */}
              <BudgetBar
                budget={point.budgetPerCapita}
                benchmark={point.nationalBenchmark.budgetPerCapita}
                maxBar={maxBar}
              />

              {/* Subjective & Objective scores */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-dns-14N-130 text-solid-gray-500 w-8">主観</span>
                  <div className="flex-1 h-1.5 bg-solid-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(point.subjectiveScore / 10) * 100}%`,
                        backgroundColor: '#E8854A',
                      }}
                    />
                  </div>
                  <span className="text-oln-14B-100 text-solid-gray-900 w-8 text-right">
                    {point.subjectiveScore.toFixed(1)}
                  </span>
                  <span
                    className="text-[11px] font-bold w-12 text-right"
                    style={{ color: subjInd.color }}
                  >
                    {subjInd.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-dns-14N-130 text-solid-gray-500 w-8">客観</span>
                  <div className="flex-1 h-1.5 bg-solid-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${point.objectiveComposite}%`,
                        backgroundColor: '#0031D8',
                      }}
                    />
                  </div>
                  <span className="text-oln-14B-100 text-solid-gray-900 w-8 text-right">
                    {(point.objectiveComposite / 10).toFixed(1)}
                  </span>
                  <span
                    className="text-[11px] font-bold w-12 text-right"
                    style={{ color: objInd.color }}
                  >
                    {objInd.label}
                  </span>
                </div>
                {/* 乖離表示 */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-solid-gray-400 w-8">乖離</span>
                  <span
                    className={`text-[11px] font-bold ${
                      point.gap > 0.3
                        ? 'text-orange-700'
                        : point.gap < -0.3
                          ? 'text-blue-800'
                          : 'text-solid-gray-500'
                    }`}
                  >
                    {point.gap > 0 ? '+' : ''}{point.gap.toFixed(1)}pt
                  </span>
                  {Math.abs(point.gap) > 0.3 && (
                    <span className="text-[10px] text-solid-gray-500 truncate">
                      {point.gap > 0
                        ? '実感あり・客観不足'
                        : '客観充実・実感不足'}
                    </span>
                  )}
                </div>
              </div>

              {/* Efficiency Index (REI) */}
              <div className="pt-3 border-t border-solid-gray-100 space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-dns-14N-130 text-solid-gray-600">効率指数（全国平均=100）</span>
                </div>
                <EfficiencyBar
                  label="主観効率"
                  value={point.subjectiveEI}
                  color="#E8854A"
                />
                <EfficiencyBar
                  label="客観効率"
                  value={point.objectiveEI}
                  color="#0031D8"
                />
                <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-solid-gray-200">
                  <span className="text-oln-14B-100 text-solid-gray-600">総合効率</span>
                  <div className="flex items-center gap-2">
                    <span className="text-std-17B-170 text-solid-gray-900">
                      {point.efficiencyIndex}
                    </span>
                    {(() => {
                      const diff = point.efficiencyIndex - 100
                      return (
                        <span className={`text-[10px] font-bold ${diff >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                          {diff >= 0 ? '▲' : '▼'}{Math.abs(diff)}pt
                        </span>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
})
