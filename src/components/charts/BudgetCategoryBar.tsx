'use client'

import { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { CategoryBudgetSummary } from '@/data/types'
import { CATEGORIES } from '@/data/constants'

interface BudgetCategoryBarProps {
  readonly summaries: readonly CategoryBudgetSummary[]
  readonly height?: number
}

interface BarDataItem {
  readonly name: string
  readonly executed: number
  readonly unexecuted: number
  readonly total: number
  readonly executionRate: number
  readonly color: string
}

interface TooltipPayloadEntry {
  readonly payload: BarDataItem
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: readonly TooltipPayloadEntry[] }) {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4 shadow-lg">
      <p className="text-std-16B-170 text-solid-gray-900 mb-2">{data.name}</p>
      <div className="space-y-1 text-dns-14N-130">
        <p className="text-solid-gray-700">
          予算: <span className="font-bold">{(data.total / 100_000_000).toFixed(1)}億円</span>
        </p>
        <p className="text-solid-gray-700">
          執行済: <span className="font-bold text-green-900">{(data.executed / 100_000_000).toFixed(1)}億円</span>
        </p>
        <p className="text-solid-gray-700">
          執行率: <span className="font-bold">{data.executionRate}%</span>
        </p>
      </div>
    </div>
  )
}

export const BudgetCategoryBar = memo(function BudgetCategoryBar({ summaries, height = 300 }: BudgetCategoryBarProps) {
  const barData: readonly BarDataItem[] = summaries
    .map((s) => {
      const meta = CATEGORIES.find((c) => c.id === s.categoryId)
      return {
        name: meta?.label ?? s.categoryId,
        executed: s.totalExecuted,
        unexecuted: s.totalBudget - s.totalExecuted,
        total: s.totalBudget,
        executionRate: s.executionRate,
        color: meta?.color ?? '#666',
      }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={[...barData]}
        layout="vertical"
        margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
      >
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#757780' }}
          tickFormatter={(v: number) => `${Math.round(v / 100_000_000)}億`}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 500 }}
          width={100}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />

        <Bar dataKey="executed" stackId="budget" barSize={20} radius={[0, 0, 0, 0]}>
          {barData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>

        <Bar dataKey="unexecuted" stackId="budget" barSize={20} radius={[0, 4, 4, 0]}>
          {barData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} fillOpacity={0.2} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})
