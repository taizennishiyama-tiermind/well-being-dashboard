import type {
  Resident,
  CategoryId,
  ObjectiveIndicatorValue,
  ObjectiveIndicatorMeta,
  BudgetAllocation,
  BudgetProgram,
  CategoryBudgetSummary,
  CrossAnalysisPoint,
  InsightType,
  InsightSeverity,
  EnhancedInsight,
  KeyMetric,
  SubIndicatorSummary,
  IndicatorDetail,
  ProgramDetail,
  InsightHypothesis,
  ActionStep,
} from './types'
import { CATEGORIES } from './constants'

// ===== ヘルパー関数 =====

export function getSubIndicatorAvg(
  residents: readonly Resident[],
  categoryId: CategoryId,
): readonly SubIndicatorSummary[] {
  const meta = CATEGORIES.find((c) => c.id === categoryId)
  if (!meta) return []

  const labelScores = new Map<string, { total: number; count: number }>()

  for (const r of residents) {
    const cat = r.categories.find((c) => c.id === categoryId)
    if (!cat) continue
    for (const sub of cat.subIndicators) {
      const cur = labelScores.get(sub.label) ?? { total: 0, count: 0 }
      labelScores.set(sub.label, { total: cur.total + sub.score, count: cur.count + 1 })
    }
  }

  const items = Array.from(labelScores.entries()).map(([label, { total, count }]) => ({
    label,
    avgScore: Math.round((total / count) * 10) / 10,
  }))

  const categoryAvg = items.length > 0
    ? items.reduce((s, i) => s + i.avgScore, 0) / items.length
    : 0

  const sorted = [...items].sort((a, b) => a.avgScore - b.avgScore)

  return sorted.map((item, i) => ({
    label: item.label,
    avgScore: item.avgScore,
    rank: i + 1,
    deviation: Math.round((item.avgScore - categoryAvg) * 10) / 10,
  }))
}

export function resolveIndicators(
  ids: readonly string[],
  values: readonly ObjectiveIndicatorValue[],
  meta: readonly ObjectiveIndicatorMeta[],
): readonly IndicatorDetail[] {
  const results: IndicatorDetail[] = []
  for (const id of ids) {
    const val = values.find((v) => v.indicatorId === id)
    const m = meta.find((im) => im.id === id)
    if (!val || !m) continue
    results.push({
      id,
      label: m.label,
      score: val.normalizedScore,
      nationalAverage: val.nationalAverage,
      previousYearScore: val.previousYearScore,
      trend: Math.round((val.normalizedScore - val.previousYearScore) * 10) / 10,
      rank: val.rank,
      totalMunicipalities: val.totalMunicipalities,
    })
  }
  return results
}

export function resolvePrograms(
  categoryId: CategoryId,
  programs: readonly BudgetProgram[],
  allocations: readonly BudgetAllocation[],
): readonly ProgramDetail[] {
  const catProgs = programs.filter((p) => p.categoryId === categoryId)
  return catProgs.map((prog) => {
    const alloc = allocations.find((a) => a.programId === prog.id && a.fiscalYear === '2025')
    return {
      id: prog.id,
      name: prog.name,
      description: prog.description,
      budgetAmount: alloc?.budgetAmount ?? 0,
      executedAmount: alloc?.executedAmount ?? 0,
      executionRate: alloc?.executionRate ?? 0,
      changeRate: alloc?.changeRate ?? 0,
    }
  }).sort((a, b) => b.budgetAmount - a.budgetAmount)
}

function getWorstIndicatorsForCategory(
  categoryId: CategoryId,
  values: readonly ObjectiveIndicatorValue[],
  meta: readonly ObjectiveIndicatorMeta[],
  count: number,
): readonly IndicatorDetail[] {
  const related = meta.filter((m) => m.relatedCategories.includes(categoryId))
  const relatedIds = related.map((m) => m.id)
  const resolved = resolveIndicators(relatedIds, values, meta)
  return [...resolved].sort((a, b) => a.score - b.score).slice(0, count)
}

