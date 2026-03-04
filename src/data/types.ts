export type Gender = '男性' | '女性' | 'その他'

export type AgeGroup = '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+'

export type Region = '御坊市' | '日高町' | 'みなべ町' | '印南町' | '由良町' | '美浜町' | '日高川町'

export type Employment =
  | '正社員'
  | '自営業'
  | 'パート・アルバイト'
  | '学生'
  | '退職'
  | '求職中'
  | '主婦・主夫'

export type CategoryId =
  | 'health'
  | 'community'
  | 'diversity'
  | 'childcare'
  | 'efficacy'
  | 'transport'

export type StatusLevel =
  | 'excellent'
  | 'good'
  | 'neutral'
  | 'poor'
  | 'critical'

export interface SubIndicator {
  readonly id: string
  readonly label: string
  readonly score: number
}

export interface CategoryScore {
  readonly id: CategoryId
  readonly label: string
  readonly subjectiveScore: number
  readonly objectiveScore: number
  readonly subIndicators: readonly SubIndicator[]
}

export interface Resident {
  readonly id: string
  readonly age: number
  readonly ageGroup: AgeGroup
  readonly gender: Gender
  readonly region: Region
  readonly employment: Employment
  readonly categories: readonly CategoryScore[]
  readonly overallScore: number
}

export interface CategoryMeta {
  readonly id: CategoryId
  readonly label: string
  readonly icon: string
  readonly description: string
  readonly subIndicatorLabels: readonly string[]
  readonly color: string
}

export interface AggregatedCategory {
  readonly id: CategoryId
  readonly label: string
  readonly avgSubjective: number
  readonly avgObjective: number
  readonly gap: number
  readonly status: StatusLevel
  readonly trend: number
}

export interface DemographicBreakdown {
  readonly label: string
  readonly count: number
  readonly avgScore: number
}

export interface InsightRecommendation {
  readonly id: string
  readonly priority: '最優先' | '要注目' | '機会'
  readonly category: CategoryId
  readonly title: string
  readonly fact: string
  readonly soWhat: string
  readonly nowWhat: string
  readonly impact: number
  readonly gap: number
  readonly budgetPerPerson: number
}

export interface MonthlyTrend {
  readonly month: string
  readonly health: number
  readonly community: number
  readonly diversity: number
  readonly childcare: number
  readonly efficacy: number
  readonly transport: number
  readonly overall: number
}

// ===== 客観指標ドメインモデル =====

export type ObjectiveDomainId =
  | 'livingEnvironment'
  | 'regionalRelations'
  | 'authenticLiving'

export type ObjectiveSubDomainId = string

export interface ObjectiveIndicatorMeta {
  readonly id: string
  readonly domainId: ObjectiveDomainId
  readonly subDomainId: ObjectiveSubDomainId
  readonly label: string
  readonly unit: string
  readonly description: string
  readonly source: string
  readonly higherIsBetter: boolean
  readonly relatedCategories: readonly CategoryId[]
}

export interface ObjectiveIndicatorValue {
  readonly indicatorId: string
  readonly rawValue: number
  readonly normalizedScore: number
  readonly nationalAverage: number
  readonly prefectureAverage: number
  readonly previousYearScore: number
  readonly rank: number
  readonly totalMunicipalities: number
}

export interface ObjectiveSubDomainMeta {
  readonly id: ObjectiveSubDomainId
  readonly label: string
  readonly indicatorIds: readonly string[]
}

export interface ObjectiveDomainMeta {
  readonly id: ObjectiveDomainId
  readonly label: string
  readonly description: string
  readonly color: string
  readonly icon: string
  readonly subDomains: readonly ObjectiveSubDomainMeta[]
}

// ===== 予算データモデル =====

export type FiscalYear = '2021' | '2022' | '2023' | '2024' | '2025'

export interface BudgetProgram {
  readonly id: string
  readonly name: string
  readonly categoryId: CategoryId
  readonly domainId: ObjectiveDomainId
  readonly relatedIndicatorIds: readonly string[]
  readonly description: string
}

export interface BudgetAllocation {
  readonly programId: string
  readonly fiscalYear: FiscalYear
  readonly budgetAmount: number
  readonly executedAmount: number
  readonly executionRate: number
  readonly previousYearBudget: number
  readonly changeRate: number
}

export interface CategoryBudgetSummary {
  readonly categoryId: CategoryId
  readonly totalBudget: number
  readonly totalExecuted: number
  readonly executionRate: number
  readonly programCount: number
  readonly budgetPerCapita: number
  readonly yearOverYearChange: number
}

// ===== クロス分析モデル =====

export interface CrossAnalysisPoint {
  readonly categoryId: CategoryId
  readonly label: string
  readonly subjectiveScore: number
  readonly objectiveComposite: number
  readonly budgetPerCapita: number
  readonly nationalBenchmarkPerCapita: number
  readonly executionRate: number
  readonly gap: number
  readonly efficiency: number
  readonly subjectiveEfficiency: number
  readonly objectiveEfficiency: number
  readonly nationalEfficiency: number
}

export type InsightType =
  | 'high_spend_low_result'
  | 'low_spend_high_result'
  | 'perception_gap'
  | 'efficiency_gap'
  | 'trend_alert'
  | 'regional_disparity'

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'opportunity'

export interface EfficiencyInsight {
  readonly id: string
  readonly type: InsightType
  readonly severity: InsightSeverity
  readonly categoryId: CategoryId
  readonly title: string
  readonly description: string
  readonly evidence: readonly string[]
  readonly recommendation: string
  readonly estimatedImpact: number
  readonly relatedIndicators: readonly string[]
  readonly relatedPrograms: readonly string[]
}

// ===== 強化版インサイトモデル =====

export type DataSourceType = '主観' | '客観' | '予算'

export interface IndicatorDetail {
  readonly id: string
  readonly label: string
  readonly score: number
  readonly nationalAverage: number
  readonly previousYearScore: number
  readonly trend: number
  readonly rank: number
  readonly totalMunicipalities: number
}

export interface ProgramDetail {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly budgetAmount: number
  readonly executedAmount: number
  readonly executionRate: number
  readonly changeRate: number
}

export interface SubIndicatorSummary {
  readonly label: string
  readonly avgScore: number
  readonly rank: number
  readonly deviation: number
}

export interface KeyMetric {
  readonly label: string
  readonly value: string
  readonly unit: string
  readonly dataType: DataSourceType
  readonly severity?: 'good' | 'neutral' | 'bad'
  readonly trend?: { readonly direction: 'up' | 'down' | 'flat'; readonly value: string }
}

export interface InsightHypothesis {
  readonly statement: string
  readonly supportingEvidence: readonly string[]
  readonly confidence: '高' | '中' | '低'
}

export type ActionTimeframe = '即座' | '短期' | '中期'

export interface ActionStep {
  readonly order: number
  readonly action: string
  readonly targetProgram?: string
  readonly expectedOutcome: string
  readonly timeframe: ActionTimeframe
}

export interface EnhancedInsight {
  readonly id: string
  readonly type: InsightType
  readonly severity: InsightSeverity
  readonly categoryId: CategoryId
  readonly title: string
  readonly summary: string
  readonly keyMetrics: readonly KeyMetric[]
  readonly subIndicators: readonly SubIndicatorSummary[]
  readonly relatedIndicators: readonly IndicatorDetail[]
  readonly relatedPrograms: readonly ProgramDetail[]
  readonly hypotheses: readonly InsightHypothesis[]
  readonly actionSteps: readonly ActionStep[]
  readonly estimatedImpact: number
}
