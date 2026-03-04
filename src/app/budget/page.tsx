'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatusBar } from '@/components/ui/StatusBadge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { BudgetOverviewBar } from '@/components/budget/BudgetOverviewBar'
import { BudgetAllocationMap } from '@/components/budget/BudgetAllocationMap'
import { CategoryPipelineCard } from '@/components/budget/CategoryPipelineCard'
import {
  BudgetDonut,
  BudgetTrendPanel,
  BudgetScoreCross,
} from '@/components/charts/dynamic'
import { getBudgetAllocations, BUDGET_PROGRAMS } from '@/data/budgetData'
import {
  getCategoryBudgetSummaries,
  getOverallBudgetStats,
  getProgramRanking,
  getBudgetTrendByCategory,
} from '@/data/budgetAnalysis'
import { getBudgetFlowSummary } from '@/data/budgetFlowData'
import { getResidents } from '@/data/sampleData'
import { getObjectiveIndicatorValues } from '@/data/objectiveData'
import { OBJECTIVE_INDICATORS } from '@/data/objectiveIndicators'
import { getCrossAnalysisData } from '@/data/aggregation'
import { CATEGORIES } from '@/data/constants'
import {
  getWellBeingBudgetRatio,
  getExpenditureToWBMapping,
  getCategoryPipelineData,
  sortPipelineData,
  type PipelineSortKey,
} from '@/data/budgetPageHelpers'
import type { FiscalYear } from '@/data/types'

const SORT_OPTIONS: readonly { readonly key: PipelineSortKey; readonly label: string }[] = [
  { key: 'efficiencyIndex', label: '効率順' },
  { key: 'budget', label: '予算額順' },
  { key: 'subjective', label: '住民実感順' },
]