function buildKeyMetrics(
  type: InsightType,
  point: CrossAnalysisPoint,
  worstIndicator: IndicatorDetail | undefined,
  worstSubInd: SubIndicatorSummary | undefined,
): readonly KeyMetric[] {
  const metrics: KeyMetric[] = []

  if (type === 'high_spend_low_result' || type === 'low_spend_high_result') {
    const benchmarkMan = (point.nationalBenchmarkPerCapita / 10000).toFixed(1)
    const ratio = Math.round((point.budgetPerCapita / point.nationalBenchmarkPerCapita) * 100)
    metrics.push({
      label: '1人あたり予算',
      value: (point.budgetPerCapita / 10000).toFixed(1),
      unit: `万円（全国平均${benchmarkMan}万円の${ratio}%）`,
      dataType: '予算',
      severity: point.budgetPerCapita > 20000 ? 'bad' : 'neutral',
    })
  }

  metrics.push({
    label: '客観スコア',
    value: String(point.objectiveComposite),
    unit: '/100',
    dataType: '客観',
    severity: point.objectiveComposite < 45 ? 'bad' : point.objectiveComposite > 55 ? 'good' : 'neutral',
    trend: worstIndicator ? {
      direction: worstIndicator.trend < 0 ? 'down' : worstIndicator.trend > 0 ? 'up' : 'flat',
      value: `前年比${worstIndicator.trend > 0 ? '+' : ''}${worstIndicator.trend}pt`,
    } : undefined,
  })

  metrics.push({
    label: '主観スコア',
    value: point.subjectiveScore.toFixed(1),
    unit: '/10',
    dataType: '主観',
    severity: point.subjectiveScore < 5 ? 'bad' : point.subjectiveScore > 7 ? 'good' : 'neutral',
  })

  metrics.push({
    label: '執行率',
    value: String(point.executionRate),
    unit: '%',
    dataType: '予算',
    severity: point.executionRate < 75 ? 'bad' : point.executionRate > 90 ? 'good' : 'neutral',
  })

  if (type === 'perception_gap') {
    metrics.push({
      label: '乖離幅',
      value: Math.abs(point.gap).toFixed(1),
      unit: 'pt',
      dataType: point.gap < 0 ? '主観' : '客観',
      severity: Math.abs(point.gap) > 15 ? 'bad' : 'neutral',
    })
  }

  if (worstSubInd) {
    metrics.push({
      label: `最低設問「${worstSubInd.label}」`,
      value: worstSubInd.avgScore.toFixed(1),
      unit: '/10',
      dataType: '主観',
      severity: worstSubInd.avgScore < 5 ? 'bad' : 'neutral',
    })
  }

  return metrics.slice(0, 4)
}

