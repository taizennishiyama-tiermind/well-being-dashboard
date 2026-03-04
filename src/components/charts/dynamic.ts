import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ui/ChartSkeleton'
import { createElement } from 'react'

function skeleton(height: number) {
  return function Loading() {
    return createElement(ChartSkeleton, { height })
  }
}

export const WellBeingRadar = dynamic(
  () => import('./WellBeingRadar').then((m) => ({ default: m.WellBeingRadar })),
  { ssr: false, loading: skeleton(320) }
)

export const GapChart = dynamic(
  () => import('./GapChart').then((m) => ({ default: m.GapChart })),
  { ssr: false, loading: skeleton(300) }
)

export const TrendLineChart = dynamic(
  () => import('./TrendLineChart').then((m) => ({ default: m.TrendLineChart })),
  { ssr: false, loading: skeleton(320) }
)

export const DistributionBar = dynamic(
  () => import('./DistributionBar').then((m) => ({ default: m.DistributionBar })),
  { ssr: false, loading: skeleton(220) }
)

export const DemographicBar = dynamic(
  () => import('./DistributionBar').then((m) => ({ default: m.DemographicBar })),
  { ssr: false, loading: skeleton(220) }
)

export const BudgetDonut = dynamic(
  () => import('./BudgetDonut').then((m) => ({ default: m.BudgetDonut })),
  { ssr: false, loading: skeleton(340) }
)

export const BudgetTrendPanel = dynamic(
  () => import('./BudgetTrendPanel').then((m) => ({ default: m.BudgetTrendPanel })),
  { ssr: false, loading: skeleton(300) }
)

export const BudgetScoreCross = dynamic(
  () => import('./BudgetScoreCross').then((m) => ({ default: m.BudgetScoreCross })),
  { ssr: false, loading: skeleton(300) }
)

export const BudgetWaterfall = dynamic(
  () => import('./BudgetWaterfall').then((m) => ({ default: m.BudgetWaterfall })),
  { ssr: false, loading: skeleton(300) }
)

export const BudgetCategoryBar = dynamic(
  () => import('./BudgetCategoryBar').then((m) => ({ default: m.BudgetCategoryBar })),
  { ssr: false, loading: skeleton(300) }
)

export const IndicatorHeatmap = dynamic(
  () => import('./IndicatorHeatmap').then((m) => ({ default: m.IndicatorHeatmap })),
  { ssr: false, loading: skeleton(300) }
)

export const IndicatorComparisonBar = dynamic(
  () => import('./IndicatorComparisonBar').then((m) => ({ default: m.IndicatorComparisonBar })),
  { ssr: false, loading: skeleton(300) }
)
