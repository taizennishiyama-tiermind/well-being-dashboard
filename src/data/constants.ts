import type { CategoryMeta, CategoryId, StatusLevel, MonthlyTrend } from './types'

// デジタル庁デザインシステムベースのカテゴリカラー
export const CATEGORIES: readonly CategoryMeta[] = [
  {
    id: 'health',
    label: '健康・医療',
    icon: 'health_fill.svg',
    description: '身体的・精神的健康と医療アクセス',
    subIndicatorLabels: ['身体的健康', '精神的健康', '医療アクセス', '運動習慣'],
    color: '#0017C1',   // DA blue-900
  },
  {
    id: 'community',
    label: '地域つながり',
    icon: 'family_fill.svg',
    description: '近隣関係・地域活動・信頼感',
    subIndicatorLabels: ['近隣関係', '地域イベント', 'ボランティア', '信頼感'],
    color: '#264AF4',   // DA blue-700
  },
  {
    id: 'diversity',
    label: '多様性・包摂',
    icon: 'municipality_fill.svg',
    description: '多様性の受容・文化活動・バリアフリー',
    subIndicatorLabels: ['多様性受容', '文化活動', 'バリアフリー', '外国人支援'],
    color: '#5B6FAF',   // インディゴ
  },
  {
    id: 'childcare',
    label: '子育て・教育',
    icon: 'child_fill.svg',
    description: '保育施設・教育品質・放課後支援',
    subIndicatorLabels: ['保育施設', '教育品質', '通学安全', '放課後支援'],
    color: '#6D28D9',   // バイオレット（青系パレット統一）
  },
  {
    id: 'efficacy',
    label: '自己効力感',
    icon: 'work_fill.svg',
    description: '生活満足度・将来展望・自律性',
    subIndicatorLabels: ['生活満足度', '将来展望', '自律性', 'スキル向上'],
    color: '#4979F5',   // DA blue-500
  },
  {
    id: 'transport',
    label: '交通・移動',
    icon: 'departure_fill.svg',
    description: '公共交通・歩きやすさ・道路安全',
    subIndicatorLabels: ['公共交通', '歩きやすさ', '道路安全', 'アクセス性'],
    color: '#0877D7',   // DA light-blue-700
  },
] as const

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  const meta = CATEGORIES.find((c) => c.id === id)
  if (!meta) {
    throw new Error(`Unknown category: ${id}`)
  }
  return meta
}

export function getStatusLevel(score: number): StatusLevel {
  if (score >= 8.0) return 'excellent'
  if (score >= 6.5) return 'good'
  if (score >= 5.0) return 'neutral'
  if (score >= 3.5) return 'poor'
  return 'critical'
}

// デジタル庁デザインシステムベースのステータスカラー
export const STATUS_CONFIG: Record<
  StatusLevel,
  { readonly label: string; readonly color: string; readonly bgClass: string }
> = {
  excellent: { label: 'とても良い', color: '#0017C1', bgClass: 'bg-blue-100' },
  good: { label: '良い', color: '#0031D8', bgClass: 'bg-blue-50' },
  neutral: { label: 'ふつう', color: '#757780', bgClass: 'bg-gray-100' },
  poor: { label: 'やや課題あり', color: '#E07930', bgClass: 'bg-orange-100' },
  critical: { label: '要改善', color: '#D32F2F', bgClass: 'bg-red-100' },
}

export const ILLUSTRATION_MAP: Record<StatusLevel, readonly string[]> = {
  excellent: ['s_human01.png', 's_human05.png', 's_human09.png', 's_human13.png', 's_human17.png', 's_human21.png'],
  good: ['s_human02.png', 's_human06.png', 's_human10.png', 's_human14.png', 's_human18.png', 's_human22.png'],
  neutral: ['s_human03.png', 's_human07.png', 's_human11.png', 's_human15.png', 's_human19.png', 's_human23.png'],
  poor: ['s_human04.png', 's_human08.png', 's_human12.png', 's_human16.png', 's_human20.png', 's_human24.png'],
  critical: ['s_human04.png', 's_human08.png', 's_human12.png', 's_human16.png', 's_human20.png', 's_human24.png'],
}

export const MONTHLY_TRENDS: readonly MonthlyTrend[] = [
  { month: '2025/04', health: 6.2, community: 5.8, diversity: 5.5, childcare: 6.0, efficacy: 6.3, transport: 5.9, overall: 5.95 },
  { month: '2025/05', health: 6.3, community: 5.9, diversity: 5.6, childcare: 6.1, efficacy: 6.2, transport: 5.8, overall: 5.98 },
  { month: '2025/06', health: 6.1, community: 6.0, diversity: 5.7, childcare: 6.2, efficacy: 6.4, transport: 6.0, overall: 6.07 },
  { month: '2025/07', health: 6.4, community: 6.1, diversity: 5.8, childcare: 6.0, efficacy: 6.5, transport: 6.1, overall: 6.15 },
  { month: '2025/08', health: 6.3, community: 6.2, diversity: 5.9, childcare: 6.3, efficacy: 6.3, transport: 6.0, overall: 6.17 },
  { month: '2025/09', health: 6.5, community: 6.0, diversity: 5.8, childcare: 6.4, efficacy: 6.6, transport: 6.2, overall: 6.25 },
  { month: '2025/10', health: 6.6, community: 6.3, diversity: 6.0, childcare: 6.2, efficacy: 6.5, transport: 6.1, overall: 6.28 },
  { month: '2025/11', health: 6.4, community: 6.4, diversity: 6.1, childcare: 6.5, efficacy: 6.7, transport: 6.3, overall: 6.40 },
  { month: '2025/12', health: 6.7, community: 6.3, diversity: 6.0, childcare: 6.4, efficacy: 6.6, transport: 6.2, overall: 6.37 },
  { month: '2026/01', health: 6.5, community: 6.5, diversity: 6.2, childcare: 6.6, efficacy: 6.8, transport: 6.4, overall: 6.50 },
  { month: '2026/02', health: 6.8, community: 6.4, diversity: 6.1, childcare: 6.5, efficacy: 6.7, transport: 6.3, overall: 6.47 },
  { month: '2026/03', health: 6.6, community: 6.6, diversity: 6.3, childcare: 6.7, efficacy: 6.9, transport: 6.5, overall: 6.60 },
]