function buildHypotheses(
  type: InsightType,
  point: CrossAnalysisPoint,
  indicators: readonly IndicatorDetail[],
  programs: readonly ProgramDetail[],
  subInds: readonly SubIndicatorSummary[],
): readonly InsightHypothesis[] {
  const hypotheses: InsightHypothesis[] = []
  const worstSub = subInds[0]
  const worstInd = indicators[0]
  const worstProg = [...programs].sort((a, b) => a.executionRate - b.executionRate)[0]

  if (type === 'high_spend_low_result') {
    if (worstProg && worstProg.executionRate < 80) {
      const unspent = Math.round((worstProg.budgetAmount - worstProg.executedAmount) / 100_000_000 * 10) / 10
      hypotheses.push({
        statement: `「${worstProg.name}」の執行率が${worstProg.executionRate}%と低く、未執行予算${unspent}億円分の事業が計画通り進んでいない可能性がある。`,
        supportingEvidence: [
          worstSub ? `「${worstSub.label}」の主観スコアが最低（${worstSub.avgScore}/10）` : '',
          worstInd ? `「${worstInd.label}」の客観スコアも${worstInd.score}/100` : '',
        ].filter(Boolean),
        confidence: '中',
      })
    }
    if (worstSub && worstInd) {
      hypotheses.push({
        statement: `住民が「${worstSub.label}」に不満を感じている（${worstSub.avgScore}/10）一方、客観指標「${worstInd.label}」も${worstInd.score}/100と低く、予算の使途が住民ニーズと乖離している可能性がある。`,
        supportingEvidence: [
          `予算規模: ${Math.round(point.budgetPerCapita).toLocaleString()}円/人`,
          `効率指数: ${point.efficiency}`,
        ],
        confidence: '中',
      })
    }
  }

  if (type === 'low_spend_high_result') {
    hypotheses.push({
      statement: `限られた予算（${(point.budgetPerCapita / 10000).toFixed(1)}万円/人）でも客観スコア${point.objectiveComposite}を達成しており、既存リソースの効率的な活用や地域の自発的な取り組みが機能している可能性がある。`,
      supportingEvidence: [
        `効率指数: ${point.efficiency}（予算1万円あたりの成果）`,
        worstSub ? `ただし「${worstSub.label}」は${worstSub.avgScore}/10と改善余地あり` : '',
      ].filter(Boolean),
      confidence: '中',
    })
  }

  if (type === 'perception_gap') {
    if (point.gap < 0) {
      hypotheses.push({
        statement: `客観データ（${point.objectiveComposite}/100）は一定水準にあるが、住民の実感（${point.subjectiveScore.toFixed(1)}/10）が追いついていない。施策の成果が住民に「見えていない」可能性がある。`,
        supportingEvidence: [
          worstSub ? `特に「${worstSub.label}」の満足度が低い（${worstSub.avgScore}/10）` : '',
          `乖離幅: ${Math.abs(point.gap).toFixed(1)}pt`,
        ].filter(Boolean),
        confidence: '高',
      })
    } else {
      hypotheses.push({
        statement: `住民の主観的満足度（${point.subjectiveScore.toFixed(1)}/10）が客観データ（${point.objectiveComposite}/100）を上回っており、統計上の課題が住民には顕在化していない可能性がある。`,
        supportingEvidence: [
          worstInd ? `「${worstInd.label}」は${worstInd.score}/100と全国平均以下` : '',
          `将来的にサービス品質の低下として顕在化するリスク`,
        ].filter(Boolean),
        confidence: '中',
      })
    }
  }

  if (type === 'trend_alert') {
    const declining = indicators.filter((ind) => ind.trend < -5)
    if (declining.length > 0) {
      hypotheses.push({
        statement: `${declining.length}個の客観指標が前年比で大幅低下しており、外部環境の変化（人口動態・経済情勢）または予算執行の遅れが影響している可能性がある。`,
        supportingEvidence: declining.map((d) =>
          `「${d.label}」: ${d.previousYearScore}→${d.score}（${d.trend}pt）`
        ),
        confidence: '中',
      })
    }
  }

  if (type === 'regional_disparity') {
    if (worstProg) {
      hypotheses.push({
        statement: `予算執行率の低い事業が存在し（「${worstProg.name}」${worstProg.executionRate}%）、人員不足や制度設計上の課題により予算が有効活用されていない可能性がある。`,
        supportingEvidence: [
          `未執行額: ${Math.round((worstProg.budgetAmount - worstProg.executedAmount) / 100_000_000 * 10) / 10}億円`,
          `前年比予算増: ${worstProg.changeRate > 0 ? '+' : ''}${worstProg.changeRate}%`,
        ],
        confidence: '中',
      })
    }
  }

  return hypotheses.length > 0 ? hypotheses : [{
    statement: 'データの詳細分析が必要です。現時点では明確な仮説を導出できる十分なエビデンスがありません。',
    supportingEvidence: [],
    confidence: '低',
  }]
}

