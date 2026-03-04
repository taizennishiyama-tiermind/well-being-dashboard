'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardBody } from '@/components/ui/Card'
import { StatusBar } from '@/components/ui/StatusBadge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import type {
  EnhancedInsight,
  InsightSeverity,
  KeyMetric,
  DataSourceType,
  ActionTimeframe,
} from '@/data/types'

// ===== Severity styling =====

const SEVERITY_STYLES: Record<InsightSeverity, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-800', label: '要対応' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-700', label: '要注目' },
  info: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-800', label: '情報' },
  opportunity: { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-800', label: '機会' },
}

const TYPE_LABELS: Record<string, string> = {
  high_spend_low_result: '高予算・低成果',
  low_spend_high_result: '低予算・高成果',
  perception_gap: '認知ギャップ',
  trend_alert: 'トレンド警告',
  regional_disparity: '執行率課題',
}

// ===== Inline sub-components =====

const DATA_TYPE_STYLES: Record<DataSourceType, string> = {
  '主観': 'bg-orange-100 text-orange-800',
  '客観': 'bg-blue-50 text-blue-900',
  '予算': 'bg-solid-gray-100 text-solid-gray-600',
}

function DataTypeBadge({ type }: { readonly type: DataSourceType }) {
  return (
    <span className={`px-1.5 py-0.5 rounded-4 text-[10px] font-bold flex-shrink-0 ${DATA_TYPE_STYLES[type]}`}>
      {type}
    </span>
  )
}

const SEVERITY_COLORS: Record<string, string> = {
  good: 'text-cyan-900',
  bad: 'text-red-900',
  neutral: 'text-solid-gray-900',
}

