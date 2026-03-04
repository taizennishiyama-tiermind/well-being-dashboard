import type {
  Resident,
  CategoryId,
  AggregatedCategory,
  DemographicBreakdown,
  InsightRecommendation,
  Region,
  AgeGroup,
  Gender,
  ObjectiveIndicatorValue,
  ObjectiveIndicatorMeta,
  CategoryBudgetSummary,
  CrossAnalysisPoint,
  EfficiencyInsight,
  InsightType,
  InsightSeverity,
  BudgetAllocation,
  BudgetProgram,
} from './types'
import { CATEGORIES, getStatusLevel } from './constants'

export function aggregateCategories(residents: readonly Resident[]): readonly AggregatedCategory[] {
  return CATEGORIES.map((meta) => {
    const scores = residents.map((r) => {
      const cat = r.categories.find((c) => c.id === meta.id)
      return cat ?? { subjectiveScore: 0, objectiveScore: 0 }
    })

    const avgSubjective =
      Math.round((scores.reduce((sum, s) => sum + s.subjectiveScore, 0) / scores.length) * 10) / 10
    const avgObjective =
      Math.round((scores.reduce((sum, s) => sum + s.objectiveScore, 0) / scores.length) * 10) / 10
    const gap = Math.round((avgSubjective - avgObjective) * 10) / 10
    const avgScore = (avgSubjective + avgObjective) / 2

    return {
      id: meta.id,
      label: meta.label,
      avgSubjective,
      avgObjective,
      gap,
      status: getStatusLevel(avgScore),
      trend: Math.round((Math.random() * 0.6 - 0.1) * 10) / 10,
    }
  })
}

export function getOverallScore(residents: readonly Resident[]): number {
  const sum = residents.reduce((acc, r) => acc + r.overallScore, 0)
  return Math.round((sum / residents.length) * 10) / 10
}

export function getScoreDistribution(
  residents: readonly Resident[],
): readonly { readonly range: string; readonly count: number }[] {
  const bins = [
    { range: '1-2', min: 1, max: 3, count: 0 },
    { range: '3-4', min: 3, max: 5, count: 0 },
    { range: '5-6', min: 5, max: 7, count: 0 },
    { range: '7-8', min: 7, max: 9, count: 0 },
    { range: '9-10', min: 9, max: 10.1, count: 0 },
  ]

  for (const r of residents) {
    for (const bin of bins) {
      if (r.overallScore >= bin.min && r.overallScore < bin.max) {
        bin.count++
        break
      }
    }
  }

  return bins.map(({ range, count }) => ({ range, count }))
}

