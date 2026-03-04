'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatusBar } from '@/components/ui/StatusBadge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { IllustrationPanel, HandGesture } from '@/components/ui/IllustrationPanel'
import { EnhancedInsightCard } from '@/components/insights/EnhancedInsightCard'
import { WellBeingRadar } from '@/components/charts/dynamic'
import { getResidents } from '@/data/sampleData'
import { getObjectiveIndicatorValues } from '@/data/objectiveData'
import { OBJECTIVE_INDICATORS, getIndicatorMeta } from '@/data/objectiveIndicators'
import { getBudgetAllocations, BUDGET_PROGRAMS } from '@/data/budgetData'
import { getCategoryBudgetSummaries } from '@/data/budgetAnalysis'
import {
  aggregateCategories,
  getOverallScore,
  getCrossAnalysisData,
  getRadarData,
  getRegionBreakdown,
  getAgeBreakdown,
} from '@/data/aggregation'
import { generateEnhancedInsights } from '@/data/insightAnalysis'
import { CATEGORIES, getStatusLevel } from '@/data/constants'
import type { CategoryId, InsightSeverity } from '@/data/types'

const SEVERITY_STYLES: Record<InsightSeverity, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-900', label: '要対応' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-800', label: '要注目' },
  info: { bg: 'bg-blue-50', text: 'text-blue-900', label: '情報' },
  opportunity: { bg: 'bg-cyan-100', text: 'text-cyan-900', label: '機会' },
}

const INITIAL_INSIGHTS_COUNT = 3

type SortMode = 'severity' | 'impact'

