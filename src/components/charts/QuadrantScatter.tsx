'use client'

import { memo, useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
} from 'recharts'
import type { AggregatedCategory } from '@/data/types'
import { CATEGORIES } from '@/data/constants'
import { NATIONAL_BENCHMARKS } from '@/data/aggregation'

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

// Stable national average baselines for cross-municipality comparability
// Source: 総務省「地方財政状況調査」＋ 内閣府 Well-Being 指標調査
const benchmarkValues = Object.values(NATIONAL_BENCHMARKS)
const BASELINE_SUBJECTIVE =
  Math.round(
    (benchmarkValues.reduce((s, b) => s + b.subjectiveScore, 0) / benchmarkValues.length) * 10,
  ) / 10
const BASELINE_OBJECTIVE =
  Math.round(
    (benchmarkValues.reduce((s, b) => s + b.objectiveScore, 0) /
      benchmarkValues.length /
      10) *
      10,
  ) / 10

interface ChartPoint {
  readonly name: string
  readonly subjective: number
  readonly objective: number
  readonly color: string
  readonly gap: number
}

interface ScatterPayloadEntry {
  readonly payload: ChartPoint
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: readonly ScatterPayloadEntry[]
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-solid-gray-300 rounded-8 px-4 py-3 shadow-lg">
      <p className="text-std-16B-170 text-solid-gray-900 mb-1">{d.name}</p>
      <p className="text-dns-14N-130 text-solid-gray-600">
        主観:{' '}
        <span className="font-bold" style={{ color: '#E8854A' }}>
          {d.subjective.toFixed(1)}
        </span>
        {' / '}
        客観:{' '}
        <span className="font-bold" style={{ color: '#0031D8' }}>
          {d.objective.toFixed(1)}
        </span>
      </p>
      <p className="text-[11px] text-solid-gray-500 mt-1">
        乖離: {d.gap > 0 ? '+' : ''}
        {d.gap.toFixed(1)}pt
      </p>
    </div>
  )
}

interface LabelOffset {
  readonly dx: number
  readonly dy: number
  readonly textAnchor: 'start' | 'middle' | 'end'
}

function computeLabelOffsets(
  points: readonly ChartPoint[],
  xMean: number,
  yMean: number,
): ReadonlyMap<string, LabelOffset> {
  const offsets = new Map<string, LabelOffset>()

  // Candidate positions per quadrant — labels pushed toward quadrant edges
  const candidateSets: Record<string, readonly LabelOffset[]> = {
    topRight: [
      { dx: 8, dy: -10, textAnchor: 'start' },
      { dx: 0, dy: -14, textAnchor: 'middle' },
      { dx: 10, dy: 3, textAnchor: 'start' },
      { dx: -8, dy: -10, textAnchor: 'end' },
    ],
    topLeft: [
      { dx: -8, dy: -10, textAnchor: 'end' },
      { dx: 0, dy: -14, textAnchor: 'middle' },
      { dx: -10, dy: 3, textAnchor: 'end' },
      { dx: 8, dy: -10, textAnchor: 'start' },
    ],
    bottomRight: [
      { dx: 8, dy: 16, textAnchor: 'start' },
      { dx: 10, dy: 3, textAnchor: 'start' },
      { dx: 0, dy: 18, textAnchor: 'middle' },
      { dx: -8, dy: 16, textAnchor: 'end' },
    ],
    bottomLeft: [
      { dx: -8, dy: 16, textAnchor: 'end' },
      { dx: -10, dy: 3, textAnchor: 'end' },
      { dx: 0, dy: 18, textAnchor: 'middle' },
      { dx: 8, dy: 16, textAnchor: 'start' },
    ],
  }

  // Approximate pixels-per-data-unit for collision detection
  const PPU = 55
  const COLLISION_X = 0.85
  const COLLISION_Y = 0.25

  interface PlacedRect {
    readonly cx: number
    readonly cy: number
  }

  const placed: PlacedRect[] = []

  function hasCollision(cx: number, cy: number): boolean {
    return placed.some(
      (p) => Math.abs(cx - p.cx) < COLLISION_X && Math.abs(cy - p.cy) < COLLISION_Y,
    )
  }

  // Outermost points first — they get best label positions
  const sorted = [...points].sort((a, b) => {
    const aDist = (a.objective - xMean) ** 2 + (a.subjective - yMean) ** 2
    const bDist = (b.objective - xMean) ** 2 + (b.subjective - yMean) ** 2
    return bDist - aDist
  })

  for (const point of sorted) {
    const quadrant =
      point.subjective >= yMean
        ? point.objective >= xMean
          ? 'topRight'
          : 'topLeft'
        : point.objective >= xMean
          ? 'bottomRight'
          : 'bottomLeft'

    const candidates = candidateSets[quadrant]
    let chosen = candidates[0]
    let chosenCx = point.objective + candidates[0].dx / PPU
    let chosenCy = point.subjective - candidates[0].dy / PPU

    for (const candidate of candidates) {
      const labelCx = point.objective + candidate.dx / PPU
      const labelCy = point.subjective - candidate.dy / PPU

      if (!hasCollision(labelCx, labelCy)) {
        chosen = candidate
        chosenCx = labelCx
        chosenCy = labelCy
        break
      }
    }

    placed.push({ cx: chosenCx, cy: chosenCy })
    offsets.set(point.name, chosen)
  }

  return offsets
}

