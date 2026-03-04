'use client'

import { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { AggregatedCategory } from '@/data/types'

interface GapChartProps {
  readonly data: readonly AggregatedCategory[]
  readonly height?: number
}

function getGapDescription(gap: number): { text: string; color: string } {
  if (Math.abs(gap) <= 0.3) {
    return { text: 'バランスが取れています', color: '#757780' }
  }
  if (gap > 0) {
    return {
      text: '住民は実感しているが、客観データでは不足',
      color: '#D4920B',
    }
  }
  return {
    text: '客観データでは充実しているが、住民は実感できていない',
    color: '#264AF4',
  }
}

export const GapChart = memo(function GapChart({ data, height = 300 }: GapChartProps) {
  const chartData = data.map((cat) => ({
    name: cat.label,
    subjective: cat.avgSubjective,
    objective: cat.avgObjective,
    gap: cat.gap,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF2" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#4A4C56' }}
            tickLine={false}
            axisLine={{ stroke: '#D9DCE2' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12, fill: '#757780' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ECEEF2',
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value, name) => [
              Number(value).toFixed(1),
              name === 'subjective' ? '主観スコア' : '客観スコア',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 16 }}
            formatter={(value) =>
              value === 'subjective' ? '主観（住民実感）' : '客観（統計データ）'
            }
          />
          <Bar dataKey="subjective" fill="#E8854A" radius={[4, 4, 0, 0]} barSize={18} />
          <Bar dataKey="objective" fill="#0031D8" radius={[4, 4, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>

      {/* 乖離サマリー */}
      <div className="mt-4 space-y-2 px-1">
        {chartData.map((cat) => {
          const desc = getGapDescription(cat.gap)
          const absGap = Math.abs(cat.gap)
          return (
            <div key={cat.name} className="flex items-center gap-2 text-[12px]">
              <span className="text-solid-gray-700 font-bold w-20 flex-shrink-0 truncate">
                {cat.name}
              </span>
              <span
                className={`font-bold flex-shrink-0 w-16 text-right ${
                  cat.gap > 0.3
                    ? 'text-orange-700'
                    : cat.gap < -0.3
                      ? 'text-blue-800'
                      : 'text-solid-gray-500'
                }`}
              >
                {cat.gap > 0 ? '+' : ''}{cat.gap.toFixed(1)}pt
              </span>
              {absGap > 0.3 && (
                <span className="text-solid-gray-500 truncate" style={{ color: desc.color }}>
                  {desc.text}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
