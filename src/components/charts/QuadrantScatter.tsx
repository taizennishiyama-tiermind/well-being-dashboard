'use client'

import { memo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts'
import type { AggregatedCategory } from '@/data/types'
import { CATEGORIES } from '@/data/constants'

interface QuadrantScatterProps {
  readonly data: readonly AggregatedCategory[]
  readonly height?: number
}

const QUADRANT_LABELS = [
  { position: 'topLeft', text: '実感あり・客観不足', color: '#D4920B' },
  { position: 'topRight', text: '両方充実', color: '#1A8C3D' },
  { position: 'bottomLeft', text: '両方不足', color: '#D32F2F' },
  { position: 'bottomRight', text: '客観充実・実感不足', color: '#264AF4' },
] as const

interface ScatterPayloadEntry {
  readonly payload: {
    readonly name: string
    readonly subjective: number
    readonly objective: number
    readonly color: string
    readonly gap: number
  }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: readonly ScatterPayloadEntry[] }) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-solid-gray-300 rounded-8 px-4 py-3 shadow-lg">
      <p className="text-std-16B-170 text-solid-gray-900 mb-1">{d.name}</p>
      <p className="text-dns-14N-130 text-solid-gray-600">
        主観: <span className="font-bold" style={{ color: '#E8854A' }}>{d.subjective.toFixed(1)}</span>
        {' / '}
        客観: <span className="font-bold" style={{ color: '#0031D8' }}>{d.objective.toFixed(1)}</span>
      </p>
      <p className="text-[11px] text-solid-gray-500 mt-1">
        乖離: {d.gap > 0 ? '+' : ''}{d.gap.toFixed(1)}pt
      </p>
    </div>
  )
}

interface DotProps {
  readonly cx: number
  readonly cy: number
  readonly payload: {
    readonly name: string
    readonly color: string
  }
}

function CustomDot({ cx, cy, payload }: DotProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={18} fill={payload.color} fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={7} fill={payload.color} stroke="white" strokeWidth={2} />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fontSize={10}
        fontWeight="bold"
        fill={payload.color}
      >
        {payload.name}
      </text>
    </g>
  )
}

export const QuadrantScatter = memo(function QuadrantScatter({
  data,
  height = 340,
}: QuadrantScatterProps) {
  const subjectiveMean = data.reduce((s, d) => s + d.avgSubjective, 0) / data.length
  const objectiveMean = data.reduce((s, d) => s + d.avgObjective, 0) / data.length

  const chartData = data.map((cat) => {
    const meta = CATEGORIES.find((c) => c.id === cat.id)
    return {
      name: cat.label,
      subjective: cat.avgSubjective,
      objective: cat.avgObjective,
      gap: cat.gap,
      color: meta?.color ?? '#666',
    }
  })

  const allValues = data.flatMap((d) => [d.avgSubjective, d.avgObjective])
  const minVal = Math.floor(Math.min(...allValues) - 0.5)
  const maxVal = Math.ceil(Math.max(...allValues) + 0.5)

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 24, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF2" />
          <XAxis
            dataKey="objective"
            type="number"
            domain={[minVal, maxVal]}
            tick={{ fontSize: 11, fill: '#757780' }}
            tickLine={false}
            axisLine={{ stroke: '#D9DCE2' }}
            name="客観スコア"
          >
            <Label
              value="客観スコア（統計データ）→"
              position="bottom"
              offset={-4}
              style={{ fontSize: 11, fill: '#757780' }}
            />
          </XAxis>
          <YAxis
            dataKey="subjective"
            type="number"
            domain={[minVal, maxVal]}
            tick={{ fontSize: 11, fill: '#757780' }}
            tickLine={false}
            axisLine={{ stroke: '#D9DCE2' }}
            name="主観スコア"
          >
            <Label
              value="主観スコア（住民実感）→"
              position="insideLeft"
              angle={-90}
              offset={12}
              style={{ fontSize: 11, fill: '#757780', textAnchor: 'middle' }}
            />
          </YAxis>
          <ReferenceLine
            x={objectiveMean}
            stroke="#757780"
            strokeDasharray="6 3"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={subjectiveMean}
            stroke="#757780"
            strokeDasharray="6 3"
            strokeOpacity={0.5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={chartData}
            shape={<CustomDot cx={0} cy={0} payload={{ name: '', color: '' }} />}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant legend */}
      <div className="grid grid-cols-2 gap-2 mt-3 px-2">
        {QUADRANT_LABELS.map((q) => (
          <div
            key={q.position}
            className="flex items-center gap-1.5 text-[11px]"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: q.color }}
            />
            <span style={{ color: q.color }} className="font-bold">
              {q.text}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-solid-gray-400 mt-2 px-2">
        基準線: 全カテゴリ平均（主観 {subjectiveMean.toFixed(1)} / 客観 {objectiveMean.toFixed(1)}）
      </p>
    </div>
  )
})
