'use client'

import { memo } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarDataPoint {
  readonly category: string
  readonly subjective: number
  readonly objective: number
  readonly fullMark: number
}

interface WellBeingRadarProps {
  readonly data: readonly RadarDataPoint[]
  readonly height?: number
}

function renderCustomTick(props: {
  payload: { value: string }
  x: number
  y: number
  cx: number
  cy: number
}) {
  const { payload, x, y, cx, cy } = props
  const label = payload.value
  const dx = x - cx
  const dy = y - cy
  const angle = Math.atan2(dy, dx)

  // Push labels outward
  const offset = 14
  const nx = x + Math.cos(angle) * offset
  const ny = y + Math.sin(angle) * offset

  // Determine text-anchor based on position
  let anchor: 'start' | 'middle' | 'end' = 'middle'
  if (dx > 10) anchor = 'start'
  else if (dx < -10) anchor = 'end'

  return (
    <text
      x={nx}
      y={ny}
      textAnchor={anchor}
      dominantBaseline="central"
      fill="#4A4C56"
      fontSize={13}
      fontWeight={600}
    >
      {label}
    </text>
  )
}

export const WellBeingRadar = memo(function WellBeingRadar({ data, height = 350 }: WellBeingRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={[...data]} cx="50%" cy="50%" outerRadius="55%">
        <PolarGrid stroke="#D9DCE2" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="category"
          tick={renderCustomTick as never}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 10, fill: '#757780' }}
          tickCount={6}
        />
        <Radar
          name="主観（住民実感）"
          dataKey="subjective"
          stroke="#E8854A"
          fill="#E8854A"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="客観（統計データ）"
          dataKey="objective"
          stroke="#0031D8"
          fill="#0031D8"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ fontSize: 13, paddingTop: 16 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ECEEF2',
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(value) => Number(value).toFixed(1)}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
})
