'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardBody } from '@/components/ui/Card'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { StatusBar } from '@/components/ui/StatusBadge'
import { getEfficiencyBadge, type CategoryPipelineData } from '@/data/budgetPageHelpers'

function getExecutionBarColor(rate: number): string {
  if (rate >= 85) return '#1A8C3D'
  if (rate >= 75) return '#D4920B'
  return '#E07930'
}

function getExecutionColor(rate: number): string {
  if (rate >= 85) return 'text-green-900'
  if (rate >= 75) return 'text-orange-800'
  return 'text-red-900'
}

interface CategoryPipelineCardProps {
  readonly data: CategoryPipelineData
}

export function CategoryPipelineCard({ data }: CategoryPipelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const badge = getEfficiencyBadge(data)

  return (
    <Card>
      <div className="h-1 rounded-t-2xl" style={{ backgroundColor: data.color }} />
      <CardBody className="py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CategoryIcon categoryId={data.categoryId} size={22} />
            <h3 className="text-std-17B-170 text-solid-gray-900">{data.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-4 text-oln-14B-100 ${badge.className}`}>
              {badge.label}
            </span>
            <span className="text-dns-14N-130 text-solid-gray-500">
              効率{data.efficiency.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Row 1: Budget + Execution */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-shrink-0 text-center w-16">
            <p className="text-[11px] text-solid-gray-500">予算</p>
            <p className="text-std-17B-170 text-solid-gray-900">
              {(data.totalBudget / 100_000_000).toFixed(1)}
              <span className="text-dns-14N-130">億</span>
            </p>
            <p className="text-[10px] text-solid-gray-400">
              /人{(data.budgetPerCapita / 10000).toFixed(1)}万
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-solid-gray-500">執行率</span>
              <span className={`text-oln-14B-100 ${getExecutionColor(data.executionRate)}`}>
                {data.executionRate}%
              </span>
            </div>
            <StatusBar
              value={data.executionRate}
              max={100}
              color={getExecutionBarColor(data.executionRate)}
              height={8}
              showValue={false}
            />
            <p className="text-[10px] text-solid-gray-400 mt-1">
              前年比
              <span className={data.yearOverYearChange >= 0 ? 'text-cyan-900' : 'text-red-900'}>
                {' '}{data.yearOverYearChange > 0 ? '+' : ''}{data.yearOverYearChange}%
              </span>
            </p>
          </div>
        </div>

        {/* Row 2: Subjective vs Objective Gap */}
        <div className="bg-solid-gray-50 rounded-8 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-solid-gray-500">主観・客観の比較</span>
            <span className={`text-oln-14B-100 ${Math.abs(data.gap) > 10 ? 'text-red-900' : 'text-solid-gray-600'}`}>
              乖離 {Math.abs(data.gap).toFixed(1)}pt
            </span>
          </div>
          {/* Dual bars on 0-10 scale */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-solid-gray-500 w-8 flex-shrink-0">主観</span>
              <div className="flex-1 h-2 bg-solid-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(data.subjectiveScore / 10) * 100}%`,
                    backgroundColor: '#E07930',
                  }}
                />
              </div>
              <span className="text-oln-14B-100 text-orange-800 w-8 text-right flex-shrink-0">
                {data.subjectiveScore.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-solid-gray-500 w-8 flex-shrink-0">客観</span>
              <div className="flex-1 h-2 bg-solid-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.objectiveComposite}%`,
                    backgroundColor: '#0031D8',
                  }}
                />
              </div>
              <span className="text-oln-14B-100 text-blue-900 w-8 text-right flex-shrink-0">
                {(data.objectiveComposite / 10).toFixed(1)}
              </span>
            </div>
          </div>
          {/* Gap indicator */}
          {Math.abs(data.gap) > 5 && (
            <p className={`text-[10px] mt-2 ${data.gap < 0 ? 'text-red-900' : 'text-cyan-900'}`}>
              {data.gap < 0
                ? '⚠ 客観データは良好だが住民実感が追いついていない'
                : '住民は実感しているが客観データでは未反映'}
            </p>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center py-2 text-oln-14B-100 text-[#0031D8] hover:bg-blue-50 rounded-8 transition-colors"
        >
          {isExpanded ? '▲ 閉じる' : `▼ ${data.programs.length}事業の内訳を見る`}
        </button>

        {/* Expandable Program List */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-solid-gray-100 pt-4 space-y-2">
            <h4 className="text-oln-14B-100 text-solid-gray-600 mb-3 flex items-center gap-2">
              <Image src="/icons/work_fill.svg" alt="" width={14} height={14} className="opacity-50" />
              個別事業（{data.programs.length}事業）
            </h4>
            {data.programs.map((prog, i) => (
              <div key={`${prog.name}-${i}`} className="p-3 bg-solid-gray-50 rounded-8">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-std-16B-170 text-solid-gray-900 truncate min-w-0 flex-1">
                    {prog.name}
                  </span>
                  <span className="text-dns-14N-130 text-solid-gray-500 flex-shrink-0 ml-2">
                    {(prog.budgetAmount / 100_000_000).toFixed(1)}億円
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <StatusBar
                      value={prog.executionRate}
                      max={100}
                      color={getExecutionBarColor(prog.executionRate)}
                      height={5}
                      showValue={false}
                    />
                  </div>
                  <span className={`text-oln-14B-100 flex-shrink-0 w-10 text-right ${getExecutionColor(prog.executionRate)}`}>
                    {prog.executionRate}%
                  </span>
                  <span className={`text-dns-14N-130 flex-shrink-0 w-14 text-right ${prog.changeRate >= 0 ? 'text-cyan-900' : 'text-red-900'}`}>
                    {prog.changeRate > 0 ? '+' : ''}{prog.changeRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
