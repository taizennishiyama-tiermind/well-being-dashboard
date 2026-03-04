'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface DistributionBarProps {
  readonly data: readonly { readonly range: string; readonly count: number }[]
  readonly height?: number
}

const RANGE_COLORS = ['#E57373', '#FF8A65', '#FFD54F', '#7096F8', '#0031D8']

export function DistributionBar({ data, height = 200 }: DistributionBarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={[...data]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF2" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 11, fill: '#757780' }}
          tickLine={false}
          axisLine={{ stroke: '#D9DCE2' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#757780' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ECEEF2',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`${value}人`, '人数']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {[...data].map((_, index) => (
            <Cell key={`cell-${index}`} fill={RANGE_COLORS[index % RANGE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface DemographicBarProps {
  readonly data: readonly { readonly label: string; readonly count: number; readonly avgScore: number }[]
  readonly height?: number
  readonly color?: string
}

export function DemographicBar({ data, height = 200, color = '#4DB6AC' }: DemographicBarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={[...data]} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF2" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: '#757780' }}
          tickLine={false}
        />
        <YAxis
          dataKey="label"
          type="category"
          tick={{ fontSize: 12, fill: '#4A4C56' }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ECEEF2',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [Number(value).toFixed(1), '平均スコア']}
        />
        <Bar dataKey="avgScore" fill={color} radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