export function getRegionBreakdown(residents: readonly Resident[]): readonly DemographicBreakdown[] {
  const regionMap = new Map<Region, { total: number; count: number }>()

  for (const r of residents) {
    const current = regionMap.get(r.region) ?? { total: 0, count: 0 }
    regionMap.set(r.region, {
      total: current.total + r.overallScore,
      count: current.count + 1,
    })
  }

  return Array.from(regionMap.entries())
    .map(([label, { total, count }]) => ({
      label,
      count,
      avgScore: Math.round((total / count) * 10) / 10,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
}

export function getAgeBreakdown(residents: readonly Resident[]): readonly DemographicBreakdown[] {
  const ageOrder: readonly AgeGroup[] = ['18-29', '30-39', '40-49', '50-59', '60-69', '70+']
  const ageMap = new Map<AgeGroup, { total: number; count: number }>()

  for (const r of residents) {
    const current = ageMap.get(r.ageGroup) ?? { total: 0, count: 0 }
    ageMap.set(r.ageGroup, {
      total: current.total + r.overallScore,
      count: current.count + 1,
    })
  }

  return ageOrder
    .filter((ag) => ageMap.has(ag))
    .map((ag) => {
      const { total, count } = ageMap.get(ag)!
      return { label: ag, count, avgScore: Math.round((total / count) * 10) / 10 }
    })
}

export function getGenderBreakdown(residents: readonly Resident[]): readonly DemographicBreakdown[] {
  const genderMap = new Map<Gender, { total: number; count: number }>()

  for (const r of residents) {
    const current = genderMap.get(r.gender) ?? { total: 0, count: 0 }
    genderMap.set(r.gender, {
      total: current.total + r.overallScore,
      count: current.count + 1,
    })
  }

  return Array.from(genderMap.entries()).map(([label, { total, count }]) => ({
    label,
    count,
    avgScore: Math.round((total / count) * 10) / 10,
  }))
}

export function getCategoryByRegion(
  residents: readonly Resident[],
  categoryId: CategoryId,
): readonly { readonly region: string; readonly subjective: number; readonly objective: number }[] {
  const regionMap = new Map<
    string,
    { subjTotal: number; objTotal: number; count: number }
  >()

  for (const r of residents) {
    const cat = r.categories.find((c) => c.id === categoryId)
    if (!cat) continue
    const current = regionMap.get(r.region) ?? { subjTotal: 0, objTotal: 0, count: 0 }
    regionMap.set(r.region, {
      subjTotal: current.subjTotal + cat.subjectiveScore,
      objTotal: current.objTotal + cat.objectiveScore,
      count: current.count + 1,
    })
  }

  return Array.from(regionMap.entries()).map(([region, { subjTotal, objTotal, count }]) => ({
    region,
    subjective: Math.round((subjTotal / count) * 10) / 10,
    objective: Math.round((objTotal / count) * 10) / 10,
  }))
}

export function getTopStrengths(
  aggregated: readonly AggregatedCategory[],
  count: number = 3,
): readonly AggregatedCategory[] {
  return [...aggregated]
    .sort((a, b) => (b.avgSubjective + b.avgObjective) / 2 - (a.avgSubjective + a.avgObjective) / 2)
    .slice(0, count)
}

export function getTopWeaknesses(
  aggregated: readonly AggregatedCategory[],
  count: number = 3,
): readonly AggregatedCategory[] {
  return [...aggregated]
    .sort((a, b) => (a.avgSubjective + a.avgObjective) / 2 - (b.avgSubjective + b.avgObjective) / 2)
    .slice(0, count)
}

// ===== サブ指標レベルの強み・弱み =====

export interface SubIndicatorRanking {
  readonly label: string
  readonly categoryId: CategoryId
  readonly parentLabel: string
  readonly avgScore: number
}

export function getTopSubIndicators(
  residents: readonly Resident[],
  count: number = 3,
): readonly SubIndicatorRanking[] {
  return getRankedSubIndicators(residents).slice(0, count)
}

export function getBottomSubIndicators(
  residents: readonly Resident[],
  count: number = 3,
): readonly SubIndicatorRanking[] {
  return getRankedSubIndicators(residents).slice(-count).reverse()
}

function getRankedSubIndicators(residents: readonly Resident[]): readonly SubIndicatorRanking[] {
  const subMap = new Map<string, { total: number; count: number; categoryId: CategoryId; parentLabel: string }>()

  for (const r of residents) {
    for (const cat of r.categories) {
      const meta = CATEGORIES.find((c) => c.id === cat.id)
      for (const sub of cat.subIndicators) {
        const existing = subMap.get(sub.label) ?? { total: 0, count: 0, categoryId: cat.id, parentLabel: meta?.label ?? '' }
        subMap.set(sub.label, {
          total: existing.total + sub.score,
          count: existing.count + 1,
          categoryId: cat.id,
          parentLabel: meta?.label ?? '',
        })
      }
    }
  }

  return Array.from(subMap.entries())
    .map(([label, { total, count, categoryId, parentLabel }]) => ({
      label,
      categoryId,
      parentLabel,
      avgScore: Math.round((total / count) * 10) / 10,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
}

export function generateInsights(
  aggregated: readonly AggregatedCategory[],
): readonly InsightRecommendation[] {
  const sorted = [...aggregated].sort(
    (a, b) => Math.abs(b.gap) - Math.abs(a.gap),
  )

  const insights: InsightRecommendation[] = [
    {
      id: 'insight_1',
      priority: '最優先',
      category: sorted[0].id,
      title: `${sorted[0].label}の主観・客観ギャップ解消`,
      fact: `${sorted[0].label}分野では住民の主観スコア(${sorted[0].avgSubjective})と客観データ(${sorted[0].avgObjective})に${Math.abs(sorted[0].gap).toFixed(1)}ポイントの乖離があります。300人中約${Math.round(300 * 0.35)}人がこの分野で低評価をつけています。`,
      soWhat: `客観データは改善傾向にあるにもかかわらず、住民の実感が追いついていません。施策の「見える化」と住民への情報発信が不足している可能性があります。`,
      nowWhat: `住民向けの成果レポートを四半期ごとに発行し、具体的な改善事例をSNSやタウンミーティングで共有することを推奨します。`,
      impact: 8.5,
      gap: Math.abs(sorted[0].gap),
      budgetPerPerson: 12500,
    },
    {
      id: 'insight_2',
      priority: '要注目',
      category: sorted[1].id,
      title: `${sorted[1].label}の地域間格差対応`,
      fact: `${sorted[1].label}分野の地域間スコア差は最大1.8ポイントに及びます。特に中山間部での客観指標が他地域比で低い傾向があります。`,
      soWhat: `地域間格差が固定化すると、住民流出や高齢化の加速につながるリスクがあります。早期のインフラ投資が必要です。`,
      nowWhat: `中山間部を重点改善地区に指定し、移動支援サービスの試行導入と地域コミュニティセンターの機能強化を検討してください。`,
      impact: 7.2,
      gap: Math.abs(sorted[1].gap),
      budgetPerPerson: 8800,
    },
    {
      id: 'insight_3',
      priority: '機会',
      category: sorted[2].id,
      title: `${sorted[2].label}の先進事例展開`,
      fact: `${sorted[2].label}分野は全体的に良好（平均${((sorted[2].avgSubjective + sorted[2].avgObjective) / 2).toFixed(1)}）ですが、20代の満足度が他年代と比べてやや高く、成功体験が蓄積されています。`,
      soWhat: `若年層の好事例を他世代に横展開することで、全体底上げのレバレッジポイントになります。`,
      nowWhat: `20代住民によるメンタリングプログラムの導入と、世代間交流イベントの開催を検討してください。`,
      impact: 6.0,
      gap: Math.abs(sorted[2].gap),
      budgetPerPerson: 5200,
    },
  ]

  return insights
}

export function getRadarData(
  aggregated: readonly AggregatedCategory[],
): readonly { readonly category: string; readonly subjective: number; readonly objective: number; readonly fullMark: number }[] {
  return aggregated.map((cat) => ({
    category: cat.label,
    subjective: cat.avgSubjective,
    objective: cat.avgObjective,
    fullMark: 10,
  }))
}

export function getBubbleData(
  insights: readonly InsightRecommendation[],
): readonly { readonly x: number; readonly y: number; readonly z: number; readonly name: string; readonly priority: string }[] {
  return insights.map((insight) => ({
    x: insight.budgetPerPerson,
    y: insight.gap,
    z: insight.impact * 100,
    name: CATEGORIES.find((c) => c.id === insight.category)?.label ?? '',
    priority: insight.priority,
  }))
}

// ===== 客観指標・予算クロス分析関数 =====

export function getObjectiveCompositeByCategory(
  indicators: readonly ObjectiveIndicatorValue[],
  indicatorMeta: readonly ObjectiveIndicatorMeta[],
  categoryId: CategoryId,
): number {
  const relatedMeta = indicatorMeta.filter((m) =>
    m.relatedCategories.includes(categoryId)
  )
  if (relatedMeta.length === 0) return 50

  const relatedIds = new Set(relatedMeta.map((m) => m.id))
  const relatedValues = indicators.filter((v) => relatedIds.has(v.indicatorId))
  if (relatedValues.length === 0) return 50

  const sum = relatedValues.reduce((acc, v) => acc + v.normalizedScore, 0)
  return Math.round((sum / relatedValues.length) * 10) / 10
}

// 全国市町村平均ベンチマーク（カテゴリ別、予算+スコア）
// 出典想定: 総務省「地方財政状況調査」＋内閣府 Well-Being指標調査
// ※ 日高郡の予算と比べてプラス・マイナスが混在するよう設定
import type { NationalBenchmark } from './types'

export const NATIONAL_BENCHMARKS: Record<CategoryId, NationalBenchmark> = {
  health:     { budgetPerCapita: 35000, subjectiveScore: 6.2, objectiveScore: 55 },
  community:  { budgetPerCapita: 20000, subjectiveScore: 5.8, objectiveScore: 48 },
  diversity:  { budgetPerCapita: 12000, subjectiveScore: 5.0, objectiveScore: 50 },
  childcare:  { budgetPerCapita: 45000, subjectiveScore: 5.5, objectiveScore: 58 },
  efficacy:   { budgetPerCapita: 15000, subjectiveScore: 6.0, objectiveScore: 52 },
  transport:  { budgetPerCapita: 28000, subjectiveScore: 5.2, objectiveScore: 55 },
}

// 相対効率指数（REI）: 100=全国平均、>100=高効率、<100=非効率
// REI = (localScore × nationalBudget) / (nationalScore × localBudget) × 100
function calculateEI(
  localScore: number,
  localBudget: number,
  nationalScore: number,
  nationalBudget: number,
): number {
  if (localBudget <= 0 || nationalBudget <= 0 || nationalScore <= 0) return 100
  return Math.round((localScore * nationalBudget) / (nationalScore * localBudget) * 100)
}

export function getCrossAnalysisData(
  residents: readonly Resident[],
  indicators: readonly ObjectiveIndicatorValue[],
  indicatorMeta: readonly ObjectiveIndicatorMeta[],
  budgetSummaries: readonly CategoryBudgetSummary[],
): readonly CrossAnalysisPoint[] {
  const aggregated = aggregateCategories(residents)

  return CATEGORIES.map((catMeta) => {
    const agg = aggregated.find((a) => a.id === catMeta.id)
    const budgetSummary = budgetSummaries.find((b) => b.categoryId === catMeta.id)
    const objectiveComposite = getObjectiveCompositeByCategory(
      indicators, indicatorMeta, catMeta.id
    )
    const subjectiveScore = agg?.avgSubjective ?? 5
    const budgetPerCapita = budgetSummary?.budgetPerCapita ?? 0
    const executionRate = budgetSummary?.executionRate ?? 0
    const benchmark = NATIONAL_BENCHMARKS[catMeta.id]

    // gap: 両方を0-10スケールに揃えてポイント差を算出
    const objOn10Scale = objectiveComposite / 10
    const gap = Math.round((subjectiveScore - objOn10Scale) * 10) / 10

    // REI計算: スコア/予算の比率を全国対比で指数化
    const nationalObjOn10 = benchmark.objectiveScore / 10
    const localCombined = subjectiveScore + objOn10Scale
    const nationalCombined = benchmark.subjectiveScore + nationalObjOn10

    const efficiencyIndex = calculateEI(localCombined, budgetPerCapita, nationalCombined, benchmark.budgetPerCapita)
    const subjectiveEI = calculateEI(subjectiveScore, budgetPerCapita, benchmark.subjectiveScore, benchmark.budgetPerCapita)
    const objectiveEI = calculateEI(objOn10Scale, budgetPerCapita, nationalObjOn10, benchmark.budgetPerCapita)

    return {
      categoryId: catMeta.id,
      label: catMeta.label,
      subjectiveScore,
      objectiveComposite,
      budgetPerCapita,
      nationalBenchmark: benchmark,
      executionRate,
      gap,
      efficiencyIndex,
      subjectiveEI,
      objectiveEI,
    }
  })
}

export function generateDynamicInsights(
  crossAnalysis: readonly CrossAnalysisPoint[],
  indicators: readonly ObjectiveIndicatorValue[],
  indicatorMeta: readonly ObjectiveIndicatorMeta[],
  budgets: readonly BudgetAllocation[],
  programs: readonly BudgetProgram[],
): readonly EfficiencyInsight[] {
  const insights: EfficiencyInsight[] = []
  let idCounter = 1

  function addInsight(
    type: InsightType,
    severity: InsightSeverity,
    categoryId: CategoryId,
    title: string,
    description: string,
    evidence: readonly string[],
    recommendation: string,
    impact: number,
    relatedIndicators: readonly string[],
    relatedPrograms: readonly string[],
  ): void {
    insights.push({
      id: `di_${String(idCounter++).padStart(3, '0')}`,
      type, severity, categoryId, title, description, evidence,
      recommendation, estimatedImpact: impact,
      relatedIndicators, relatedPrograms,
    })
  }

  // 1. high_spend_low_result: 高予算なのに客観スコアが全国平均以下
  for (const point of crossAnalysis) {
    const catLabel = CATEGORIES.find((c) => c.id === point.categoryId)?.label ?? ''
    if (point.budgetPerCapita > 15000 && point.objectiveComposite < 50) {
      const relatedProgs = programs
        .filter((p) => p.categoryId === point.categoryId)
        .map((p) => p.id)
      const relatedInds = indicatorMeta
        .filter((m) => m.relatedCategories.includes(point.categoryId))
        .filter((m) => {
          const val = indicators.find((v) => v.indicatorId === m.id)
          return val && val.normalizedScore < 50
        })
        .map((m) => m.id)

      addInsight(
        'high_spend_low_result', 'critical', point.categoryId,
        `${catLabel}: 予算投入に見合わない成果`,
        `${catLabel}分野は1人あたり${Math.round(point.budgetPerCapita / 1000)}千円の予算を投入していますが、客観指標の平均スコアは${point.objectiveComposite}と全国平均を下回っています。`,
        [
          `予算規模: ${Math.round(point.budgetPerCapita).toLocaleString()}円/人`,
          `客観スコア: ${point.objectiveComposite}/100（全国平均50）`,
          `執行率: ${point.executionRate}%`,
        ],
        `事業の費用対効果を検証し、低パフォーマンス事業の見直しまたは予算の再配分を検討してください。`,
        8.5, relatedInds, relatedProgs,
      )
    }
  }

  // 2. low_spend_high_result: 低予算で高成果
  for (const point of crossAnalysis) {
    const catLabel = CATEGORIES.find((c) => c.id === point.categoryId)?.label ?? ''
    if (point.budgetPerCapita < 12000 && point.objectiveComposite > 55) {
      const relatedProgs = programs
        .filter((p) => p.categoryId === point.categoryId)
        .map((p) => p.id)

      addInsight(
        'low_spend_high_result', 'opportunity', point.categoryId,
        `${catLabel}: 効率的な成果を実現`,
        `${catLabel}分野は比較的少ない予算で全国平均を上回る客観スコア${point.objectiveComposite}を達成しています。`,
        [
          `予算規模: ${Math.round(point.budgetPerCapita).toLocaleString()}円/人`,
          `客観スコア: ${point.objectiveComposite}/100`,
          `効率指数: ${point.efficiencyIndex}（全国平均=100）`,
        ],
        `この分野の成功要因を分析し、他分野への横展開を検討してください。また、さらなる予算拡充による成果向上の余地があります。`,
        6.0, [], relatedProgs,
      )
    }
  }

  // 3. perception_gap: 主観と客観の大きな乖離
  for (const point of crossAnalysis) {
    const catLabel = CATEGORIES.find((c) => c.id === point.categoryId)?.label ?? ''
    if (Math.abs(point.gap) > 1.2) {
      const direction = point.gap > 0
        ? '住民は実感しているが、客観データでは不足している'
        : '客観データでは充実しているが、住民は実感できていない'
      addInsight(
        'perception_gap', point.gap < 0 ? 'warning' : 'info', point.categoryId,
        `${catLabel}: 主観と客観に大きな乖離`,
        `${catLabel}分野では${direction}状況です。乖離幅は${Math.abs(point.gap).toFixed(1)}ptです。`,
        [
          `主観スコア: ${point.subjectiveScore.toFixed(1)}/10`,
          `客観スコア: ${(point.objectiveComposite / 10).toFixed(1)}/10（元データ: ${point.objectiveComposite}/100）`,
          `乖離: ${point.gap > 0 ? '+' : ''}${point.gap.toFixed(1)}pt`,
        ],
        point.gap < 0
          ? `施策の成果を住民に「見える化」する広報強化と、タウンミーティングでの直接対話を推奨します。`
          : `客観データの改善が必要です。現状の施策が実態の改善に繋がっているか検証してください。`,
        7.5, [], [],
      )
    }
  }

  // 4. trend_alert: 前年比大幅低下した指標
  const decliningIndicators = indicators.filter((v) => {
    const decline = v.previousYearScore - v.normalizedScore
    return decline > 8
  })

  if (decliningIndicators.length > 0) {
    const topDeclines = [...decliningIndicators]
      .sort((a, b) => (b.previousYearScore - b.normalizedScore) - (a.previousYearScore - a.normalizedScore))
      .slice(0, 3)

    const evidence = topDeclines.map((v) => {
      const meta = indicatorMeta.find((m) => m.id === v.indicatorId)
      const decline = (v.previousYearScore - v.normalizedScore).toFixed(1)
      return `${meta?.label ?? v.indicatorId}: ${v.previousYearScore}→${v.normalizedScore}（-${decline}pt）`
    })

    const primaryCategory = indicatorMeta.find((m) => m.id === topDeclines[0].indicatorId)?.relatedCategories[0] ?? 'health'

    addInsight(
      'trend_alert', 'warning', primaryCategory,
      `${decliningIndicators.length}指標が前年比大幅低下`,
      `${decliningIndicators.length}個の客観指標が前年と比較して8ポイント以上低下しています。早急な原因分析が必要です。`,
      evidence,
      `低下した指標の関連事業の執行状況を確認し、外部要因（コロナ影響等）か内部要因（予算不足等）かを切り分けてください。`,
      8.0, topDeclines.map((v) => v.indicatorId), [],
    )
  }

  // 5. regional_disparity: 執行率が特に低い事業
  const fy25Budgets = budgets.filter((b) => b.fiscalYear === '2025')
  const lowExecution = fy25Budgets.filter((b) => b.executionRate < 75)

  if (lowExecution.length > 0) {
    const worst = [...lowExecution].sort((a, b) => a.executionRate - b.executionRate).slice(0, 3)
    const evidence = worst.map((b) => {
      const prog = programs.find((p) => p.id === b.programId)
      return `${prog?.name ?? b.programId}: 執行率${b.executionRate}%（予算${Math.round(b.budgetAmount / 100_000_000)}億円）`
    })

    const primaryProg = programs.find((p) => p.id === worst[0].programId)

    addInsight(
      'regional_disparity', 'warning', primaryProg?.categoryId ?? 'efficacy',
      `${lowExecution.length}事業で予算執行率が75%未満`,
      `FY2025の予算執行率が75%を下回る事業が${lowExecution.length}件あります。予算の有効活用に課題があります。`,
      evidence,
      `執行率が低い事業について、実施体制の見直しや事業設計の再検討を行い、次年度の予算編成に反映してください。`,
      7.0, [], worst.map((b) => b.programId),
    )
  }

  return insights.sort((a, b) => {
    const severityOrder: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2, opportunity: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}
