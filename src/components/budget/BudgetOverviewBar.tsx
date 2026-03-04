import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import type { WBBudgetRatio } from '@/data/budgetPageHelpers'
import type { BudgetFlowSummary } from '@/data/budgetFlowData'

interface BudgetOverviewBarProps {
  readonly wbRatio: WBBudgetRatio
  readonly executionRate: number
  readonly avgChangeRate: number
  readonly flowData: BudgetFlowSummary
}

function formatOku(yen: number): string {
  return (yen / 100_000_000).toFixed(0)
}

function formatOkuDetail(yen: number): { integer: string; remainder: string } {
  const oku = Math.floor(yen / 100_000_000)
  const man = Math.round((yen % 100_000_000) / 10_000)
  return { integer: String(oku), remainder: man.toLocaleString() }
}

export function BudgetOverviewBar({ wbRatio, executionRate, avgChangeRate, flowData }: BudgetOverviewBarProps) {
  const revenue = formatOkuDetail(flowData.totalRevenue)
  const expenditure = formatOkuDetail(flowData.totalExpenditure)
  const balance = formatOkuDetail(Math.abs(flowData.balance))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-std-20B-160 text-solid-gray-900">歳出構成とWell-Being予算</h2>
          <span className="text-dns-14N-130 text-solid-gray-500">FY{flowData.fiscalYear}</span>
        </div>
        <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
          一般会計の全体像と、Well-Being関連予算の位置づけ
        </p>
      </CardHeader>
      <CardBody>
        {/* Revenue / Expenditure / Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-solid-gray-200 rounded-2xl p-4">
            <p className="text-dns-14N-130 text-green-900 mb-1">歳入総額</p>
            <p className="text-solid-gray-900">
              <span className="text-std-24B-150">{revenue.integer}</span>
              <span className="text-std-17B-170">億</span>
              <span className="text-std-24B-150">{revenue.remainder}</span>
              <span className="text-dns-14N-130 text-solid-gray-500">万円</span>
            </p>
          </div>
          <div className="border-2 border-solid-gray-200 rounded-2xl p-4">
            <p className="text-dns-14N-130 text-red-900 mb-1">歳出総額</p>
            <p className="text-solid-gray-900">
              <span className="text-std-24B-150">{expenditure.integer}</span>
              <span className="text-std-17B-170">億</span>
              <span className="text-std-24B-150">{expenditure.remainder}</span>
              <span className="text-dns-14N-130 text-solid-gray-500">万円</span>
            </p>
          </div>
          <div className={`border-2 rounded-2xl p-4 ${flowData.balance >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <p className={`text-dns-14N-130 mb-1 ${flowData.balance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              収支{flowData.balance >= 0 ? '（黒字）' : '（赤字）'}
            </p>
            <p className={flowData.balance >= 0 ? 'text-green-900' : 'text-red-900'}>
              {flowData.balance < 0 && (
                <span className="text-std-17B-170 mr-0.5">▼</span>
              )}
              <span className="text-std-24B-150">{balance.integer}</span>
              <span className="text-std-17B-170">億</span>
              <span className="text-std-24B-150">{balance.remainder}</span>
              <span className="text-dns-14N-130">万円</span>
            </p>
          </div>
        </div>

        {/* WB Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-2xl bg-solid-gray-50">
            <p className="text-dns-14N-130 text-solid-gray-500 mb-1">Well-Being関連予算</p>
            <p className="text-std-24B-150 text-blue-900">
              {formatOku(wbRatio.wbTotal)}
              <span className="text-dns-14N-130 text-solid-gray-500">億円</span>
            </p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-solid-gray-50">
            <p className="text-dns-14N-130 text-solid-gray-500 mb-1">Well-Being比率</p>
            <p className="text-std-24B-150 text-cyan-900">
              {wbRatio.wbRatio}
              <span className="text-dns-14N-130 text-solid-gray-500">%</span>
            </p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-solid-gray-50">
            <p className="text-dns-14N-130 text-solid-gray-500 mb-1">執行率</p>
            <p className={`text-std-24B-150 ${executionRate >= 85 ? 'text-green-900' : 'text-orange-800'}`}>
              {executionRate}
              <span className="text-dns-14N-130 text-solid-gray-500">%</span>
            </p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-solid-gray-50">
            <p className="text-dns-14N-130 text-solid-gray-500 mb-1">前年比</p>
            <p className={`text-std-24B-150 ${avgChangeRate >= 0 ? 'text-cyan-900' : 'text-red-900'}`}>
              {avgChangeRate > 0 ? '+' : ''}{avgChangeRate}
              <span className="text-dns-14N-130 text-solid-gray-500">%</span>
            </p>
          </div>
        </div>

        {/* WB Proportion Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-dns-14N-130 text-solid-gray-600">
              歳出総額に占めるWell-Being関連予算
            </span>
            <span className="text-oln-14B-100 text-blue-900">{wbRatio.wbRatio}%</span>
          </div>
          <div className="w-full h-6 rounded-8 bg-solid-gray-100 overflow-hidden flex">
            <div
              className="h-full rounded-l-8 flex items-center justify-center transition-all duration-500"
              style={{
                width: `${wbRatio.wbRatio}%`,
                backgroundColor: '#0017C1',
                minWidth: wbRatio.wbRatio > 10 ? undefined : '60px',
              }}
            >
              <span className="text-[10px] font-bold text-white">
                Well-Being {formatOku(wbRatio.wbTotal)}億
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] font-bold text-solid-gray-500">
                その他 {formatOku(wbRatio.nonWbTotal)}億
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