function KeyMetricTile({ metric }: { readonly metric: KeyMetric }) {
  return (
    <div className="p-3 bg-solid-gray-50 rounded-2xl">
      <div className="flex items-center gap-1.5 mb-1">
        <DataTypeBadge type={metric.dataType} />
        {metric.trend && (
          <span className={`text-[10px] font-bold ${metric.trend.direction === 'down' ? 'text-red-900' : 'text-cyan-900'}`}>
            {metric.trend.direction === 'down' ? '↓' : metric.trend.direction === 'up' ? '↑' : '→'}
            {metric.trend.value}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`text-std-24B-150 ${SEVERITY_COLORS[metric.severity ?? 'neutral']}`}>
          {metric.value}
        </span>
        <span className="text-dns-14N-130 text-solid-gray-500">{metric.unit}</span>
      </div>
      <p className="text-[11px] text-solid-gray-500 mt-0.5 truncate">{metric.label}</p>
    </div>
  )
}

const TIMEFRAME_STYLES: Record<ActionTimeframe, string> = {
  '即座': 'bg-red-100 text-red-800',
  '短期': 'bg-orange-100 text-orange-800',
  '中期': 'bg-blue-50 text-blue-900',
}

// ===== Main component =====

interface EnhancedInsightCardProps {
  readonly insight: EnhancedInsight
}

export function EnhancedInsightCard({ insight }: EnhancedInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const style = SEVERITY_STYLES[insight.severity]
  const typeLabel = TYPE_LABELS[insight.type] ?? insight.type

  return (
    <Card className={`border-l-4 ${style.border}`}>
      <CardBody className="py-5">
        {/* Header badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-3 py-1 rounded-8 text-oln-14B-100 ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <span className="px-2 py-0.5 rounded-4 text-dns-14N-130 bg-solid-gray-100 text-solid-gray-600">
            {typeLabel}
          </span>
          <CategoryIcon categoryId={insight.categoryId} showLabel />
        </div>

        {/* Title + Summary */}
        <h3 className="text-std-17B-170 text-solid-gray-900 mb-2">{insight.title}</h3>
        <p className="text-dns-14N-130 text-solid-gray-600 leading-relaxed mb-4">{insight.summary}</p>

        {/* Key Metrics Grid */}
        {insight.keyMetrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {insight.keyMetrics.map((metric, i) => (
              <KeyMetricTile key={`${metric.label}-${i}`} metric={metric} />
            ))}
          </div>
        )}

        {/* Expand/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center py-2 text-oln-14B-100 text-[#0031D8] hover:bg-blue-50 rounded-8 transition-colors"
        >
          {isExpanded ? '▲ 閉じる' : '▼ 詳細を見る'}
        </button>

        {/* Collapsible detail section */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[3000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-6 border-t border-solid-gray-100 pt-5">
            {/* Sub-indicator breakdown */}
            {insight.subIndicators.length > 0 && (
              <div>
                <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 flex items-center gap-2">
                  <Image src="/icons/search_fill.svg" alt="" width={14} height={14} className="opacity-50" />
                  低スコアの調査項目
                </h4>
                <div className="space-y-2">
                  {insight.subIndicators.map((sub) => (
                    <div key={sub.label} className="flex items-center gap-2">
                      <DataTypeBadge type="主観" />
                      <span className="w-20 text-dns-14N-130 text-solid-gray-700 truncate flex-shrink-0">
                        {sub.label}
                      </span>
                      <div className="flex-1">
                        <StatusBar
                          value={sub.avgScore}
                          max={10}
                          color="#E8854A"
                          height={6}
                          showValue={false}
                        />
                      </div>
                      <span className="text-dns-14B-130 text-solid-gray-900 w-10 text-right flex-shrink-0">
                        {sub.avgScore.toFixed(1)}
                      </span>
                      <span className={`text-[11px] w-14 text-right flex-shrink-0 ${sub.deviation < 0 ? 'text-red-900' : 'text-cyan-900'}`}>
                        {sub.deviation > 0 ? '+' : ''}{sub.deviation.toFixed(1)}pt
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related objective indicators */}
            {insight.relatedIndicators.length > 0 && (
              <div>
                <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 flex items-center gap-2">
                  <Image src="/icons/information_fill.svg" alt="" width={14} height={14} className="opacity-50" />
                  関連する客観指標
                </h4>
                <div className="space-y-1.5">
                  {insight.relatedIndicators.slice(0, 5).map((ind) => {
                    const diff = ind.score - ind.nationalAverage
                    return (
                      <div key={ind.id} className="flex items-center gap-1.5 sm:gap-2 py-1.5 border-b border-solid-gray-50 last:border-0 flex-wrap sm:flex-nowrap">
                        <DataTypeBadge type="客観" />
                        <span className="flex-1 text-dns-14N-130 text-solid-gray-700 truncate min-w-0">
                          {ind.label}
                        </span>
                        <span className="text-dns-14B-130 text-solid-gray-900 flex-shrink-0">
                          {ind.score}
                        </span>
                        <span className="text-[11px] text-solid-gray-500 flex-shrink-0">/100</span>
                        <span className={`text-[11px] flex-shrink-0 w-16 text-right ${diff < 0 ? 'text-red-900' : 'text-cyan-900'}`}>
                          全国比{diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                        <span className="hidden sm:inline text-[10px] text-solid-gray-400 flex-shrink-0 w-14 text-right">
                          {ind.rank}/{ind.totalMunicipalities}位
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Related budget programs */}
            {insight.relatedPrograms.length > 0 && (
              <div>
                <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 flex items-center gap-2">
                  <Image src="/icons/money_fill.svg" alt="" width={14} height={14} className="opacity-50" />
                  関連予算事業
                </h4>
                <div className="space-y-2">
                  {insight.relatedPrograms.map((prog) => (
                    <div key={prog.id} className="p-3 bg-solid-gray-50 rounded-8">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <DataTypeBadge type="予算" />
                          <span className="text-std-16B-170 text-solid-gray-900 truncate">{prog.name}</span>
                        </div>
                        <span className="text-dns-14N-130 text-solid-gray-500 flex-shrink-0 ml-2">
                          {(prog.budgetAmount / 100_000_000).toFixed(1)}億円
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <StatusBar
                            value={prog.executionRate}
                            max={100}
                            color={prog.executionRate < 75 ? '#E07930' : prog.executionRate < 85 ? '#D4920B' : '#0031D8'}
                            height={5}
                            showValue={false}
                          />
                        </div>
                        <span className="text-dns-14N-130 text-solid-gray-700 flex-shrink-0 w-10 text-right">
                          {prog.executionRate}%
                        </span>
                        <span className={`text-[11px] flex-shrink-0 w-14 text-right ${prog.changeRate > 0 ? 'text-cyan-900' : 'text-red-900'}`}>
                          {prog.changeRate > 0 ? '+' : ''}{prog.changeRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hypotheses */}
            {insight.hypotheses.length > 0 && (
              <div>
                <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 flex items-center gap-2">
                  <Image src="/icons/help_fill.svg" alt="" width={14} height={14} className="opacity-50" />
                  仮説
                </h4>
                <div className="space-y-2">
                  {insight.hypotheses.map((hyp, i) => (
                    <div key={`hyp-${i}`} className="p-3 bg-yellow-50 rounded-8 border-l-[3px] border-yellow-600">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-yellow-800 bg-yellow-200 px-1.5 py-0.5 rounded-4">
                          確度: {hyp.confidence}
                        </span>
                      </div>
                      <p className="text-dns-14N-130 text-solid-gray-700 leading-relaxed">{hyp.statement}</p>
                      {hyp.supportingEvidence.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {hyp.supportingEvidence.map((ev, j) => (
                            <li key={`ev-${j}`} className="text-[12px] text-solid-gray-500 flex gap-1">
                              <span className="flex-shrink-0">・</span>
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Steps */}
            {insight.actionSteps.length > 0 && (
              <div>
                <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 flex items-center gap-2">
                  <Image src="/icons/complete_fill.svg" alt="" width={14} height={14} className="opacity-50" />
                  推奨アクション
                </h4>
                <div className="space-y-3">
                  {insight.actionSteps.map((step) => (
                    <div key={`step-${step.order}`} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-oln-14B-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step.order}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-4 text-[10px] font-bold ${TIMEFRAME_STYLES[step.timeframe]}`}>
                            {step.timeframe}
                          </span>
                          {step.targetProgram && (
                            <span className="text-[11px] text-solid-gray-500 truncate">
                              対象: {step.targetProgram}
                            </span>
                          )}
                        </div>
                        <p className="text-std-16B-170 text-solid-gray-900 leading-relaxed">{step.action}</p>
                        <p className="text-[12px] text-solid-gray-500 mt-0.5">
                          期待効果: {step.expectedOutcome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
