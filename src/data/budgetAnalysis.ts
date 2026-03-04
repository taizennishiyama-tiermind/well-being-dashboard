import type {
  BudgetAllocation,
  BudgetProgram,
  CategoryId,
  CategoryBudgetSummary,
  FiscalYear,
} from './types'
import { CATEGORIES } from './constants'

export function getCategoryBudgetSummaries(
  allocations: readonly BudgetAllocation[],
  programs: readonly BudgetProgram[],
  populationCount: number,
  fiscalYear: FiscalYear = '2025',
): readonly CategoryBudgetSummary[] {
  const allYears: FiscalYear[] = ['2021', '2022', '2023', '2024', '2025']
  const currentIdx = allYears.indexOf(fiscalYear)
  const prevYear = currentIdx > 0 ? allYears[currentIdx - 1] : null

  const fy25 = allocations.filter((a) => a.fiscalYear === fiscalYear)
  const fy24 = prevYear ? allocations.filter((a) => a.fiscalYear === prevYear) : []

  return CATEGORIES.map((cat) => {
    const catPrograms = programs.filter((p) => p.categoryId === cat.id)
    const catProgramIds = new Set(catPrograms.map((p) => p.id))

    const catAllocations = fy25.filter((a) => catProgramIds.has(a.programId))
    const catPrevAllocations = fy24.filter((a) => catProgramIds.has(a.programId))

    const totalBudget = catAllocations.reduce((sum, a) => sum + a.budgetAmount, 0)
    const totalExecuted = catAllocations.reduce((sum, a) => sum + a.executedAmount, 0)
    const prevTotalBudget = catPrevAllocations.reduce((sum, a) => sum + a.budgetAmount, 0)

    const executionRate = totalBudget > 0
      ? Math.round((totalExecuted / totalBudget) * 1000) / 10
      : 0

    const yearOverYearChange = prevTotalBudget > 0
      ? Math.round(((totalBudget - prevTotalBudget) / prevTotalBudget) * 1000) / 10
      : 0

    const budgetPerCapita = populationCount > 0
      ? Math.round(totalBudget / populationCount)
      : 0

    return {
      categoryId: cat.id,
      totalBudget,
      totalExecuted,
      executionRate,
      programCount: catPrograms.length,
      budgetPerCapita,
      yearOverYearChange,
    }
  })
}

export function getBudgetTrendByCategory(
  allocations: readonly BudgetAllocation[],
  programs: readonly BudgetProgram[],
): Record<CategoryId, readonly { readonly year: FiscalYear; readonly budget: number; readonly executed: number }[]> {
  const result: Record<string, { year: FiscalYear; budget: number; executed: number }[]> = {}

  for (const cat of CATEGORIES) {
    const catProgramIds = new Set(
      programs.filter((p) => p.categoryId === cat.id).map((p) => p.id)
    )

    const years: FiscalYear[] = ['2021', '2022', '2023', '2024', '2025']
    result[cat.id] = years.map((year) => {
      const yearAllocations = allocations.filter(
        (a) => a.fiscalYear === year && catProgramIds.has(a.programId)
      )
      return {
        year,
        budget: yearAllocations.reduce((sum, a) => sum + a.budgetAmount, 0),
        executed: yearAllocations.reduce((sum, a) => sum + a.executedAmount, 0),
      }
    })
  }

  return result as Record<CategoryId, readonly { readonly year: FiscalYear; readonly budget: number; readonly executed: number }[]>
}

export function getProgramRanking(
  allocations: readonly BudgetAllocation[],
  programs: readonly BudgetProgram[],
  sortBy: 'budget' | 'execution' | 'change' = 'budget',
  fiscalYear: FiscalYear = '2025',
): readonly { readonly program: BudgetProgram; readonly allocation: BudgetAllocation }[] {
  const yearAllocations = allocations.filter((a) => a.fiscalYear === fiscalYear)

  const paired = programs
    .map((program) => {
      const allocation = yearAllocations.find((a) => a.programId === program.id)
      return allocation ? { program, allocation } : null
    })
    .filter((item): item is { program: BudgetProgram; allocation: BudgetAllocation } => item !== null)

  const sorted = [...paired]
  switch (sortBy) {
    case 'budget':
      sorted.sort((a, b) => b.allocation.budgetAmount - a.allocation.budgetAmount)
      break
    case 'execution':
      sorted.sort((a, b) => a.allocation.executionRate - b.allocation.executionRate)
      break
    case 'change':
      sorted.sort((a, b) => b.allocation.changeRate - a.allocation.changeRate)
      break
  }

  return sorted
}

export function getOverallBudgetStats(
  allocations: readonly BudgetAllocation[],
  fiscalYear: FiscalYear = '2025',
): {
  readonly totalBudget: number
  readonly totalExecuted: number
  readonly executionRate: number
  readonly programCount: number
  readonly avgChangeRate: number
} {
  const yearAllocations = allocations.filter((a) => a.fiscalYear === fiscalYear)
  const totalBudget = yearAllocations.reduce((sum, a) => sum + a.budgetAmount, 0)
  const totalExecuted = yearAllocations.reduce((sum, a) => sum + a.executedAmount, 0)
  const executionRate = totalBudget > 0
    ? Math.round((totalExecuted / totalBudget) * 1000) / 10
    : 0
  const avgChangeRate = yearAllocations.length > 0
    ? Math.round((yearAllocations.reduce((sum, a) => sum + a.changeRate, 0) / yearAllocations.length) * 10) / 10
    : 0

  return {
    totalBudget,
    totalExecuted,
    executionRate,
    programCount: yearAllocations.length,
    avgChangeRate,
  }
}
