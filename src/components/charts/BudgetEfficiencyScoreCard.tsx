'use client'

import { memo, useMemo } from 'react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import type { BudgetEfficiencyMetrics, EfficiencyGrade } from '@/data/types'
import { GRADE_CONFIG } from '@/data/constants'
import { getEfficiencySummary } from '@/data/budgetAnalysis'

interface BudgetEfficiencyScoreCardProps {
  readonly data: readonly BudgetEfficiencyMetrics[]
}

function GradeBadge({
  grade,
  size = 'sm',
}: {
  readonly grade: EfficiencyGrade
  readonly size?: 'sm' | 'lg'
}) {
  const config = GRADE_CONFIG[grade]
  const dimension = size === 'lg' ? 'w-12 h-12 text-std-20B-160' : 'w-7 h-7 text-oln-14B-100'

  return (
    <span
      className={`${dimension} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ backgroundColor: `${config.color}18`, color: config.color }}
    >
      {config.label}
    </span>
  )
}

function CPPRow({
  label,
  localCPP,
  nationalCPP,
  ratio,
  grade,
  isBold,
}: {
  readonly label: string
  readonly localCPP: number
  readonly nationalCPP: number
  readonly ratio: number
  readonly grade: EfficiencyGrade
  readonly isBold?: boolean
}) {
  const diff = Math.round((ratio - 1) * 100)
  const isEfficient = diff >= 0
  const gradeConfig = GRADE_CONFIG[grade]
  const textClass = isBold ? 'text-oln-14B-100' : 'text-dns-14N-130'

  return (
    <div className="flex items-center gap-2">
      <span className={`w-7 text-[11px] text-solid-gray-500 flex-shrink-0 ${isBold ? 'font-bold' : ''}`}>
        {label}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`${textClass} text-solid-gray-900`}>
            {localCPP > 0 ? `¥${localCPP.toLocaleString()}` : '--'}/pt
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-solid-gray-400">
              全国¥{nationalCPP > 0 ? nationalCPP.toLocaleString() : '--'}
            </span>
            <span
              className="text-[10px] font-bold min-w-[40px] text-right"
              style={{ color: gradeConfig.color }}
            >
              {isEfficient ? '+' : ''}{diff}%
              {isEfficient ? ' ▲' : ' ▼'}
            </span>
          </div>
        </div>
        {/* Ratio bar: 100% = national average center */}
        <RatioBar ratio={ratio} color={gradeConfig.color} />
      </div>
    </div>
  )
}

function RatioBar({
  ratio,
  color,
}: {
  readonly ratio: number
  readonly color: string
}) {
  // Bar represents 50%-150% range, centered at 100%
  const clampedRatio = Math.max(0.5, Math.min(1.5, ratio))
  const position = ((clampedRatio - 0.5) / 1.0) * 100
  const centerPct = 50

  return (
    <div className="relative h-1.5 bg-solid-gray-100 rounded-full mt-1">
      {/* Center line (national average) */}
      <div
        className="absolute top-[-1px] w-[1px] h-[8px] bg-solid-gray-300"
        style={{ left: `${centerPct}%` }}
      />
      {/* Local position indicator */}
      <div
        className="absolute top-[-1px] w-[6px] h-[8px] rounded-full"
        style={{
          left: `${Math.min(97, Math.max(1, position))}%`,
          transform: 'translateX(-50%)',
          backgroundColor: color,
        }}
      />
      {/* Fill from center to position */}
      {ratio >= 1 ? (
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${centerPct}%`,
            width: `${position - centerPct}%`,
            backgroundColor: color,
            opacity: 0.2,
          }}
        />
      ) : (
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${position}%`,
            width: `${centerPct - position}%`,
            backgroundColor: color,
            opacity: 0.2,
          }}
        />
      )}
    </div>
  )
}

export const BudgetEfficiencyScoreCard = memo(function BudgetEfficiencyScoreCard({
  data,
}: BudgetEfficiencyScoreCardProps) {
  const summary = useMemo(() => getEfficiencySummary(data), [data])

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-solid-gray-50">
        <GradeBadge grade={summary.overallGrade} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-std-17B-170 text-solid-gray-900">
              全体の予算効率
            </span>
            <span className="text-oln-14B-100 text-solid-gray-600">
              {summary.avgPercentile}pt
            </span>
            <span className="text-[11px] text-solid-gray-400">
              （全国平均=100）
            </span>
          </div>
          <p className="text-[11px] text-solid-gray-500 mt-0.5">
            {GRADE_CONFIG[summary.overallGrade].description}
          </p>
        </div>
        <div className="hidden sm:flex gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-8 bg-white border border-solid-gray-200">
            <GradeBadge grade={summary.bestCategory.grade} />
            <div>
              <p className="text-[10px] text-solid-gray-400">最も効率的</p>
              <p className="text-oln-14B-100 text-solid-gray-900">{summary.bestCategory.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-8 bg-white border border-solid-gray-200">
            <GradeBadge grade={summary.worstCategory.grade} />
            <div>
              <p className="text-[10px] text-solid-gray-400">要改善</p>
              <p className="text-oln-14B-100 text-solid-gray-900">{summary.worstCategory.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-[11px] text-solid-gray-400 mb-4 px-1">
        コスト/ポイント (CPP) = 1人あたり予算 / スコア。値が小さいほど少ない予算で高スコアを達成しており効率的です。全国平均との比率で S〜D にグレード化しています。
      </p>

      {/* Category cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((metrics) => (
          <div
            key={metrics.categoryId}
            className="rounded-2xl border border-solid-gray-200 p-4"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-3">
              <CategoryIcon categoryId={metrics.categoryId} showLabel />
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-4 text-oln-14B-100 ${GRADE_CONFIG[metrics.grade].bgClass}`}>
                  {GRADE_CONFIG[metrics.grade].label}
                </span>
              </div>
            </div>

            {/* Budget context */}
            <div className="flex items-center justify-between mb-3 text-[11px] text-solid-gray-500">
              <span>予算 {(metrics.budgetPerCapita / 10000).toFixed(1)}万円/人</span>
              <span>全国 {(metrics.nationalBudgetPerCapita / 10000).toFixed(1)}万円/人</span>
            </div>

            {/* CPP rows */}
            <div className="space-y-2.5">
              <CPPRow
                label="主観"
                localCPP={metrics.localCPP.subjective}
                nationalCPP={metrics.nationalCPP.subjective}
                ratio={metrics.efficiencyRatio.subjective}
                grade={metrics.gradeDetail.subjective}
              />
              <CPPRow
                label="客観"
                localCPP={metrics.localCPP.objective}
                nationalCPP={metrics.nationalCPP.objective}
                ratio={metrics.efficiencyRatio.objective}
                grade={metrics.gradeDetail.objective}
              />
              <div className="border-t border-dashed border-solid-gray-200 pt-2">
                <CPPRow
                  label="総合"
                  localCPP={metrics.localCPP.combined}
                  nationalCPP={metrics.nationalCPP.combined}
                  ratio={metrics.efficiencyRatio.combined}
                  grade={metrics.grade}
                  isBold
                />
              </div>
            </div>

            {/* Score context */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-solid-gray-100">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-solid-gray-400">主観</span>
                <span className="text-oln-14B-100" style={{ color: '#E8854A' }}>
                  {metrics.subjectiveScore.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-solid-gray-400">客観</span>
                <span className="text-oln-14B-100" style={{ color: '#0031D8' }}>
                  {metrics.objectiveScore.toFixed(1)}
                </span>
              </div>
              <div className="text-[10px] text-solid-gray-400 ml-auto">
                {GRADE_CONFIG[metrics.grade].description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
