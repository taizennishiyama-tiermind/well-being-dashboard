import type { CategoryId, FiscalYear } from './types'

// ===== 歳入（Revenue）モデル =====

export interface RevenueSource {
  readonly id: string
  readonly label: string
  readonly shortLabel: string
  readonly parentId: string | null
  readonly color: string
}

export interface RevenueAmount {
  readonly sourceId: string
  readonly fiscalYear: FiscalYear
  readonly amount: number
}

// 歳入カテゴリ（集約レベル）
export const REVENUE_CATEGORIES: readonly RevenueSource[] = [
  { id: 'RC_TAX', label: '地方税', shortLabel: '地方税', parentId: null, color: '#0031D8' },
  { id: 'RC_ALLOC', label: '地方交付税', shortLabel: '交付税', parentId: null, color: '#264AF4' },
  { id: 'RC_NATIONAL', label: '国庫支出金', shortLabel: '国庫', parentId: null, color: '#4979F5' },
  { id: 'RC_PREF', label: '都道府県支出金', shortLabel: '県支出金', parentId: null, color: '#5B6FAF' },
  { id: 'RC_BOND', label: '地方債', shortLabel: '地方債', parentId: null, color: '#D4920B' },
  { id: 'RC_FEE', label: '使用料・手数料', shortLabel: '使用料', parentId: null, color: '#E07930' },
  { id: 'RC_TRANSFER', label: '繰入金・繰越金', shortLabel: '繰入金', parentId: null, color: '#7A8BAA' },
  { id: 'RC_OTHER', label: 'その他収入', shortLabel: 'その他', parentId: null, color: '#A3B1C6' },
]

// 歳入詳細（個別レベル）
export const REVENUE_DETAILS: readonly RevenueSource[] = [
  // 地方税の内訳
  { id: 'RD_TAX_RES', label: '市民税（個人）', shortLabel: '個人市民税', parentId: 'RC_TAX', color: '#0031D8' },
  { id: 'RD_TAX_CORP', label: '市民税（法人）', shortLabel: '法人市民税', parentId: 'RC_TAX', color: '#0031D8' },
  { id: 'RD_TAX_PROP', label: '固定資産税', shortLabel: '固定資産税', parentId: 'RC_TAX', color: '#0031D8' },
  { id: 'RD_TAX_OTHER', label: 'その他税', shortLabel: 'その他税', parentId: 'RC_TAX', color: '#0031D8' },
  // 国庫支出金の内訳
  { id: 'RD_NAT_WELFARE', label: '民生費国庫負担金', shortLabel: '民生国庫', parentId: 'RC_NATIONAL', color: '#4979F5' },
  { id: 'RD_NAT_EDU', label: '教育費国庫補助金', shortLabel: '教育国庫', parentId: 'RC_NATIONAL', color: '#4979F5' },
  { id: 'RD_NAT_INFRA', label: '土木費国庫補助金', shortLabel: '土木国庫', parentId: 'RC_NATIONAL', color: '#4979F5' },
  // 地方債の内訳
  { id: 'RD_BOND_GEN', label: '一般会計債', shortLabel: '一般債', parentId: 'RC_BOND', color: '#D4920B' },
  { id: 'RD_BOND_SP', label: '臨時財政対策債', shortLabel: '臨財債', parentId: 'RC_BOND', color: '#D4920B' },
]

// ===== 歳出（Expenditure）目的別モデル =====

export interface ExpenditureCategory {
  readonly id: string
  readonly label: string
  readonly shortLabel: string
  readonly color: string
  readonly wellBeingMapping: readonly { readonly categoryId: CategoryId; readonly ratio: number }[]
}

