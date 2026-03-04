import type { BudgetProgram, BudgetAllocation, CategoryId, ObjectiveDomainId, FiscalYear } from './types'

// ===== 事業定義（30事業） =====

export const BUDGET_PROGRAMS: readonly BudgetProgram[] = [
  // 健康・医療（5事業）
  { id: 'BP_H01', name: '地域包括ケアシステム推進事業', categoryId: 'health', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_HC_001', 'LE_HC_002', 'LE_HC_004'], description: '在宅医療・介護の連携体制強化' },
  { id: 'BP_H02', name: '健康増進・予防医療推進事業', categoryId: 'health', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_HC_005', 'AL_LG_001', 'AL_LG_002', 'AL_LG_003'], description: '特定健診受診率向上と生活習慣病予防' },
  { id: 'BP_H03', name: '救急医療体制整備事業', categoryId: 'health', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_HC_006'], description: '救急搬送体制の充実と応急手当普及' },
  { id: 'BP_H04', name: '精神保健福祉推進事業', categoryId: 'health', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_WF_003', 'LE_WF_006'], description: 'メンタルヘルス相談体制の強化' },
  { id: 'BP_H05', name: '介護施設整備事業', categoryId: 'health', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_WF_005', 'LE_WF_003'], description: '特別養護老人ホーム等の定員拡充' },

  // 地域つながり（5事業）
  { id: 'BP_C01', name: 'コミュニティ活性化事業', categoryId: 'community', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_PT_001', 'RR_PT_002', 'RR_PT_005'], description: '自治会・町内会活動支援と地域イベント振興' },
  { id: 'BP_C02', name: '関係人口創出・移住促進事業', categoryId: 'community', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_CV_001', 'AL_PL_003'], description: '二拠点生活支援と関係人口プログラム' },
  { id: 'BP_C03', name: 'NPO・市民活動支援事業', categoryId: 'community', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_PT_003', 'RR_CV_001', 'RR_CV_003'], description: 'NPO法人設立支援と活動場所提供' },
  { id: 'BP_C04', name: '地域福祉推進事業', categoryId: 'community', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_PT_004', 'RR_HH_002', 'RR_HH_004'], description: '民生委員活動支援と見守りネットワーク' },
  { id: 'BP_C05', name: '都市再生・まちづくり事業', categoryId: 'community', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_CV_002', 'RR_CV_004'], description: '中心市街地活性化とコンパクトシティ推進' },

  // 多様性・包摂（5事業）
  { id: 'BP_D01', name: '多文化共生推進事業', categoryId: 'diversity', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_DV_004', 'RR_DV_005'], description: '外国籍住民支援と多言語対応' },
  { id: 'BP_D02', name: '男女共同参画推進事業', categoryId: 'diversity', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_DV_001', 'RR_DV_002', 'RR_DV_003', 'AL_EM_005'], description: '女性活躍推進と政策決定への参画促進' },
  { id: 'BP_D03', name: 'バリアフリー推進事業', categoryId: 'diversity', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_WF_006', 'LE_TR_002'], description: '公共施設・交通のユニバーサルデザイン化' },
  { id: 'BP_D04', name: '文化芸術振興事業', categoryId: 'diversity', domainId: 'authenticLiving', relatedIndicatorIds: ['AL_CL_001', 'AL_CL_002', 'AL_CL_003', 'AL_CL_004'], description: '文化団体支援と芸術祭開催' },
  { id: 'BP_D05', name: '人権啓発推進事業', categoryId: 'diversity', domainId: 'regionalRelations', relatedIndicatorIds: ['RR_DV_005'], description: '人権教育と啓発イベント開催' },

  // 子育て・教育（5事業）
  { id: 'BP_K01', name: '保育環境整備事業', categoryId: 'childcare', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_WF_001', 'LE_WF_002'], description: '認可保育所の増設と待機児童解消' },
  { id: 'BP_K02', name: '学校教育ICT推進事業', categoryId: 'childcare', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_EF_003'], description: 'GIGAスクール構想の推進' },
  { id: 'BP_K03', name: '放課後子ども支援事業', categoryId: 'childcare', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_EF_004', 'LE_EF_002'], description: '放課後児童クラブの拡充と質向上' },
  { id: 'BP_K04', name: '通学路安全確保事業', categoryId: 'childcare', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_SF_005'], description: '通学路の交通安全対策と見守り強化' },
  { id: 'BP_K05', name: '生涯学習推進事業', categoryId: 'childcare', domainId: 'authenticLiving', relatedIndicatorIds: ['AL_ED_001', 'AL_ED_002', 'AL_ED_003'], description: '公民館・図書館の機能充実' },

  // 自己効力感（5事業）
  { id: 'BP_E01', name: '行政DX推進事業', categoryId: 'efficacy', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_GV_002', 'LE_GV_004'], description: 'オンライン手続き拡大とデジタル人材育成' },
  { id: 'BP_E02', name: '創業・スタートアップ支援事業', categoryId: 'efficacy', domainId: 'authenticLiving', relatedIndicatorIds: ['AL_IN_001', 'AL_IN_002', 'AL_IN_003'], description: 'インキュベーション施設運営と創業助成' },
  { id: 'BP_E03', name: '就労支援・雇用促進事業', categoryId: 'efficacy', domainId: 'authenticLiving', relatedIndicatorIds: ['AL_EM_001', 'AL_EM_002', 'AL_EM_005'], description: '就職マッチングと職業訓練' },
  { id: 'BP_E04', name: '再生可能エネルギー導入事業', categoryId: 'efficacy', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_EN_003', 'LE_EN_002'], description: '公共施設への太陽光パネル設置' },
  { id: 'BP_E05', name: 'イノベーション推進事業', categoryId: 'efficacy', domainId: 'authenticLiving', relatedIndicatorIds: ['AL_IN_004', 'AL_IN_001'], description: '産学連携プログラムとオープンイノベーション' },

  // 交通・移動（5事業）
  { id: 'BP_T01', name: '地域公共交通維持確保事業', categoryId: 'transport', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_TR_001', 'LE_TR_003'], description: 'コミュニティバス運行とデマンド交通導入' },
  { id: 'BP_T02', name: '道路・歩道整備事業', categoryId: 'transport', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_TR_002', 'LE_TR_005'], description: 'バリアフリー歩道整備と自転車レーン新設' },
  { id: 'BP_T03', name: '交通安全推進事業', categoryId: 'transport', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_SF_002', 'LE_SF_003'], description: '交通安全教室と街灯・カーブミラー設置' },
  { id: 'BP_T04', name: '防災基盤整備事業', categoryId: 'transport', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_DS_001', 'LE_DS_002', 'LE_DS_003', 'LE_DS_004'], description: '避難所整備と防災情報システム構築' },
  { id: 'BP_T05', name: '環境保全推進事業', categoryId: 'transport', domainId: 'livingEnvironment', relatedIndicatorIds: ['LE_EN_001', 'LE_EN_004', 'LE_EN_005', 'LE_EN_006'], description: 'リサイクル推進と緑化事業' },
] as const

// ===== 予算配分データ生成 =====

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// カテゴリ別の予算規模基準（百万円）
const CATEGORY_BUDGET_SCALE: Record<CategoryId, number> = {
  health: 3200,      // 健康・医療: 最大（32億円）
  community: 1200,   // 地域つながり: 中規模
  diversity: 800,    // 多様性: やや小規模
  childcare: 2800,   // 子育て・教育: 大規模
  efficacy: 1500,    // 自己効力感: 中規模
  transport: 2500,   // 交通・移動: 大規模
}

// 各事業の予算配分比率と特性
interface ProgramBudgetProfile {
  readonly budgetRatio: number  // カテゴリ予算に対する比率
  readonly executionBase: number // 基本執行率
  readonly growthRate: number    // FY2024→FY2025の変化率
}

const PROGRAM_PROFILES: Record<string, ProgramBudgetProfile> = {
  // 健康
  BP_H01: { budgetRatio: 0.30, executionBase: 0.92, growthRate: 0.05 },
  BP_H02: { budgetRatio: 0.20, executionBase: 0.88, growthRate: 0.08 },
  BP_H03: { budgetRatio: 0.25, executionBase: 0.95, growthRate: 0.03 },
  BP_H04: { budgetRatio: 0.10, executionBase: 0.82, growthRate: 0.12 },
  BP_H05: { budgetRatio: 0.15, executionBase: 0.78, growthRate: 0.15 },
  // 地域つながり
  BP_C01: { budgetRatio: 0.25, executionBase: 0.85, growthRate: 0.06 },
  BP_C02: { budgetRatio: 0.20, executionBase: 0.72, growthRate: 0.20 },
  BP_C03: { budgetRatio: 0.15, executionBase: 0.80, growthRate: 0.10 },
  BP_C04: { budgetRatio: 0.25, executionBase: 0.93, growthRate: 0.02 },
  BP_C05: { budgetRatio: 0.15, executionBase: 0.70, growthRate: 0.25 },
  // 多様性
  BP_D01: { budgetRatio: 0.25, executionBase: 0.85, growthRate: 0.15 },
  BP_D02: { budgetRatio: 0.20, executionBase: 0.78, growthRate: 0.10 },
  BP_D03: { budgetRatio: 0.25, executionBase: 0.90, growthRate: 0.05 },
  BP_D04: { budgetRatio: 0.20, executionBase: 0.82, growthRate: 0.08 },
  BP_D05: { budgetRatio: 0.10, executionBase: 0.88, growthRate: 0.03 },
  // 子育て
  BP_K01: { budgetRatio: 0.35, executionBase: 0.75, growthRate: 0.18 },  // 高予算・低執行（意図的）
  BP_K02: { budgetRatio: 0.20, executionBase: 0.85, growthRate: 0.12 },
  BP_K03: { budgetRatio: 0.20, executionBase: 0.90, growthRate: 0.08 },
  BP_K04: { budgetRatio: 0.10, executionBase: 0.95, growthRate: 0.02 },
  BP_K05: { budgetRatio: 0.15, executionBase: 0.80, growthRate: 0.06 },
  // 自己効力感
  BP_E01: { budgetRatio: 0.25, executionBase: 0.82, growthRate: 0.22 },
  BP_E02: { budgetRatio: 0.20, executionBase: 0.70, growthRate: 0.30 },  // 低執行・高成長
  BP_E03: { budgetRatio: 0.25, executionBase: 0.88, growthRate: 0.05 },
  BP_E04: { budgetRatio: 0.15, executionBase: 0.75, growthRate: 0.15 },
  BP_E05: { budgetRatio: 0.15, executionBase: 0.68, growthRate: 0.35 },
  // 交通
  BP_T01: { budgetRatio: 0.30, executionBase: 0.92, growthRate: 0.04 },
  BP_T02: { budgetRatio: 0.25, executionBase: 0.88, growthRate: 0.06 },
  BP_T03: { budgetRatio: 0.15, executionBase: 0.95, growthRate: 0.02 },
  BP_T04: { budgetRatio: 0.20, executionBase: 0.80, growthRate: 0.10 },
  BP_T05: { budgetRatio: 0.10, executionBase: 0.85, growthRate: 0.08 },
}

const FISCAL_YEARS: readonly FiscalYear[] = ['2021', '2022', '2023', '2024', '2025']

// Growth scaling per year (relative to FY2024 baseline)
const YEAR_GROWTH_FACTOR: Record<FiscalYear, number> = {
  '2021': 0.88,
  '2022': 0.92,
  '2023': 0.96,
  '2024': 1.00,
  '2025': 1.00, // computed from growthRate
}

function generateAllocations(): readonly BudgetAllocation[] {
  const rng = mulberry32(256)
  const allocations: BudgetAllocation[] = []

  for (const program of BUDGET_PROGRAMS) {
    const profile = PROGRAM_PROFILES[program.id]
    if (!profile) continue

    const categoryScale = CATEGORY_BUDGET_SCALE[program.categoryId]
    const baseBudget = categoryScale * profile.budgetRatio * 1_000_000

    let prevBudget = 0

    for (let yi = 0; yi < FISCAL_YEARS.length; yi++) {
      const fy = FISCAL_YEARS[yi]
      const growthFactor = fy === '2025'
        ? 1 + profile.growthRate + (rng() - 0.5) * 0.04
        : YEAR_GROWTH_FACTOR[fy] + (rng() - 0.5) * 0.04

      const budget = yi === 0
        ? Math.round(baseBudget * growthFactor)
        : fy === '2025'
          ? Math.round(prevBudget * growthFactor)
          : Math.round(baseBudget * growthFactor * (0.95 + rng() * 0.1))

      const execNoise = (rng() - 0.5) * 0.06
      const execImprove = yi * 0.005
      const executionRate = Math.min(0.99, Math.max(0.60, profile.executionBase + execNoise + execImprove))
      const executed = Math.round(budget * executionRate)

      const changeRate = prevBudget > 0
        ? Math.round(((budget - prevBudget) / prevBudget) * 1000) / 10
        : 0

      allocations.push({
        programId: program.id,
        fiscalYear: fy,
        budgetAmount: budget,
        executedAmount: executed,
        executionRate: Math.round(executionRate * 1000) / 10,
        previousYearBudget: prevBudget || Math.round(budget * 0.95),
        changeRate,
      })

      prevBudget = budget
    }
  }

  return allocations
}

let cachedAllocations: readonly BudgetAllocation[] | null = null

export function getBudgetAllocations(): readonly BudgetAllocation[] {
  if (!cachedAllocations) {
    cachedAllocations = generateAllocations()
  }
  return cachedAllocations
}

export function getAllocationsByYear(fiscalYear: FiscalYear): readonly BudgetAllocation[] {
  return getBudgetAllocations().filter((a) => a.fiscalYear === fiscalYear)
}

export function getAllocationForProgram(
  programId: string,
  fiscalYear: FiscalYear,
): BudgetAllocation | undefined {
  return getBudgetAllocations().find(
    (a) => a.programId === programId && a.fiscalYear === fiscalYear
  )
}

export function getProgramById(programId: string): BudgetProgram | undefined {
  return BUDGET_PROGRAMS.find((p) => p.id === programId)
}

export function getProgramsByCategory(categoryId: CategoryId): readonly BudgetProgram[] {
  return BUDGET_PROGRAMS.filter((p) => p.categoryId === categoryId)
}

export function getTotalBudget(fiscalYear: FiscalYear): number {
  return getAllocationsByYear(fiscalYear).reduce((sum, a) => sum + a.budgetAmount, 0)
}

export function getTotalExecuted(fiscalYear: FiscalYear): number {
  return getAllocationsByYear(fiscalYear).reduce((sum, a) => sum + a.executedAmount, 0)
}
