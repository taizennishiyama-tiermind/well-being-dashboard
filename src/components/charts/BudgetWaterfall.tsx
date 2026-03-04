'use client'

import { memo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { CategoryBudgetSummary } from '@/data/types'
import { CATEGORIES } from '@/data/constants'

interface BudgetWaterfallProps {
  readonly summaries: readonly CategoryBudgetSummary[]
  readonly totalBudget: number
  readonly totalExecuted: number
  readonly height?: number
}

interface WaterfallItem {
  readonly name: string
  readonly budget: number
  readonly executed: number
  readonly unexecuted: number
  readonly color: string
  readonly isTotal?: boolean
}

interface TooltipPayloadEntry {
  readonly payload: WaterfallItem
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: readonly TooltipPayloadEntry[] }) {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload
  const rate = data.budget > 0
    ? Math.round((data.executed / data.budget) * 1000) / 10
    : 0

  return (
    <div className="bg-white border border-solid-gray-300 rounded-8 px-4 py-3 shadow-lg">
      <p className="text-std-16B-170 text-solid-gray-900 mb-2">{data.name}</p>
      <div className="space-y-1 text-dns-14N-130">
        <p className="text-solid-gray-700">
          予算: <span className="font-bold">{(data.budget / 100_000_000).toFixed(1)}億円</span>
        </p>
        <p className="text-green-900">
          執行済: <span className="font-bold">{(data.executed / 100_000_000).toFixed(1)}億円</span>
        </p>
        <p className="text-orange-800">
          未執行: <span className="font-bold">{(data.unexecuted / 100_000_000).toFixed(1)}億円</span>
        </p>
        <p className="text-solid-gray-600">
          執行率: <span className="font-bold">{rate}%</span>
        </p>
      </div>
    </div>
  )
}

export const BudgetWaterfall = memo(function BudgetWaterfall({
  summaries,
  totalBudget,
  totalExecuted,
  height = 300,
}: BudgetWaterfallProps) {
  const waterfallData: WaterfallItem[] = summaries.map((s) => {
    const meta = CATEGORIES.find((c) => c.id === s.categoryId)
    return {
      name: meta?.label ?? s.categoryId,
      budget: s.totalBudget,
      executed: s.totalExecuted,
      unexecuted: s.totalBudget - s.totalExecuted,
      color: meta?.color ?? '#666',
    }
  })

  // 合計行を追加
  waterfallData.push({
    name: '合計',
    budget: totalBudget,
    executed: totalExecuted,
    unexecuted: totalBudget - totalExecuted,
    color: '#0031D8',
    isTotal: true,
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={waterfallData}
        margin={{ top: 10, right: 20, bottom: 5, left: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#666' }}
          interval={0}
          textAnchor="middle"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#666' }}
          tickFormatter={(v: number) => `${Math.round(v / 100_000_000)}億`}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* 執行済み（下段） */}
        <Bar dataKey="executed" stackId="budget" name="執行済" radius={[0, 0, 0, 0]}>
          {waterfallData.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>

        {/* 未執行（上段） */}
        <Bar dataKey="unexecuted" stackId="budget" name="未執行" radius={[2, 2, 0, 0]}>
          {waterfallData.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.25} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})