export default function BudgetPage() {
  const [selectedFY, setSelectedFY] = useState<FiscalYear>('2025')
  const [sortKey, setSortKey] = useState<PipelineSortKey>('efficiencyIndex')

  const allocations = getBudgetAllocations()
  const populationCount = 72000

  const budgetSummaries = useMemo(
    () => getCategoryBudgetSummaries(allocations, BUDGET_PROGRAMS, populationCount, selectedFY),
    [allocations, selectedFY],
  )
  const overallStats = useMemo(
    () => getOverallBudgetStats(allocations, selectedFY),
    [allocations, selectedFY],
  )
  const flowData = useMemo(
    () => getBudgetFlowSummary(selectedFY),
    [selectedFY],
  )
  const trendData = useMemo(
    () => getBudgetTrendByCategory(allocations, BUDGET_PROGRAMS),
    [allocations],
  )
  const programRanking = useMemo(
    () => getProgramRanking(allocations, BUDGET_PROGRAMS, 'budget', selectedFY),
    [allocations, selectedFY],
  )

  const residents = getResidents()
  const indicators = getObjectiveIndicatorValues()

  const crossAnalysis = useMemo(
    () => getCrossAnalysisData(residents, indicators, OBJECTIVE_INDICATORS, budgetSummaries),
    [residents, indicators, budgetSummaries],
  )
  const wbRatio = useMemo(
    () => getWellBeingBudgetRatio(flowData),
    [flowData],
  )
  const expenditureFlows = useMemo(
    () => getExpenditureToWBMapping(flowData),
    [flowData],
  )
  const pipelineData = useMemo(
    () => sortPipelineData(
      getCategoryPipelineData(crossAnalysis, budgetSummaries, BUDGET_PROGRAMS, allocations, selectedFY),
      sortKey,
    ),
    [crossAnalysis, budgetSummaries, allocations, selectedFY, sortKey],
  )

  return (
    <main className="page-enter mx-auto max-w-[1280px] px-5 xl:px-0 py-5 sm:py-6 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/icons/work_fill.svg" alt="" width={24} height={24} className="opacity-60" />
          <div>
            <h1 className="text-std-24B-150 text-solid-gray-900">予算分析</h1>
            <p className="text-dns-14N-130 text-solid-gray-500">
              Well-Being予算の投入から成果まで
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {(['2021', '2022', '2023', '2024', '2025'] as const).map((fy) => (
            <button
              key={fy}
              onClick={() => setSelectedFY(fy)}
              className={`px-4 py-2 rounded-8 text-oln-14B-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500 ${
                selectedFY === fy
                  ? 'bg-blue-900 text-white'
                  : 'bg-solid-gray-50 text-solid-gray-600 hover:bg-solid-gray-100'
              }`}
            >
              FY{fy}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Budget Overview (歳入歳出 + WB統計) */}
      <section>
        <BudgetOverviewBar
          wbRatio={wbRatio}
          executionRate={overallStats.executionRate}
          avgChangeRate={overallStats.avgChangeRate}
          flowData={flowData}
        />
      </section>

      {/* Section 2: Donut + Trend (前バージョンから復元) */}
      <section>
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">歳出構成とWell-Beingカテゴリ別トレンド</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              目的別歳出の構成比と、Well-Beingカテゴリ別の年度間推移
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <h3 className="text-std-16B-170 text-solid-gray-900">歳出構成（目的別）</h3>
                  <span className="text-dns-14N-130 text-solid-gray-500">
                    歳出総額 {Math.floor(flowData.totalExpenditure / 100_000_000).toLocaleString()}億円
                  </span>
                </div>
                <BudgetDonut
                  expenditureItems={flowData.expenditureItems}
                  totalExpenditure={flowData.totalExpenditure}
                  height={320}
                />
              </div>
              <div>
                <h3 className="text-std-16B-170 text-solid-gray-900 mb-3">Well-Beingカテゴリ別トレンド</h3>
                <BudgetTrendPanel trendData={trendData} />
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Section 3: WB Budget Allocation Map (NEW: 分類ロジック) */}
      <section>
        <BudgetAllocationMap
          expenditureFlows={expenditureFlows}
          wellBeingAllocation={flowData.wellBeingAllocation}
        />
      </section>

      {/* Section 4: Cross Reference Table (前バージョンから復元) */}
      <section>
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">予算 × 成果 クロスリファレンス</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              カテゴリ別の予算投入と主観・客観スコアの対比
            </p>
          </CardHeader>
          <CardBody>
            <BudgetScoreCross crossData={crossAnalysis} />
          </CardBody>
        </Card>
      </section>

      {/* Section 5: Pipeline Cards (NEW: メインビジュアライゼーション) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-std-20B-160 text-solid-gray-900">
            カテゴリ別 投入→成果パイプライン
          </h2>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`px-3 py-1.5 rounded-8 text-oln-14B-100 transition-colors ${
                  sortKey === opt.key
                    ? 'bg-blue-900 text-white'
                    : 'bg-solid-gray-50 text-solid-gray-600 hover:bg-solid-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pipelineData.map((data) => (
            <CategoryPipelineCard key={data.categoryId} data={data} />
          ))}
        </div>
      </section>

      {/* Section 6: Category Budget Table (前バージョンから復元) */}
      <section>
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">カテゴリ別予算一覧</h2>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-solid-gray-300">
                  <th className="py-3 px-3 text-oln-14B-100 text-solid-gray-600">カテゴリ</th>
                  <th className="py-3 px-3 text-oln-14B-100 text-solid-gray-600 text-right">予算</th>
                  <th className="py-3 px-3 text-oln-14B-100 text-solid-gray-600 text-right">執行率</th>
                  <th className="py-3 px-3 text-oln-14B-100 text-solid-gray-600 text-right">前年比</th>
                </tr>
              </thead>
              <tbody>
                {budgetSummaries.map((s) => (
                  <tr key={s.categoryId} className="border-b border-solid-gray-200">
                    <td className="py-4 px-3">
                      <CategoryIcon categoryId={s.categoryId} showLabel />
                    </td>
                    <td className="py-4 px-3 text-right text-dns-14N-130 text-solid-gray-900">
                      {(s.totalBudget / 100_000_000).toFixed(1)}億円
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className={`text-oln-14B-100 ${
                        s.executionRate >= 85 ? 'text-green-900' :
                        s.executionRate >= 75 ? 'text-orange-800' : 'text-red-900'
                      }`}>
                        {s.executionRate}%
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className={`text-dns-14N-130 ${s.yearOverYearChange >= 0 ? 'text-cyan-900' : 'text-red-900'}`}>
                        {s.yearOverYearChange > 0 ? '+' : ''}{s.yearOverYearChange}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </section>

      {/* Section 7: Program Ranking (前バージョンから復元) */}
      <section>
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">事業ランキング（予算額順）</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {programRanking.slice(0, 5).map(({ program, allocation }, i) => {
                const meta = CATEGORIES.find((c) => c.id === program.categoryId)
                return (
                  <div
                    key={program.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-solid-gray-50"
                  >
                    <span className="w-7 h-7 rounded-full bg-solid-gray-200 flex items-center justify-center text-oln-14B-100 text-solid-gray-600 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-std-16B-170 text-solid-gray-900 truncate">{program.name}</span>
                        <span
                          className="px-2 py-0.5 rounded-4 text-dns-14N-130 text-white flex-shrink-0"
                          style={{ backgroundColor: meta?.color ?? '#666', fontSize: 10 }}
                        >
                          {meta?.label}
                        </span>
                      </div>
                      <StatusBar
                        value={allocation.executionRate}
                        color={allocation.executionRate >= 85 ? '#264AF4' : allocation.executionRate >= 75 ? '#D4920B' : '#E07930'}
                        height={4}
                        max={100}
                      />
                    </div>
                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <p className="text-oln-14B-100 text-solid-gray-900">
                        {(allocation.budgetAmount / 100_000_000).toFixed(1)}億円
                      </p>
                      <p className={`text-dns-14N-130 ${allocation.changeRate >= 0 ? 'text-cyan-900' : 'text-red-900'}`}>
                        {allocation.changeRate > 0 ? '+' : ''}{allocation.changeRate}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      </section>
    </main>
  )
}
