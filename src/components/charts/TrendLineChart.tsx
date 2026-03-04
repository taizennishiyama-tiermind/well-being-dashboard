'use client'

import { memo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyTrend } from '@/data/types'

interface TrendLineChartProps {
  readonly data: readonly MonthlyTrend[]
  readonly height?: number
  readonly showCategories?: boolean
}

const CATEGORY_LINES = [
  { key: 'health', name: '健康・医療', color: '#0017C1' },
  { key: 'community', name: '地域つながり', color: '#264AF4' },
  { key: 'diversity', name: '多様性・包摂', color: '#5B6FAF' },
  { key: 'childcare', name: '子育て・教育', color: '#D4920B' },
  { key: 'efficacy', name: '自己効力感', color: '#4979F5' },
  { key: 'transport', name: '交通・移動', color: '#0877D7' },
] as const

export const TrendLineChart = memo(function TrendLineChart({ data, height = 320, showCategories = false }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={[...data]} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF2" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#757780' }}
          tickLine={false}
          axisLine={{ stroke: '#D9DCE2' }}
        />
        <YAxis
          domain={[4, 8]}
          tick={{ fontSize: 11, fill: '#757780' }}
          tickLine={false}
          axisLine={{ stroke: '#D9DCE2' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ECEEF2',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => Number(value).toFixed(1)}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Line
          type="monotone"
          dataKey="overall"
          name="総合スコア"
          stroke="#1A1A1C"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#1A1A1C' }}
          activeDot={{ r: 5 }}
        />
        {showCategories &&
          CATEGORY_LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              dot={false}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  )
})
