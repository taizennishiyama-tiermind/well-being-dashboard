import type { ObjectiveIndicatorValue } from './types'
import { OBJECTIVE_INDICATORS } from './objectiveIndicators'

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussianRandom(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng()
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2)
  return mean + z * stddev
}

function clampScore(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)) * 10) / 10
}

// サブドメインごとの基準スコア（自治体の特徴を反映）
const SUB_DOMAIN_BASELINES: Record<string, number> = {
  // 生活環境
  healthcare: 55,
  welfare: 48,
  commerce: 52,
  housing: 50,
  transport: 46,
  safety: 58,
  governance: 54,
  environment: 50,
  disaster: 52,
  education_facility: 49,
  // 地域の人間関係
  participation: 48,
  household: 45,
  civic: 50,
  diversity_rel: 44,
  // 自分らしい生き方
  political: 52,
  employment: 48,
  longevity: 55,
  culture: 50,
  lifelong_edu: 47,
  innovation: 42,
}

// 特定指標の個別スコア調整（画像のスコアパターンを反映）
const INDICATOR_ADJUSTMENTS: Record<string, number> = {
  LE_HC_001: +3,   // 医療施設数 やや高め
  LE_HC_002: -8,   // カバー率 低め（画像で谷）
  LE_WF_001: -10,  // 待機児童率 課題あり
  LE_WF_004: -5,   // 生活保護率 やや高め
  LE_TR_001: -8,   // バス路線 少ない
  LE_TR_003: -6,   // 公共交通カバー率 低め
  LE_GV_001: +8,   // 財政力指数 高め
  LE_GV_002: +12,  // DX指標 高め
  LE_EN_001: +5,   // リサイクル率 良好
  LE_EN_002: -3,   // CO2排出 やや多い
  LE_SF_001: +8,   // 犯罪認知件数 低い（良い）
  RR_PT_001: +10,  // 自治会参加率 高め
  RR_PT_002: +15,  // 祭りの数 多い
  RR_DV_001: -8,   // 議会女性割合 低い
  RR_DV_005: +18,  // 多様性政策指数 高め（画像の急上昇）
  AL_PL_001: +8,   // 投票率 やや高め
  AL_EM_001: +5,   // 失業率 低い（良い）
  AL_IN_001: +5,   // ベンチャー企業 やや多め
  AL_IN_004: +30,  // イノベーション政策指数 高め（画像で突出）
  AL_LG_001: +5,   // 健康寿命女性 高め
}

function generateIndicatorValue(
  rng: () => number,
  indicatorId: string,
  subDomainId: string,
): ObjectiveIndicatorValue {
  const baseline = SUB_DOMAIN_BASELINES[subDomainId] ?? 50
  const adjustment = INDICATOR_ADJUSTMENTS[indicatorId] ?? 0
  const noise = gaussianRandom(rng, 0, 6)

  const normalizedScore = clampScore(baseline + adjustment + noise, 15, 95)
  const nationalAverage = 50
  const prefectureAverage = clampScore(gaussianRandom(rng, 50, 5), 35, 65)
  const previousYearScore = clampScore(normalizedScore + gaussianRandom(rng, -2, 3), 15, 95)
  const rank = Math.max(1, Math.min(815, Math.round(
    815 * (1 - normalizedScore / 100) + gaussianRandom(rng, 0, 30)
  )))

  // 生値は指標ごとに異なるスケールだが、サンプルとして正規化スコアから逆算
  const rawValue = clampScore(normalizedScore * (0.8 + rng() * 0.4), 5, 120)

  return {
    indicatorId,
    rawValue,
    normalizedScore,
    nationalAverage,
    prefectureAverage,
    previousYearScore,
    rank,
    totalMunicipalities: 815,
  }
}

function generateAllIndicatorValues(): readonly ObjectiveIndicatorValue[] {
  const rng = mulberry32(137)

  return OBJECTIVE_INDICATORS.map((meta) =>
    generateIndicatorValue(rng, meta.id, meta.subDomainId)
  )
}

let cachedValues: readonly ObjectiveIndicatorValue[] | null = null

export function getObjectiveIndicatorValues(): readonly ObjectiveIndicatorValue[] {
  if (!cachedValues) {
    cachedValues = generateAllIndicatorValues()
  }
  return cachedValues
}

export function getIndicatorValue(indicatorId: string): ObjectiveIndicatorValue | undefined {
  return getObjectiveIndicatorValues().find((v) => v.indicatorId === indicatorId)
}

export function getIndicatorValuesByDomain(domainId: string): readonly ObjectiveIndicatorValue[] {
  const domainIndicatorIds = new Set(
    OBJECTIVE_INDICATORS
      .filter((m) => m.domainId === domainId)
      .map((m) => m.id)
  )
  return getObjectiveIndicatorValues().filter((v) => domainIndicatorIds.has(v.indicatorId))
}

export function getDomainAverageScore(domainId: string): number {
  const values = getIndicatorValuesByDomain(domainId)
  if (values.length === 0) return 0
  const sum = values.reduce((acc, v) => acc + v.normalizedScore, 0)
  return Math.round((sum / values.length) * 10) / 10
}