function buildActionSteps(
  type: InsightType,
  programs: readonly ProgramDetail[],
  indicators: readonly IndicatorDetail[],
  subInds: readonly SubIndicatorSummary[],
): readonly ActionStep[] {
  const steps: ActionStep[] = []
  const worstProg = [...programs].sort((a, b) => a.executionRate - b.executionRate)[0]
  const worstSub = subInds[0]
  const worstInd = indicators[0]

  if (type === 'high_spend_low_result') {
    if (worstProg) {
      const unspent = Math.round((worstProg.budgetAmount - worstProg.executedAmount) / 100_000_000 * 10) / 10
      steps.push({
        order: 1,
        action: `「${worstProg.name}」（執行率${worstProg.executionRate}%）の未執行予算${unspent}億円の執行障壁を調査`,
        targetProgram: worstProg.name,
        expectedOutcome: `執行率90%達成により事業効果の発現が見込まれる`,
        timeframe: '即座',
      })
    }
    if (worstSub) {
      steps.push({
        order: 2,
        action: `「${worstSub.label}」（主観スコア${worstSub.avgScore}/10）に関するアンケート自由記述の詳細分析を実施`,
        expectedOutcome: `具体的な不満要因の特定と次回調査での主観スコア+0.5pt改善`,
        timeframe: '短期',
      })
    }
    if (worstInd) {
      steps.push({
        order: 3,
        action: `「${worstInd.label}」（${worstInd.score}/100, 全国${worstInd.rank}/${worstInd.totalMunicipalities}位）の改善に向けた事業再設計`,
        expectedOutcome: `全国平均（${worstInd.nationalAverage}）への到達`,
        timeframe: '中期',
      })
    }
  }

  if (type === 'low_spend_high_result') {
    const bestProg = [...programs].sort((a, b) => b.executionRate - a.executionRate)[0]
    if (bestProg) {
      steps.push({
        order: 1,
        action: `「${bestProg.name}」（執行率${bestProg.executionRate}%）の成功要因を分析・文書化`,
        targetProgram: bestProg.name,
        expectedOutcome: `他カテゴリへの横展開可能な施策パターンの特定`,
        timeframe: '短期',
      })
    }
    if (worstSub) {
      steps.push({
        order: 2,
        action: `「${worstSub.label}」（${worstSub.avgScore}/10）に重点的な予算拡充を検討`,
        expectedOutcome: `カテゴリ内のボトルネック解消によるスコア底上げ`,
        timeframe: '中期',
      })
    }
  }

  if (type === 'perception_gap') {
    if (worstSub) {
      steps.push({
        order: 1,
        action: `「${worstSub.label}」（主観${worstSub.avgScore}/10）の住民満足度が低い要因をヒアリング調査で特定`,
        expectedOutcome: `施策と住民ニーズのギャップの明確化`,
        timeframe: '即座',
      })
    }
    steps.push({
      order: steps.length + 1,
      action: `施策の成果を住民に伝えるレポートを四半期ごとに発行、SNS・タウンミーティングで共有`,
      expectedOutcome: `主観スコアの客観データへの収束（乖離幅50%縮小）`,
      timeframe: '短期',
    })
    if (worstInd) {
      steps.push({
        order: steps.length + 1,
        action: `「${worstInd.label}」（${worstInd.score}/100）の改善施策を重点実施`,
        expectedOutcome: `客観指標の全国平均到達`,
        timeframe: '中期',
      })
    }
  }

  if (type === 'trend_alert') {
    const declining = indicators.filter((ind) => ind.trend < -5).slice(0, 2)
    for (const ind of declining) {
      steps.push({
        order: steps.length + 1,
        action: `「${ind.label}」（${ind.previousYearScore}→${ind.score}, ${ind.trend}pt）の低下要因を分析（外部要因 vs 内部要因の切り分け）`,
        expectedOutcome: `原因特定と次年度予算への反映`,
        timeframe: '即座',
      })
    }
    if (worstProg) {
      steps.push({
        order: steps.length + 1,
        action: `「${worstProg.name}」の事業内容を低下指標に合わせて再設計`,
        targetProgram: worstProg.name,
        expectedOutcome: `指標低下の反転`,
        timeframe: '中期',
      })
    }
  }

  if (type === 'regional_disparity') {
    const lowExecProgs = programs.filter((p) => p.executionRate < 80).slice(0, 2)
    for (const prog of lowExecProgs) {
      steps.push({
        order: steps.length + 1,
        action: `「${prog.name}」（執行率${prog.executionRate}%）の実施体制を見直し`,
        targetProgram: prog.name,
        expectedOutcome: `執行率85%以上の達成`,
        timeframe: '短期',
      })
    }
    steps.push({
      order: steps.length + 1,
      action: `低執行率事業の次年度予算編成で事業設計を再検討`,
      expectedOutcome: `予算の有効活用率向上`,
      timeframe: '中期',
    })
  }

  return steps.length > 0 ? steps : [{
    order: 1,
    action: '詳細データの分析を実施し、具体的な施策を検討',
    expectedOutcome: '課題の明確化',
    timeframe: '短期',
  }]
}

// ===== メイン生成関数 =====