// 目的別歳出区分（自治体の一般的な歳出分類）
export const EXPENDITURE_CATEGORIES: readonly ExpenditureCategory[] = [
  {
    id: 'EX_WELFARE', label: '民生費', shortLabel: '民生費', color: '#0031D8',
    wellBeingMapping: [
      { categoryId: 'health', ratio: 0.40 },
      { categoryId: 'childcare', ratio: 0.45 },
      { categoryId: 'community', ratio: 0.15 },
    ],
  },
  {
    id: 'EX_EDU', label: '教育費', shortLabel: '教育費', color: '#D4920B',
    wellBeingMapping: [
      { categoryId: 'childcare', ratio: 0.55 },
      { categoryId: 'efficacy', ratio: 0.30 },
      { categoryId: 'diversity', ratio: 0.15 },
    ],
  },
  {
    id: 'EX_CIVIL', label: '土木費', shortLabel: '土木費', color: '#264AF4',
    wellBeingMapping: [
      { categoryId: 'transport', ratio: 0.70 },
      { categoryId: 'community', ratio: 0.20 },
      { categoryId: 'health', ratio: 0.10 },
    ],
  },
  {
    id: 'EX_SANIT', label: '衛生費', shortLabel: '衛生費', color: '#E07930',
    wellBeingMapping: [
      { categoryId: 'health', ratio: 0.60 },
      { categoryId: 'transport', ratio: 0.30 },
      { categoryId: 'community', ratio: 0.10 },
    ],
  },
  {
    id: 'EX_GENERAL', label: '総務費', shortLabel: '総務費', color: '#5B6FAF',
    wellBeingMapping: [
      { categoryId: 'efficacy', ratio: 0.40 },
      { categoryId: 'diversity', ratio: 0.30 },
      { categoryId: 'community', ratio: 0.30 },
    ],
  },
  {
    id: 'EX_COMMERCE', label: '商工費', shortLabel: '商工費', color: '#4979F5',
    wellBeingMapping: [
      { categoryId: 'efficacy', ratio: 0.50 },
      { categoryId: 'community', ratio: 0.30 },
      { categoryId: 'diversity', ratio: 0.20 },
    ],
  },
  {
    id: 'EX_FIRE', label: '消防費', shortLabel: '消防費', color: '#D32F2F',
    wellBeingMapping: [
      { categoryId: 'health', ratio: 0.50 },
      { categoryId: 'transport', ratio: 0.50 },
    ],
  },
  {
    id: 'EX_DEBT', label: '公債費', shortLabel: '公債費', color: '#7A8BAA',
    wellBeingMapping: [],
  },
  {
    id: 'EX_OTHER', label: 'その他', shortLabel: 'その他', color: '#A3B1C6',
    wellBeingMapping: [],
  },
]

// ===== 歳入・歳出データ生成 =====

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 自治体の一般会計規模: 人口10万人 → 約500億円
const TOTAL_BUDGET_BASE = 30_000_000_000 // 300億円（日高郡+御坊市規模）

// 歳入構成比（典型的な市の歳入構造）
const REVENUE_RATIOS: Record<string, number> = {
  RC_TAX: 0.33,       // 地方税 33%
  RC_ALLOC: 0.16,     // 地方交付税 16%
  RC_NATIONAL: 0.17,  // 国庫支出金 17%
  RC_PREF: 0.07,      // 都道府県支出金 7%
  RC_BOND: 0.09,      // 地方債 9%
  RC_FEE: 0.04,       // 使用料・手数料 4%
  RC_TRANSFER: 0.08,  // 繰入金 8%
  RC_OTHER: 0.06,     // その他 6%
}

// 地方税内訳
const TAX_DETAIL_RATIOS: Record<string, number> = {
  RD_TAX_RES: 0.40,    // 個人市民税 40%
  RD_TAX_CORP: 0.15,   // 法人市民税 15%
  RD_TAX_PROP: 0.38,   // 固定資産税 38%
  RD_TAX_OTHER: 0.07,  // その他税 7%
}

// 国庫支出金内訳
const NATIONAL_DETAIL_RATIOS: Record<string, number> = {
  RD_NAT_WELFARE: 0.55,
  RD_NAT_EDU: 0.25,
  RD_NAT_INFRA: 0.20,
}