export const QuadrantScatter = memo(function QuadrantScatter({
  data,
  height = 400,
}: QuadrantScatterProps) {
  const chartData: ChartPoint[] = useMemo(
    () =>
      data.map((cat) => {
        const meta = CATEGORIES.find((c) => c.id === cat.id)
        return {
          name: cat.label,
          subjective: cat.avgSubjective,
          objective: cat.avgObjective,
          gap: cat.gap,
          color: meta?.color ?? '#666',
        }
      }),
    [data],
  )

  const labelOffsets = useMemo(
    () => computeLabelOffsets(chartData, BASELINE_OBJECTIVE, BASELINE_SUBJECTIVE),
    [chartData],
  )

  const allValues = [
    ...data.map((d) => d.avgSubjective),
    ...data.map((d) => d.avgObjective),
    BASELINE_SUBJECTIVE,
    BASELINE_OBJECTIVE,
  ]
  const minVal = Math.floor(Math.min(...allValues) - 1)
  const maxVal = Math.ceil(Math.max(...allValues) + 1)

  function renderDot(props: { cx?: number; cy?: number; payload?: ChartPoint }) {
    const { cx, cy, payload } = props
    if (cx == null || cy == null || !payload) return null
    const color = payload.color || '#666'
    const offset = labelOffsets.get(payload.name) ?? {
      dx: 0,
      dy: -10,
      textAnchor: 'middle' as const,
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.1} />
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={1.5} />
        <text
          x={cx + offset.dx}
          y={cy + offset.dy}
          textAnchor={offset.textAnchor}
          fontSize={9}
          fontWeight="600"
          fill={color}
        >
          {payload.name}
        </text>
      </g>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 24, right: 40, left: 10, bottom: 16 }}>
          {/* Quadrant background tints */}
          <ReferenceArea
            x1={minVal}
            x2={BASELINE_OBJECTIVE}
            y1={BASELINE_SUBJECTIVE}
            y2={maxVal}
            fill="#D4920B"
            fillOpacity={0.05}
          />
          <ReferenceArea
            x1={BASELINE_OBJECTIVE}
            x2={maxVal}
            y1={BASELINE_SUBJECTIVE}
            y2={maxVal}
            fill="#1A8C3D"
            fillOpacity={0.05}
          />
          <ReferenceArea
            x1={minVal}
            x2={BASELINE_OBJECTIVE}
            y1={minVal}
            y2={BASELINE_SUBJECTIVE}
            fill="#D32F2F"
            fillOpacity={0.05}
          />
          <ReferenceArea
            x1={BASELINE_OBJECTIVE}
            x2={maxVal}
            y1={minVal}
            y2={BASELINE_SUBJECTIVE}
            fill="#264AF4"
            fillOpacity={0.05}
          />

          <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF2" />
          <XAxis
            dataKey="objective"
            type="number"
            domain={[minVal, maxVal]}
            tick={{ fontSize: 10, fill: '#757780' }}
            tickLine={false}
            axisLine={{ stroke: '#D9DCE2' }}
            name="客観スコア"
          >
            <Label
              value="客観スコア（統計データ）→"
              position="bottom"
              offset={-2}
              style={{ fontSize: 10, fill: '#757780' }}
            />
          </XAxis>
          <YAxis
            dataKey="subjective"
            type="number"
            domain={[minVal, maxVal]}
            tick={{ fontSize: 10, fill: '#757780' }}
            tickLine={false}
            axisLine={{ stroke: '#D9DCE2' }}
            name="主観スコア"
          >
            <Label
              value="↑ 主観スコア（住民実感）"
              position="insideLeft"
              angle={-90}
              offset={12}
              style={{ fontSize: 10, fill: '#757780', textAnchor: 'middle' }}
            />
          </YAxis>
          <ReferenceLine
            x={BASELINE_OBJECTIVE}
            stroke="#757780"
            strokeDasharray="6 3"
            strokeOpacity={0.6}
          />
          <ReferenceLine
            y={BASELINE_SUBJECTIVE}
            stroke="#757780"
            strokeDasharray="6 3"
            strokeOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Scatter data={chartData} shape={renderDot} />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant legend */}
      <div className="grid grid-cols-2 gap-2 mt-3 px-2">
        {QUADRANT_LABELS.map((q) => (
          <div key={q.position} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: q.color }}
            />
            <span style={{ color: q.color }} className="font-bold">
              {q.text}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-solid-gray-400 mt-2 px-2">
        基準線: 全国市区町村平均（主観 {BASELINE_SUBJECTIVE.toFixed(1)} / 客観{' '}
        {BASELINE_OBJECTIVE.toFixed(1)}）
      </p>
    </div>
  )
})