export default function InsightsPage() {
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>('severity')
  const [filterCategory, setFilterCategory] = useState<CategoryId | null>(null)

  const residents = getResidents()
  const aggregated = aggregateCategories(residents)
  const overall = getOverallScore(residents)
  const overallStatus = getStatusLevel(overall)
  const radarData = getRadarData(aggregated)
  const regionData = getRegionBreakdown(residents)
  const ageData = getAgeBreakdown(residents)

  const indicators = getObjectiveIndicatorValues()
  const allocations = getBudgetAllocations()
  const budgetSummaries = getCategoryBudgetSummaries(allocations, BUDGET_PROGRAMS, 72000)
  const crossAnalysis = getCrossAnalysisData(residents, indicators, OBJECTIVE_INDICATORS, budgetSummaries)

  const enhancedInsights = useMemo(
    () => generateEnhancedInsights(residents, crossAnalysis, indicators, OBJECTIVE_INDICATORS, allocations, BUDGET_PROGRAMS, budgetSummaries),
    [residents, crossAnalysis, indicators, allocations, budgetSummaries],
  )

  const belowNationalAvg = indicators
    .filter((v) => v.normalizedScore < v.nationalAverage - 5)
    .sort((a, b) => a.normalizedScore - b.normalizedScore)
    .slice(0, 5)

  const maxGapCat = [...aggregated].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0]
  const weakestRegion = [...regionData].sort((a, b) => a.avgScore - b.avgScore)[0]
  const strongestRegion = regionData[0]

  // Filter and sort insights
  const processedInsights = useMemo(() => {
    let filtered = filterCategory
      ? enhancedInsights.filter((i) => i.categoryId === filterCategory)
      : enhancedInsights

    if (sortBy === 'impact') {
      filtered = [...filtered].sort((a, b) => b.estimatedImpact - a.estimatedImpact)
    }
    return filtered
  }, [enhancedInsights, filterCategory, sortBy])

  const visibleInsights = showAllInsights
    ? processedInsights
    : processedInsights.slice(0, INITIAL_INSIGHTS_COUNT)
  const hasMoreInsights = processedInsights.length > INITIAL_INSIGHTS_COUNT

  return (
    <main className="page-enter mx-auto max-w-[1280px] px-5 xl:px-0 py-5 sm:py-6 space-y-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Image src="/icons/information_fill.svg" alt="" width={24} height={24} className="opacity-60" />
        <div>
          <h1 className="text-std-24B-150 text-solid-gray-900">インサイト</h1>
          <p className="text-dns-14N-130 text-solid-gray-500">データドリブンの意思決定支援</p>
        </div>
      </div>

      {/* Key Findings Summary */}
      <section>
        <Card>
          <CardBody className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <IllustrationPanel status={overallStatus} variant="card" />
              </div>
              <div className="flex-1">
                <h2 className="text-std-17B-170 text-solid-gray-900 mb-3">主要な発見</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-solid-gray-50 rounded-2xl">
                    <p className="text-dns-14N-130 text-solid-gray-500 mb-1">最大ギャップ</p>
                    <div className="flex items-center gap-2">
                      <CategoryIcon categoryId={maxGapCat.id} size={20} />
                      <span className="text-std-16B-170 text-solid-gray-900">{maxGapCat.label}</span>
                    </div>
                    <p className="text-dns-14N-130 text-red-900 mt-1">
                      乖離 {Math.abs(maxGapCat.gap).toFixed(1)}pt
                    </p>
                  </div>
                  <div className="p-4 bg-solid-gray-50 rounded-2xl">
                    <p className="text-dns-14N-130 text-solid-gray-500 mb-1">最高地域</p>
                    <p className="text-std-16B-170 text-solid-gray-900">{strongestRegion.label}</p>
                    <p className="text-dns-14N-130 text-cyan-900 mt-1">平均 {strongestRegion.avgScore.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-solid-gray-50 rounded-2xl">
                    <p className="text-dns-14N-130 text-solid-gray-500 mb-1">要改善地域</p>
                    <p className="text-std-16B-170 text-solid-gray-900">{weakestRegion.label}</p>
                    <p className="text-dns-14N-130 text-orange-800 mt-1">平均 {weakestRegion.avgScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Enhanced Dynamic Insights */}
      <section>
        <h2 className="text-std-17B-170 text-solid-gray-900 mb-4">データドリブン・インサイト</h2>

        {/* Filter & Sort Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={() => setSortBy('severity')}
              className={`px-3 py-1.5 rounded-8 text-[12px] font-bold transition-colors ${
                sortBy === 'severity' ? 'bg-blue-900 text-white' : 'bg-solid-gray-100 text-solid-gray-600 hover:bg-solid-gray-200'
              }`}
            >
              重要度順
            </button>
            <button
              onClick={() => setSortBy('impact')}
              className={`px-3 py-1.5 rounded-8 text-[12px] font-bold transition-colors ${
                sortBy === 'impact' ? 'bg-blue-900 text-white' : 'bg-solid-gray-100 text-solid-gray-600 hover:bg-solid-gray-200'
              }`}
            >
              インパクト順
            </button>
          </div>
          <div className="w-px h-5 bg-solid-gray-200 mx-1" />
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1.5 rounded-8 text-[12px] font-bold transition-colors ${
              filterCategory === null ? 'bg-blue-900 text-white' : 'bg-solid-gray-100 text-solid-gray-600 hover:bg-solid-gray-200'
            }`}
          >
            全て
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
              className={`px-2.5 py-1.5 rounded-8 text-[12px] font-bold transition-colors flex items-center gap-1 ${
                filterCategory === cat.id ? 'bg-blue-900 text-white' : 'bg-solid-gray-100 text-solid-gray-600 hover:bg-solid-gray-200'
              }`}
            >
              <CategoryIcon categoryId={cat.id} size={14} />
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Insight Cards */}
        <div className="space-y-5">
          {visibleInsights.map((insight) => (
            <EnhancedInsightCard key={insight.id} insight={insight} />
          ))}
          {processedInsights.length === 0 && (
            <div className="text-center py-8 text-dns-14N-130 text-solid-gray-500">
              該当するインサイトがありません
            </div>
          )}
        </div>

        {hasMoreInsights && (
          <div className="text-center mt-5">
            <button
              onClick={() => setShowAllInsights(!showAllInsights)}
              className="px-6 py-2 rounded-2xl text-oln-14B-100 text-blue-900 border border-blue-900 hover:bg-blue-50 transition-colors"
            >
              {showAllInsights
                ? '折りたたむ'
                : `もっと見る（残り${processedInsights.length - INITIAL_INSIGHTS_COUNT}件）`}
            </button>
          </div>
        )}
      </section>

      {/* Alert: Indicators below national average */}
      {belowNationalAvg.length > 0 && (
        <section>
          <Card className="border-l-4 border-orange-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Image src="/icons/attention_fill.svg" alt="" width={20} height={20} />
                <h2 className="text-std-17B-170 text-orange-800">全国平均を大きく下回る指標</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {belowNationalAvg.map((v) => {
                  const meta = getIndicatorMeta(v.indicatorId)
                  const diff = v.normalizedScore - v.nationalAverage
                  return (
                    <div key={v.indicatorId} className="flex items-center gap-3 p-2 bg-orange-50 rounded-8">
                      <span className="px-1.5 py-0.5 rounded-4 text-[10px] font-bold bg-blue-50 text-blue-900 flex-shrink-0">
                        客観
                      </span>
                      <span className="text-oln-14B-100 text-red-900 w-8 text-center flex-shrink-0">
                        {v.normalizedScore}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-dns-14N-130 text-solid-gray-800 truncate">
                          {meta?.label ?? v.indicatorId}
                        </p>
                      </div>
                      <span className="text-dns-14N-130 text-red-900 flex-shrink-0">
                        {diff.toFixed(1)}pt
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {/* Radar — full width */}
      <section>
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">全体バランス</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">6カテゴリのバランスチャート</p>
          </CardHeader>
          <CardBody>
            <WellBeingRadar data={radarData} height={350} />
          </CardBody>
        </Card>
      </section>

      {/* Demographic Insights */}
      <section>
        <h2 className="text-std-17B-170 text-solid-gray-900 mb-5">属性別インサイト</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardBody className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/icons/me_fill.svg" alt="" width={20} height={20} className="opacity-60" />
                <h3 className="text-std-16B-170 text-solid-gray-900">年代別の傾向</h3>
              </div>
              <div className="space-y-3">
                {ageData.map((age) => {
                  const status = getStatusLevel(age.avgScore)
                  return (
                    <div key={age.label} className="flex items-center gap-3">
                      <span className="text-oln-14B-100 text-solid-gray-600 w-12">{age.label}</span>
                      <div className="flex-1">
                        <StatusBar
                          value={age.avgScore}
                          color={status === 'excellent' || status === 'good' ? '#0031D8' : '#E07930'}
                          height={8}
                          showValue
                        />
                      </div>
                      <span className="text-dns-14N-130 text-solid-gray-500 w-10 text-right">{age.count}人</span>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/icons/house_fill.svg" alt="" width={20} height={20} className="opacity-60" />
                <h3 className="text-std-16B-170 text-solid-gray-900">地域間の格差</h3>
              </div>
              <div className="space-y-3">
                {regionData.map((region) => {
                  const status = getStatusLevel(region.avgScore)
                  return (
                    <div key={region.label} className="flex items-center gap-3">
                      <span className="text-oln-14B-100 text-solid-gray-600 w-16">{region.label}</span>
                      <div className="flex-1">
                        <StatusBar
                          value={region.avgScore}
                          color={status === 'excellent' || status === 'good' ? '#0031D8' : '#E07930'}
                          height={8}
                          showValue
                        />
                      </div>
                      <span className="text-dns-14N-130 text-solid-gray-500 w-10 text-right">{region.count}人</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 p-3 bg-solid-gray-50 rounded-8 flex gap-3">
                <HandGesture type="point" size={32} className="flex-shrink-0" />
                <p className="text-dns-14N-130 text-solid-gray-600">
                  <span className="font-bold">注目:</span> {weakestRegion.label}が他地域比で低スコアです。
                  客観指標の分析と予算配分の見直しが推奨されます。
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Action Summary — Enhanced with first action step from each top insight */}
      <section>
        <Card>
          <CardBody className="py-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <HandGesture type="thumbsUp" size={40} />
                <h2 className="text-std-20B-160 text-solid-gray-900">次のアクション</h2>
              </div>
              <div className="space-y-4">
                {enhancedInsights.slice(0, 3).map((insight, i) => {
                  const sevStyle = SEVERITY_STYLES[insight.severity]
                  const firstStep = insight.actionSteps[0]
                  return (
                    <div key={insight.id} className="flex gap-3 p-4 bg-white rounded-2xl border border-[#E5E7EB]">
                      <span className="w-7 h-7 rounded-full bg-blue-900 text-white text-oln-14B-100 flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-oln-14B-100 ${sevStyle.text}`}>{sevStyle.label}</span>
                          <CategoryIcon categoryId={insight.categoryId} size={16} />
                          <span className="text-dns-14N-130 text-solid-gray-500">
                            インパクト: {insight.estimatedImpact.toFixed(1)}/10
                          </span>
                        </div>
                        <p className="text-std-16B-170 text-solid-gray-900 mb-1">{insight.title}</p>
                        {firstStep && (
                          <p className="text-dns-14N-130 text-solid-gray-600">
                            {firstStep.action}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </main>
  )
}