export function generateEnhancedInsights(
  residents: readonly Resident[],
  crossAnalysis: readonly CrossAnalysisPoint[],
  indicators: readonly ObjectiveIndicatorValue[],
  indicatorMeta: readonly ObjectiveIndicatorMeta[],
  allocations: readonly BudgetAllocation[],
  programs: readonly BudgetProgram[],
  _budgetSummaries: readonly CategoryBudgetSummary[],
): readonly EnhancedInsight[] {
  const insights: EnhancedInsight[] = []
  let idCounter = 1

  function nextId(): string {
    return `ei_${String(idCounter++).padStart(3, '0')}`
  }

  // 1. high_spend_low_result
  for (const point of crossAnalysis) {
    if (point.budgetPerCapita > 15000 && point.objectiveComposite < 50) {
      const subInds = getSubIndicatorAvg(residents, point.categoryId)
      const worstInds = getWorstIndicatorsForCategory(point.categoryId, indicators, indicatorMeta, 5)
      const progs = resolvePrograms(point.categoryId, programs, allocations)

      insights.push({
        id: nextId(),
        type: 'high_spend_low_result',
        severity: 'critical',
        categoryId: point.categoryId,
        title: `${point.label}: 予算投入に見合わない成果`,
        summary: `1人あたり${(point.budgetPerCapita / 10000).toFixed(1)}万円の予算を投入（全国平均${(point.nationalBenchmarkPerCapita / 10000).toFixed(1)}万円）していますが、客観指標の平均スコアは${point.objectiveComposite}/100と全国平均を下回っています。${subInds[0] ? `特に「${subInds[0].label}」の住民満足度が${subInds[0].avgScore}/10と低い状況です。` : ''}`,
        keyMetrics: buildKeyMetrics('high_spend_low_result', point, worstInds[0], subInds[0]),
        subIndicators: subInds.slice(0, 4),
        relatedIndicators: worstInds,
        relatedPrograms: progs,
        hypotheses: buildHypotheses('high_spend_low_result', point, worstInds, progs, subInds),
        actionSteps: buildActionSteps('high_spend_low_result', progs, worstInds, subInds),
        estimatedImpact: 8.5,
      })
    }
  }

  // 2. low_spend_high_result
  for (const point of crossAnalysis) {
    if (point.budgetPerCapita < 12000 && point.objectiveComposite > 55) {
      const subInds = getSubIndicatorAvg(residents, point.categoryId)
      const worstInds = getWorstIndicatorsForCategory(point.categoryId, indicators, indicatorMeta, 3)
      const progs = resolvePrograms(point.categoryId, programs, allocations)

      insights.push({
        id: nextId(),
        type: 'low_spend_high_result',
        severity: 'opportunity',
        categoryId: point.categoryId,
        title: `${point.label}: 効率的な成果を実現`,
        summary: `比較的少ない予算（${(point.budgetPerCapita / 10000).toFixed(1)}万円/人、全国平均${(point.nationalBenchmarkPerCapita / 10000).toFixed(1)}万円）で客観スコア${point.objectiveComposite}/100を達成。効率指数${point.efficiency}は高水準です。`,
        keyMetrics: buildKeyMetrics('low_spend_high_result', point, worstInds[0], subInds[0]),
        subIndicators: subInds.slice(0, 4),
        relatedIndicators: worstInds,
        relatedPrograms: progs,
        hypotheses: buildHypotheses('low_spend_high_result', point, worstInds, progs, subInds),
        actionSteps: buildActionSteps('low_spend_high_result', progs, worstInds, subInds),
        estimatedImpact: 6.0,
      })
    }
  }

  // 3. perception_gap
  for (const point of crossAnalysis) {
    if (Math.abs(point.gap) > 12) {
      const subInds = getSubIndicatorAvg(residents, point.categoryId)
      const worstInds = getWorstIndicatorsForCategory(point.categoryId, indicators, indicatorMeta, 3)
      const progs = resolvePrograms(point.categoryId, programs, allocations)
      const direction = point.gap > 0 ? '住民の実感が客観データより高い' : '客観データに比べ住民の満足度が低い'

      insights.push({
        id: nextId(),
        type: 'perception_gap',
        severity: point.gap < 0 ? 'warning' : 'info',
        categoryId: point.categoryId,
        title: `${point.label}: 主観と客観に大きな乖離`,
        summary: `${direction}状況です（乖離${Math.abs(point.gap).toFixed(1)}pt）。${subInds[0] ? `「${subInds[0].label}」の満足度が${subInds[0].avgScore}/10と特に低い傾向です。` : ''}`,
        keyMetrics: buildKeyMetrics('perception_gap', point, worstInds[0], subInds[0]),
        subIndicators: subInds.slice(0, 4),
        relatedIndicators: worstInds,
        relatedPrograms: progs,
        hypotheses: buildHypotheses('perception_gap', point, worstInds, progs, subInds),
        actionSteps: buildActionSteps('perception_gap', progs, worstInds, subInds),
        estimatedImpact: 7.5,
      })
    }
  }

  // 3.5. efficiency_gap — 主観効率と客観効率の乖離
  for (const point of crossAnalysis) {
    const effRatio = point.objectiveEfficiency > 0
      ? point.subjectiveEfficiency / point.objectiveEfficiency
      : 1
    const isSubjHigh = effRatio > 1.5 // 主観効率が客観の1.5倍以上
    const isObjHigh = effRatio < 0.67  // 客観効率が主観の1.5倍以上

    if (isSubjHigh || isObjHigh) {
      const subInds = getSubIndicatorAvg(residents, point.categoryId)
      const worstInds = getWorstIndicatorsForCategory(point.categoryId, indicators, indicatorMeta, 3)
      const progs = resolvePrograms(point.categoryId, programs, allocations)

      const direction = isSubjHigh
        ? `住民満足度（主観効率${point.subjectiveEfficiency.toFixed(1)}）は予算に見合う成果が出ていますが、客観指標（客観効率${point.objectiveEfficiency.toFixed(1)}）には反映されていません`
        : `客観指標（客観効率${point.objectiveEfficiency.toFixed(1)}）は良好ですが、住民の実感（主観効率${point.subjectiveEfficiency.toFixed(1)}）には結びついていません`

      const actionFocus = isSubjHigh
        ? '客観指標の改善に繋がる事業設計（施設整備・制度拡充等）の強化'
        : '住民への成果の見える化（広報・参加型事業）の推進'

      insights.push({
        id: nextId(),
        type: 'efficiency_gap',
        severity: 'warning',
        categoryId: point.categoryId,
        title: `${point.label}: ${isSubjHigh ? '主観に効くが客観に未反映' : '客観は良いが住民実感に未到達'}`,
        summary: `${direction}。予算${(point.budgetPerCapita / 10000).toFixed(1)}万円/人（全国平均${(point.nationalBenchmarkPerCapita / 10000).toFixed(1)}万円）の配分先を見直すことで、${isSubjHigh ? '客観指標' : '住民満足度'}の改善が期待できます。`,
        keyMetrics: [
          {
            label: '主観効率',
            value: point.subjectiveEfficiency.toFixed(1),
            unit: 'pt/万円',
            dataType: '主観',
            severity: point.subjectiveEfficiency > point.nationalEfficiency / 2 ? 'good' : 'bad',
          },
          {
            label: '客観効率',
            value: point.objectiveEfficiency.toFixed(1),
            unit: 'pt/万円',
            dataType: '客観',
            severity: point.objectiveEfficiency > point.nationalEfficiency / 2 ? 'good' : 'bad',
          },
          {
            label: '総合効率',
            value: point.efficiency.toFixed(1),
            unit: 'pt/万円',
            dataType: '予算',
            severity: point.efficiency > point.nationalEfficiency ? 'good' : 'bad',
          },
          {
            label: '全国基準効率',
            value: point.nationalEfficiency.toFixed(1),
            unit: 'pt/万円',
            dataType: '予算',
            severity: 'neutral',
          },
        ],
        subIndicators: subInds.slice(0, 4),
        relatedIndicators: worstInds,
        relatedPrograms: progs,
        hypotheses: [
          {
            statement: isSubjHigh
              ? `住民は${point.label}に一定の満足感を持つが、統計データ（客観指標${point.objectiveComposite}/100）は全国平均に達していない。ソフト事業（啓発・相談等）は住民実感に効果があるが、ハード面（施設・制度）の整備が不十分な可能性がある。`
              : `客観的なデータ（${point.objectiveComposite}/100）は水準にあるが、住民満足度（${point.subjectiveScore.toFixed(1)}/10）が低い。施策の成果が住民に伝わっていない、または住民のニーズと施策のマッチングにずれがある可能性がある。`,
            supportingEvidence: [
              `主観効率: ${point.subjectiveEfficiency.toFixed(1)} / 客観効率: ${point.objectiveEfficiency.toFixed(1)}（${(effRatio).toFixed(1)}倍の差）`,
              subInds[0] ? `最低設問「${subInds[0].label}」: ${subInds[0].avgScore}/10` : '',
              worstInds[0] ? `最低客観指標「${worstInds[0].label}」: ${worstInds[0].score}/100` : '',
            ].filter(Boolean),
            confidence: '高',
          },
        ],
        actionSteps: [
          {
            order: 1,
            action: `${point.label}の予算配分を分析し、${isSubjHigh ? 'ハード事業' : 'ソフト事業・広報'}の比率を検証`,
            expectedOutcome: actionFocus,
            timeframe: '短期',
          },
          ...(progs[0] ? [{
            order: 2,
            action: `「${progs[0].name}」（${(progs[0].budgetAmount / 100_000_000).toFixed(1)}億円）の${isSubjHigh ? '客観指標への寄与度' : '住民接点'}を再評価`,
            targetProgram: progs[0].name,
            expectedOutcome: `${isSubjHigh ? '客観効率' : '主観効率'}の全国基準到達`,
            timeframe: '中期' as const,
          }] : []),
        ],
        estimatedImpact: 7.0,
      })
    }
  }

  // 4. trend_alert
  const decliningIndicators = indicators.filter((v) => v.previousYearScore - v.normalizedScore > 8)

  if (decliningIndicators.length > 0) {
    const topDeclines = [...decliningIndicators]
      .sort((a, b) => (b.previousYearScore - b.normalizedScore) - (a.previousYearScore - a.normalizedScore))
      .slice(0, 5)

    const resolvedDeclines = resolveIndicators(topDeclines.map((d) => d.indicatorId), indicators, indicatorMeta)
    const primaryCatId = indicatorMeta.find((m) => m.id === topDeclines[0].indicatorId)?.relatedCategories[0] ?? 'health'
    const point = crossAnalysis.find((c) => c.categoryId === primaryCatId)
    const subInds = getSubIndicatorAvg(residents, primaryCatId)
    const progs = resolvePrograms(primaryCatId, programs, allocations)

    insights.push({
      id: nextId(),
      type: 'trend_alert',
      severity: 'warning',
      categoryId: primaryCatId,
      title: `${decliningIndicators.length}指標が前年比大幅低下`,
      summary: `${decliningIndicators.length}個の客観指標が前年比8pt以上低下。${resolvedDeclines[0] ? `最大の低下は「${resolvedDeclines[0].label}」（${resolvedDeclines[0].previousYearScore}→${resolvedDeclines[0].score}）。` : ''}早急な原因分析が必要です。`,
      keyMetrics: point ? buildKeyMetrics('trend_alert', point, resolvedDeclines[0], subInds[0]) : [],
      subIndicators: subInds.slice(0, 3),
      relatedIndicators: resolvedDeclines,
      relatedPrograms: progs,
      hypotheses: buildHypotheses('trend_alert', point ?? crossAnalysis[0], resolvedDeclines, progs, subInds),
      actionSteps: buildActionSteps('trend_alert', progs, resolvedDeclines, subInds),
      estimatedImpact: 8.0,
    })
  }

  // 5. regional_disparity (低執行率)
  const fy25 = allocations.filter((b) => b.fiscalYear === '2025')
  const lowExec = fy25.filter((b) => b.executionRate < 75)

  if (lowExec.length > 0) {
    const worst = [...lowExec].sort((a, b) => a.executionRate - b.executionRate).slice(0, 3)
    const primaryProg = programs.find((p) => p.id === worst[0].programId)
    const primaryCatId = primaryProg?.categoryId ?? 'efficacy'
    const point = crossAnalysis.find((c) => c.categoryId === primaryCatId)
    const subInds = getSubIndicatorAvg(residents, primaryCatId)
    const progs = resolvePrograms(primaryCatId, programs, allocations)
    const worstInds = getWorstIndicatorsForCategory(primaryCatId, indicators, indicatorMeta, 3)

    insights.push({
      id: nextId(),
      type: 'regional_disparity',
      severity: 'warning',
      categoryId: primaryCatId,
      title: `${lowExec.length}事業で予算執行率が75%未満`,
      summary: `FY2025の予算執行率が75%を下回る事業が${lowExec.length}件。${primaryProg ? `「${primaryProg.name}」は${worst[0].executionRate}%と最低水準。` : ''}予算の有効活用に課題があります。`,
      keyMetrics: point ? buildKeyMetrics('regional_disparity', point, worstInds[0], subInds[0]) : [],
      subIndicators: subInds.slice(0, 3),
      relatedIndicators: worstInds,
      relatedPrograms: progs,
      hypotheses: buildHypotheses('regional_disparity', point ?? crossAnalysis[0], worstInds, progs, subInds),
      actionSteps: buildActionSteps('regional_disparity', progs, worstInds, subInds),
      estimatedImpact: 7.0,
    })
  }

  const severityOrder: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2, opportunity: 3 }
  return [...insights].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}
