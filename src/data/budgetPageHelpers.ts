import type {
  CategoryId,
  BudgetProgram,
  BudgetAllocation,
  CategoryBudgetSummary,
  CrossAnalysisPoint,
  FiscalYear,
} from './types'
import { EXPENDITURE_CATEGORIES, type BudgetFlowSummary } from './budgetFlowData'
import { CATEGORIES } from './constants'

// ===== WB Budget Ratio =====

export interface WBBudgetRatio {
  readonly wbTotal: number
  readonly nonWbTotal: number
  readonly wbRatio: number
  readonly totalExpenditure: number
}

export function getWellBeingBudgetRatio(flowData: BudgetFlowSummary): WBBudgetRatio {
  const wbTotal = flowData.wellBeingAllocation.reduce((sum, a) => sum + a.amount, 0)
  return {
    wbTotal,
    nonWbTotal: flowData.totalExpenditure - wbTotal,
    wbRatio: flowData.totalExpenditure > 0
      ? Math.round((wbTotal / flowData.totalExpenditure) * 1000) / 10
      : 0,
    totalExpenditure: flowData.totalExpenditure,
  }
}

// ===== Expenditure → WB Mapping =====

export interface ExpenditureToWBFlow {
  readonly expenditureLabel: string
  readonly expenditureAmount: number
  readonly expenditureRatio: number
  readonly expenditureColor: string
  readonly mappings: readonly {
    readonly wbCategoryId: CategoryId
    readonly wbLabel: string
    readonly ratio: number
    readonly amount: number
  }[]
  readonly isWbMapped: boolean
}

export function getExpenditureToWBMapping(flowData: BudgetFlowSummary): readonly ExpenditureToWBFlow[] {
  return flowData.expenditureItems
    .map((item) => {
      const meta = EXPENDITURE_CATEGORIES.find((c) => c.id === item.categoryId)
      if (!meta) return null

      const mappings = meta.wellBeingMapping.map((m) => {
        const catMeta = CATEGORIES.find((c) => c.id === m.categoryId)
        return {
          wbCategoryId: m.categoryId,
          wbLabel: catMeta?.label ?? m.categoryId,
          ratio: m.ratio,
          amount: Math.round(item.amount * m.ratio),
        }
      })

      return {
        expenditureLabel: meta.label,
        expenditureAmount: item.amount,
        expenditureRatio: item.ratio,
        expenditureColor: meta.color,
        mappings,
        isWbMapped: mappings.length > 0,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.expenditureAmount - a.expenditureAmount) as readonly ExpenditureToWBFlow[]
}

// ===== Category Pipeline Data =====

export interface CategoryPipelineData {
  readonly categoryId: CategoryId
  readonly label: string
  readonly color: string
  readonly totalBudget: number
  readonly budgetPerCapita: number
  readonly yearOverYearChange: number
  readonly totalExecuted: number
  readonly executionRate: number
  readonly objectiveComposite: number
  readonly subjectiveScore: number
  readonly gap: number
  readonly efficiency: number
  readonly programCount: number
  readonly programs: readonly {
    readonly name: string
    readonly budgetAmount: number
    readonly executionRate: number
    readonly changeRate: number
  }[]
}

export type PipelineSortKey = 'efficiency' | 'budget' | 'subjective'

export function getCategoryPipelineData(
  crossAnalysis: readonly CrossAnalysisPoint[],
  budgetSummaries: readonly CategoryBudgetSummary[],
  allPrograms: readonly BudgetProgram[],
  allocations: readonly BudgetAllocation[],
  fiscalYear: FiscalYear,
): readonly CategoryPipelineData[] {
  const yearAllocations = allocations.filter((a) => a.fiscalYear === fiscalYear)

  return CATEGORIES.map((cat) => {
    const cross = crossAnalysis.find((c) => c.categoryId === cat.id)
    const summary = budgetSummaries.find((s) => s.categoryId === cat.id)
    const catPrograms = allPrograms.filter((p) => p.categoryId === cat.id)

    const programs = catPrograms
      .map((prog) => {
        const alloc = yearAllocations.find((a) => a.programId === prog.id)
        if (!alloc) return null
        return {
          name: prog.name,
          budgetAmount: alloc.budgetAmount,
          executionRate: alloc.executionRate,
          changeRate: alloc.changeRate,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.budgetAmount - a.budgetAmount)

    return {
      categoryId: cat.id,
      label: cat.label,
      color: cat.color,
      totalBudget: summary?.totalBudget ?? 0,
      budgetPerCapita: summary?.budgetPerCapita ?? 0,
      yearOverYearChange: summary?.yearOverYearChange ?? 0,
      totalExecuted: summary?.totalExecuted ?? 0,
      executionRate: summary?.executionRate ?? 0,
      objectiveComposite: cross?.objectiveComposite ?? 50,
      subjectiveScore: cross?.subjectiveScore ?? 5,
      gap: cross?.gap ?? 0,
      efficiency: cross?.efficiency ?? 0,
      programCount: catPrograms.length,
      programs,
    }
  })
}

export function sortPipelineData(
  data: readonly CategoryPipelineData[],
  sortKey: PipelineSortKey,
): readonly CategoryPipelineData[] {
  const sorted = [...data]
  switch (sortKey) {
    case 'efficiency':
      return sorted.sort((a, b) => b.efficiency - a.efficiency)
    case 'budget':
      return sorted.sort((a, b) => b.totalBudget - a.totalBudget)
    case 'subjective':
      return sorted.sort((a, b) => b.subjectiveScore - a.subjectiveScore)
  }
}

export function getEfficiencyBadge(data: CategoryPipelineData): {
  readonly label: string
  readonly className: string
} {
  if (data.budgetPerCapita > 15000 && data.objectiveComposite < 50) {
    return { label: '要改善', className: 'bg-red-100 text-red-900' }
  }
  if (data.budgetPerCapita < 12000 && data.objectiveComposite > 55) {
    return { label: '高効率', className: 'bg-cyan-100 text-cyan-900' }
  }
  return { label: '標準', className: 'bg-solid-gray-100 text-solid-gray-600' }
}
