'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { ObjectiveIndicatorMeta, ObjectiveIndicatorValue } from '@/data/types'

interface ComparisonDataPoint {
  readonly label: string
  readonly municipality: number
  readonly prefecture: number
  readonly national: number
}

interface IndicatorComparisonBarProps {
  readonly indicators: readonly ObjectiveIndicatorMeta[]
  readonly values: readonly ObjectiveIndicatorValue[]
  readonly height?: number
  readonly maxItems?: number
}

interface TooltipPayloadEntry {
  readonly name: string
  readonly value: number
  readonly color: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload) return null

  return (
    <div className="bg-white border border-solid-gray-300 rounded-8 px-4 py-3 shadow-lg">
      <p className="text-std-16B-170 text-solid-gray-900 mb-2 max-w-48 line-clamp-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-dns-14N-130" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function IndicatorComparisonBar({
  indicators,
  values,
  height = 300,
  maxItems = 10,
}: IndicatorComparisonBarProps) {
  const valueMap = new Map(values.map((v) => [v.indicatorId, v]))

  const chartData: ComparisonDataPoint[] = indicators
    .slice(0, maxItems)
    .map((ind) => {
      const val = valueMap.get(ind.id)
      return {
        label: ind.label.length > 16 ? `${ind.label.slice(0, 14)}...` : ind.label,
        municipality: val?.normalizedScore ?? 0,
        prefecture: val?.prefectureAverage ?? 50,
        national: val?.nationalAverage ?? 50,
      }
    })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, bottom: 5, left: 120 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#666' }} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: '#666' }}
          width={115}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconSize={10}
        />
        <ReferenceLine x={50} stroke="#999" strokeDasharray="4 4" />
        <Bar dataKey="municipality" name="当自治体" fill="#0031D8" barSize={8} radius={[0, 2, 2, 0]} />
        <Bar dataKey="prefecture" name="県平均" fill="#5B6FAF" barSize={8} radius={[0, 2, 2, 0]} opacity={0.6} />
        <Bar dataKey="national" name="全国平均" fill="#D4920B" barSize={8} radius={[0, 2, 2, 0]} opacity={0.4} />
      </BarChart>
    </ResponsiveContainer>
  )
}
