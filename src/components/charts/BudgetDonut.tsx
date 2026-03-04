'use client'

import { memo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Label,
} from 'recharts'
import { EXPENDITURE_CATEGORIES } from '@/data/budgetFlowData'

interface ExpenditureItem {
  readonly categoryId: string
  readonly amount: number
  readonly ratio: number
}

interface BudgetDonutProps {
  readonly expenditureItems: readonly ExpenditureItem[]
  readonly totalExpenditure: number
  readonly height?: number
}

interface TooltipPayloadEntry {
  readonly payload: {
    readonly name: string
    readonly value: number
    readonly fill: string
    readonly ratio: number
  }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: readonly TooltipPayloadEntry[] }) {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload
  return (
    <div className="bg-white border border-solid-gray-300 rounded-8 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: data.fill }} />
        <p className="text-std-16B-170 text-solid-gray-900">{data.name}</p>
      </div>
      <p className="text-dns-14N-130 text-solid-gray-700">
        {(data.value / 100_000_000).toFixed(1)}億円（{data.ratio}%）
      </p>
    </div>
  )
}

function CenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  const cx = viewBox?.cx ?? 0
  const cy = viewBox?.cy ?? 0
  const totalOku = Math.floor(total / 100_000_000)
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-solid-gray-500" fontSize={11}>
        歳出総額
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-solid-gray-900" fontSize={18} fontWeight="bold">
        {totalOku.toLocaleString()}億円
      </text>
    </g>
  )
}

export const BudgetDonut = memo(function BudgetDonut({
  expenditureItems,
  totalExpenditure,
  height = 340,
}: BudgetDonutProps) {
  const chartData = expenditureItems.map((item) => {
    const meta = EXPENDITURE_CATEGORIES.find((c) => c.id === item.categoryId)
    return {
      name: meta?.label ?? item.categoryId,
      value: item.amount,
      color: meta?.color ?? '#999',
      ratio: item.ratio,
    }
  })

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            dataKey="value"
            stroke="none"
            paddingAngle={1}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
            <Label
              content={<CenterLabel total={totalExpenditure} />}
              position="center"
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2 px-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-dns-14N-130 text-solid-gray-600 truncate">
              {item.name}
            </span>
            <span className="text-dns-14N-130 text-solid-gray-900 flex-shrink-0 ml-auto">
              {item.ratio}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