// 地方債内訳
const BOND_DETAIL_RATIOS: Record<string, number> = {
  RD_BOND_GEN: 0.65,
  RD_BOND_SP: 0.35,
}

// 歳出構成比（目的別）
const EXPENDITURE_RATIOS: Record<string, number> = {
  EX_WELFARE: 0.38,   // 民生費 38%（最大）
  EX_EDU: 0.14,       // 教育費 14%
  EX_CIVIL: 0.12,     // 土木費 12%
  EX_SANIT: 0.08,     // 衛生費 8%
  EX_GENERAL: 0.10,   // 総務費 10%
  EX_COMMERCE: 0.04,  // 商工費 4%
  EX_FIRE: 0.04,      // 消防費 4%
  EX_DEBT: 0.08,      // 公債費 8%
  EX_OTHER: 0.02,     // その他 2%
}

export interface BudgetFlowSummary {
  readonly fiscalYear: FiscalYear
  readonly totalRevenue: number
  readonly totalExpenditure: number
  readonly balance: number
  readonly revenueItems: readonly { readonly sourceId: string; readonly amount: number; readonly ratio: number }[]
  readonly revenueDetails: readonly { readonly sourceId: string; readonly parentId: string; readonly amount: number; readonly ratio: number }[]
  readonly expenditureItems: readonly { readonly categoryId: string; readonly amount: number; readonly ratio: number }[]
  readonly wellBeingAllocation: readonly { readonly categoryId: CategoryId; readonly amount: number; readonly ratio: number }[]
}

