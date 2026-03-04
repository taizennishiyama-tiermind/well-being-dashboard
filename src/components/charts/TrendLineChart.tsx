'use client'

import { memo, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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

export const TrendLineChart = memo(function TrendLineChart({
  data,
  height = 320,
  showCategories = true,
}: TrendLineChartProps) {
  const stats = useMemo(() => {
    const overallAvg = Math.round(
      (data.reduce((s, d) => s + d.overall, 0) / data.length) * 100,
    ) / 100
    const first = data[0]
    const last = data[data.length - 1]
    const overallChange = Math.round((last.overall - first.overall) * 100) / 100

    const categoryStats = CATEGORY_LINES.map((line) => {
      const values = data.map((d) => d[line.key as keyof MonthlyTrend] as number)
      const avg = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100
      const change = Math.round((values[values.length - 1] - values[0]) * 100) / 100
      return { ...line, avg, change }
    })

    return { overallAvg, overallChange, first, last, categoryStats }
  }, [data])

  return (
    <div>
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
          <ReferenceLine
            y={stats.overallAvg}
            stroke="#1A1A1C"
            strokeDasharray="4 2"
            strokeOpacity={0.3}
            label={{
              value: `平均 ${stats.overallAvg.toFixed(1)}`,
              position: 'right',
              fontSize: 10,
              fill: '#757780',
            }}
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
                dot={{ r: 2, fill: line.color }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>

      {/* 12ヶ月サマリー */}
      <div className="mt-3 px-1">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[11px] text-solid-gray-500">12ヶ月平均</span>
          <span className="text-oln-14B-100 text-solid-gray-900">
            {stats.overallAvg.toFixed(2)}
          </span>
          <span
            className={`text-[11px] font-bold ${
              stats.overallChange >= 0 ? 'text-green-800' : 'text-red-700'
            }`}
          >
            {stats.overallChange >= 0 ? '+' : ''}{stats.overallChange.toFixed(2)}pt
          </span>
          <span className="text-[10px] text-solid-gray-400">
            ({stats.first.month}→{stats.last.month})
          </span>
        </div>
        {showCategories && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            {stats.categoryStats.map((cat) => (
              <div key={cat.key} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-solid-gray-600 truncate">{cat.name}</span>
                <span className="text-solid-gray-800 font-bold ml-auto flex-shrink-0">
                  {cat.avg.toFixed(1)}
                </span>
                <span
                  className={`font-bold flex-shrink-0 ${
                    cat.change >= 0 ? 'text-green-700' : 'text-red-600'
                  }`}
                >
                  {cat.change >= 0 ? '+' : ''}{cat.change.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