function generateBudgetFlow(fiscalYear: FiscalYear): BudgetFlowSummary {
  const seedMap: Record<FiscalYear, number> = { '2021': 510, '2022': 511, '2023': 512, '2024': 513, '2025': 514 }
  const rng = mulberry32(seedMap[fiscalYear] ?? 514)
  const growthMap: Record<FiscalYear, number> = { '2021': 0.94, '2022': 0.96, '2023': 0.98, '2024': 1.0, '2025': 1.025 }
  const growthFactor = growthMap[fiscalYear] ?? 1.0
  const totalBase = Math.round(TOTAL_BUDGET_BASE * growthFactor)

  // 歳入
  const revenueItems = REVENUE_CATEGORIES.map((src) => {
    const baseRatio = REVENUE_RATIOS[src.id] ?? 0.05
    const noise = (rng() - 0.5) * 0.02
    const ratio = Math.max(0.01, baseRatio + noise)
    return {
      sourceId: src.id,
      amount: Math.round(totalBase * ratio),
      ratio: Math.round(ratio * 1000) / 10,
    }
  })
  const totalRevenue = revenueItems.reduce((s, i) => s + i.amount, 0)

  // 歳入詳細
  const revenueDetails = REVENUE_DETAILS.map((detail) => {
    const parentItem = revenueItems.find((r) => r.sourceId === detail.parentId)
    const parentAmount = parentItem?.amount ?? 0
    const detailRatioMap =
      detail.parentId === 'RC_TAX' ? TAX_DETAIL_RATIOS
      : detail.parentId === 'RC_NATIONAL' ? NATIONAL_DETAIL_RATIOS
      : BOND_DETAIL_RATIOS
    const detailRatio = detailRatioMap[detail.id] ?? 0.5
    const amount = Math.round(parentAmount * detailRatio)
    return {
      sourceId: detail.id,
      parentId: detail.parentId ?? '',
      amount,
      ratio: Math.round(detailRatio * 1000) / 10,
    }
  })

  // 歳出
  const expenditureItems = EXPENDITURE_CATEGORIES.map((cat) => {
    const baseRatio = EXPENDITURE_RATIOS[cat.id] ?? 0.02
    const noise = (rng() - 0.5) * 0.015
    const ratio = Math.max(0.01, baseRatio + noise)
    return {
      categoryId: cat.id,
      amount: Math.round(totalBase * ratio * 0.97),
      ratio: Math.round(ratio * 1000) / 10,
    }
  })
  const totalExpenditure = expenditureItems.reduce((s, i) => s + i.amount, 0)

  // WB配分計算
  const wbTotals: Record<CategoryId, number> = {
    health: 0, community: 0, diversity: 0,
    childcare: 0, efficacy: 0, transport: 0,
  }
  for (const item of expenditureItems) {
    const catMeta = EXPENDITURE_CATEGORIES.find((c) => c.id === item.categoryId)
    if (!catMeta) continue
    for (const mapping of catMeta.wellBeingMapping) {
      wbTotals[mapping.categoryId] += Math.round(item.amount * mapping.ratio)
    }
  }
  const wbTotal = Object.values(wbTotals).reduce((s, v) => s + v, 0)
  const wellBeingAllocation = (Object.entries(wbTotals) as [CategoryId, number][])
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      ratio: wbTotal > 0 ? Math.round((amount / wbTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    fiscalYear,
    totalRevenue,
    totalExpenditure,
    balance: totalRevenue - totalExpenditure,
    revenueItems,
    revenueDetails,
    expenditureItems,
    wellBeingAllocation,
  }
}

const flowCache: Partial<Record<FiscalYear, BudgetFlowSummary>> = {}

export function getBudgetFlowSummary(fiscalYear: FiscalYear): BudgetFlowSummary {
  if (!flowCache[fiscalYear]) {
    flowCache[fiscalYear] = generateBudgetFlow(fiscalYear)
  }
  return flowCache[fiscalYear]
}

// ===== 施策・条例データ =====

export interface PolicyRecommendation {
  readonly id: string
  readonly categoryId: CategoryId
  readonly type: '条例' | '施策' | '計画' | '補助金'
  readonly title: string
  readonly description: string
  readonly currentStatus: '実施中' | '検討中' | '提案'
  readonly expectedImpact: '高' | '中' | '低'
  readonly relatedExpenditureIds: readonly string[]
  readonly estimatedCost: number
  readonly budgetInsight: string
}

export const POLICY_RECOMMENDATIONS: readonly PolicyRecommendation[] = [
  {
    id: 'POL_001',
    categoryId: 'health',
    type: '計画',
    title: '地域包括ケア推進計画の拡充',
    description: '在宅医療・介護連携を強化し、高齢者の自立支援と重度化防止を推進。訪問看護ステーションの増設とICTを活用した情報連携基盤の構築。',
    currentStatus: '実施中',
    expectedImpact: '高',
    relatedExpenditureIds: ['EX_WELFARE', 'EX_SANIT'],
    estimatedCost: 2_500_000_000,
    budgetInsight: '民生費のうち40%を占めるが、客観スコアの改善は限定的。予防医療への配分シフトで費用対効果の向上が期待できる。',
  },
  {
    id: 'POL_002',
    categoryId: 'childcare',
    type: '条例',
    title: '子ども・子育て支援条例の改正',
    description: '待機児童ゼロ達成に向けた保育施設整備義務と、放課後児童クラブの定員拡充を条例で明文化。企業主導型保育の誘致促進措置を追加。',
    currentStatus: '検討中',
    expectedImpact: '高',
    relatedExpenditureIds: ['EX_WELFARE', 'EX_EDU'],
    estimatedCost: 3_800_000_000,
    budgetInsight: '保育環境整備事業（BP_K01）の執行率が75%と低迷。条例整備により民間参入を促進し、公費負担を抑制しつつサービス拡充が可能。',
  },
  {
    id: 'POL_003',
    categoryId: 'transport',
    type: '計画',
    title: '地域公共交通計画の策定',
    description: 'コミュニティバスのルート最適化とデマンド交通のAI配車システム導入。高齢者の移動支援と交通空白地域の解消を目指す。',
    currentStatus: '実施中',
    expectedImpact: '高',
    relatedExpenditureIds: ['EX_CIVIL'],
    estimatedCost: 1_800_000_000,
    budgetInsight: '土木費の70%が交通関連だが、バス路線指標（LE_TR_001）は全国平均を下回る。AI配車によるコスト25%削減と利便性向上の両立を目指す。',
  },
  {
    id: 'POL_004',
    categoryId: 'efficacy',
    type: '施策',
    title: '行政DX・スマートシティ推進施策',
    description: 'オンライン手続き率80%達成とオープンデータ推進。市民満足度調査のデジタル化とリアルタイムダッシュボード公開。',
    currentStatus: '実施中',
    expectedImpact: '中',
    relatedExpenditureIds: ['EX_GENERAL'],
    estimatedCost: 800_000_000,
    budgetInsight: 'DX指標（LE_GV_002）は全国上位だが、投資効率を維持するためクラウド化による運用コスト30%削減を同時推進すべき。',
  },
  {
    id: 'POL_005',
    categoryId: 'community',
    type: '補助金',
    title: '地域コミュニティ活性化補助金',
    description: '自治会・町内会の活動費補助の増額と、新規NPO設立への初期費用助成。デジタル回覧板導入費用の補助制度新設。',
    currentStatus: '提案',
    expectedImpact: '中',
    relatedExpenditureIds: ['EX_GENERAL', 'EX_COMMERCE'],
    estimatedCost: 350_000_000,
    budgetInsight: '地域つながり予算は全体の9%と小規模だが、自治会参加率（RR_PT_001）改善には直接補助が最も費用対効果が高い。',
  },
  {
    id: 'POL_006',
    categoryId: 'diversity',
    type: '条例',
    title: '多文化共生推進条例の制定',
    description: '外国籍住民への多言語行政サービス提供義務化と、やさしい日本語での情報発信の標準化。国際交流拠点の設置。',
    currentStatus: '検討中',
    expectedImpact: '中',
    relatedExpenditureIds: ['EX_GENERAL', 'EX_EDU'],
    estimatedCost: 500_000_000,
    budgetInsight: '多様性関連予算は最小カテゴリだが、外国籍人口比率の上昇に対応した投資は将来の社会コスト抑制につながる。',
  },
  {
    id: 'POL_007',
    categoryId: 'efficacy',
    type: '施策',
    title: 'スタートアップ・エコシステム構築',
    description: '産学連携イノベーションハブの設立と、創業5年以内のベンチャーへの重点支援。コワーキングスペースの公設民営化。',
    currentStatus: '提案',
    expectedImpact: '高',
    relatedExpenditureIds: ['EX_COMMERCE'],
    estimatedCost: 600_000_000,
    budgetInsight: 'イノベーション推進事業（BP_E05）の執行率68%は課題。事業スキーム見直しと民間協業モデルへの転換で執行率85%以上を目指す。',
  },
  {
    id: 'POL_008',
    categoryId: 'health',
    type: '施策',
    title: '予防医療・フレイル対策事業',
    description: '65歳以上全員への年次フレイルチェック実施と、運動教室・栄養指導の地域展開。データヘルス計画との連動。',
    currentStatus: '実施中',
    expectedImpact: '高',
    relatedExpenditureIds: ['EX_WELFARE', 'EX_SANIT'],
    estimatedCost: 1_200_000_000,
    budgetInsight: '健康寿命指標が全国平均以下。予防投資1円あたり医療費3.5円の削減効果（厚労省試算）を考慮し、予防へのシフトを推奨。',
  },
]

export function getPoliciesByCategory(categoryId: CategoryId): readonly PolicyRecommendation[] {
  return POLICY_RECOMMENDATIONS.filter((p) => p.categoryId === categoryId)
}

export function getPolicyById(id: string): PolicyRecommendation | undefined {
  return POLICY_RECOMMENDATIONS.find((p) => p.id === id)
}
