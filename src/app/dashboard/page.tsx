'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { ScoreGauge, MiniGauge } from '@/components/ui/ScoreGauge'
import { StatusBadge, StatusBar } from '@/components/ui/StatusBadge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { IllustrationPanel } from '@/components/ui/IllustrationPanel'
import { WellBeingRadar, TrendLineChart, DistributionBar, DemographicBar, GapChart, QuadrantScatter } from '@/components/charts/dynamic'
import { getResidents } from '@/data/sampleData'
import {
  aggregateCategories,
  getOverallScore,
  getScoreDistribution,
  getRegionBreakdown,
  getAgeBreakdown,
  getRadarData,
} from '@/data/aggregation'
import { getStatusLevel, MONTHLY_TRENDS, getCategoryMeta, STATUS_CONFIG } from '@/data/constants'
import type { CategoryId } from '@/data/types'

function getStatusBorderColor(status: string): string {
  switch (status) {
    case 'excellent':
      return '#0017C1'
    case 'good':
      return '#0031D8'
    case 'neutral':
      return '#757780'
    case 'poor':
    case 'critical':
      return '#D32F2F'
    default:
      return '#757780'
  }
}

type DemoTab = 'region' | 'age'

export default function DashboardPage() {
  const [showAllCategories, setShowAllCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [demoTab, setDemoTab] = useState<DemoTab>('region')

  const residents = getResidents()
  const aggregated = aggregateCategories(residents)
  const overall = getOverallScore(residents)
  const overallStatus = getStatusLevel(overall)
  const radarData = getRadarData(aggregated)
  const distribution = getScoreDistribution(residents)
  const regionData = getRegionBreakdown(residents)
  const ageData = getAgeBreakdown(residents)

  const selectedCat = selectedCategory
    ? aggregated.find((c) => c.id === selectedCategory)
    : null
  const selectedMeta = selectedCategory ? getCategoryMeta(selectedCategory) : null
  const selectedResidentScores = selectedCategory
    ? residents.map((r) => {
        const cat = r.categories.find((c) => c.id === selectedCategory)
        return cat ?? null
      }).filter(Boolean)
    : []

  return (
    <main className="page-enter mx-auto max-w-[1280px] px-5 xl:px-0 py-5 sm:py-6 space-y-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Image src="/icons/search_fill.svg" alt="" width={24} height={24} className="opacity-60" />
        <div>
          <h1 className="text-std-24B-150 text-solid-gray-900">ダッシュボード</h1>
          <p className="text-dns-14N-130 text-solid-gray-500">300人のデータから見る地域Well-Being</p>
        </div>
      </div>

      {/* Overall Score + Radar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center py-8">
            <ScoreGauge
              score={overall}
              size={160}
              strokeWidth={12}
              label="総合スコア"
            />
            <div className="mt-4">
              <IllustrationPanel status={overallStatus} variant="card" />
            </div>
            <div className="mt-4 w-full grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-solid-gray-50 rounded-8">
                <p className="text-dns-14N-130 text-solid-gray-500">回答者</p>
                <p className="text-std-17B-170 text-solid-gray-900">{residents.length}人</p>
              </div>
              <div className="text-center p-3 bg-solid-gray-50 rounded-8">
                <p className="text-dns-14N-130 text-solid-gray-500">地域数</p>
                <p className="text-std-17B-170 text-solid-gray-900">7地域</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">カテゴリ別 主観 vs 客観</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">6つのWell-Being指標の全体像</p>
          </CardHeader>
          <CardBody>
            <WellBeingRadar data={radarData} height={320} />
          </CardBody>
        </Card>
      </section>

      {/* Callout: 客観データの説明 */}
      <section>
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-8 p-4 flex items-start gap-3">
          <Image src="/icons/information_fill.svg" alt="" width={20} height={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-std-16B-170 text-blue-900 mb-1">客観データとは？</p>
            <p className="text-dns-14N-130 text-solid-gray-700 leading-relaxed">
              人口動態・施設数・犯罪率等の統計データから算出した指標です。
              住民アンケートの実感（主観）と組み合わせて分析しています。
            </p>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-std-17B-170 text-solid-gray-900">カテゴリ別スコア</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregated.map((cat) => {
            const avg = (cat.avgSubjective + cat.avgObjective) / 2
            const status = getStatusLevel(avg)
            const borderColor = getStatusBorderColor(status)
            const isSelected = selectedCategory === cat.id

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className="text-left w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500 rounded-8"
              >
                <Card
                  accent={borderColor}
                  className={`transition-shadow duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-900 ring-offset-2' : ''}`}
                >
                  <CardBody className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <CategoryIcon categoryId={cat.id} showLabel />
                      <MiniGauge score={avg} />
                    </div>
                    <div className="space-y-2">
                      <StatusBar
                        value={cat.avgSubjective}
                        color="#E8854A"
                        label="主観（住民実感）"
                        height={6}
                      />
                      <StatusBar
                        value={cat.avgObjective}
                        color="#0031D8"
                        label="客観（統計データ）"
                        height={6}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <StatusBadge status={status} size="sm" />
                      <span className={`text-oln-14B-100 ${cat.gap >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        ギャップ: {cat.gap > 0 ? '+' : ''}{cat.gap.toFixed(1)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </button>
            )
          })}
        </div>
      </section>

      {/* Selected Category Detail */}
      {selectedCat && selectedMeta && (
        <section>
          <Card accent={selectedMeta.color}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CategoryIcon categoryId={selectedCat.id} size={28} />
                <div>
                  <h2 className="text-std-17B-170 text-solid-gray-900">{selectedMeta.label} - 詳細</h2>
                  <p className="text-dns-14N-130 text-solid-gray-500">{selectedMeta.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div>
                <h3 className="text-std-16B-170 text-solid-gray-900 mb-3">質問別スコア</h3>
                <div className="space-y-3">
                  {(() => {
                    const subScores = selectedMeta.subIndicatorLabels.map((label, i) => {
                      const scores = selectedResidentScores
                        .map((cat) => cat?.subIndicators[i]?.score ?? 0)
                      const avg = scores.length > 0
                        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
                        : 0
                      return { label, avg }
                    })
                    const sorted = [...subScores].sort((a, b) => b.avg - a.avg)
                    const highest = sorted[0]
                    const lowest = sorted[sorted.length - 1]
                    return (
                      <>
                        {subScores.map(({ label, avg }) => {
                          const isHighest = label === highest.label
                          const isLowest = label === lowest.label
                          return (
                            <div key={label}>
                              <div className="flex items-center gap-2 mb-1">
                                {isHighest && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-4 bg-blue-100 text-blue-900">最高</span>
                                )}
                                {isLowest && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-4 bg-red-100 text-red-900">最低</span>
                                )}
                              </div>
                              <StatusBar
                                value={avg}
                                color={isLowest ? '#D32F2F' : isHighest ? '#0031D8' : selectedMeta.color}
                                label={label}
                                height={10}
                              />
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-dns-14N-130 text-solid-gray-600">
                    主観スコア <span className="font-bold" style={{ color: '#E8854A' }}>{selectedCat.avgSubjective.toFixed(1)}</span> /
                    客観スコア <span className="font-bold" style={{ color: '#0031D8' }}>{selectedCat.avgObjective.toFixed(1)}</span>
                  </p>
                  <p className="text-dns-14N-130 text-solid-gray-500 mt-1">
                    {Math.abs(selectedCat.gap) > 0.3
                      ? selectedCat.gap > 0
                        ? `乖離 +${selectedCat.gap.toFixed(1)}pt：住民は実感しているが、客観データでは不足`
                        : `乖離 ${selectedCat.gap.toFixed(1)}pt：客観データでは充実しているが、住民は実感できていない`
                      : `乖離 ${selectedCat.gap.toFixed(1)}pt：主観と客観のバランスが取れています`}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {/* 4-Quadrant Scatter + Gap Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">主観-客観 4象限マップ</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              住民アンケート平均値と統計データの関係性をプロット
            </p>
          </CardHeader>
          <CardBody>
            <QuadrantScatter data={aggregated} height={320} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">主観-客観ギャップ分析</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">各カテゴリの主観・客観スコア比較（棒グラフ）</p>
          </CardHeader>
          <CardBody>
            <GapChart data={aggregated} height={280} />
          </CardBody>
        </Card>
      </section>

      {/* Trend */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-std-17B-170 text-solid-gray-900">スコアトレンド推移</h2>
                <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
                  住民アンケート回答者の月別平均スコア（主観+客観の総合値）
                </p>
              </div>
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-oln-14B-100 text-blue-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500 rounded-4 px-2 py-1"
              >
                {showAllCategories ? '総合のみ' : 'カテゴリ別も表示'}
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <TrendLineChart
              data={MONTHLY_TRENDS}
              height={300}
              showCategories={showAllCategories}
            />
          </CardBody>
        </Card>
      </section>

      {/* Distribution + Demographics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">スコア分布</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">300人の総合スコア分布</p>
          </CardHeader>
          <CardBody>
            <DistributionBar data={distribution} height={220} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-std-17B-170 text-solid-gray-900">デモグラフィック別</h2>
                <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">属性ごとの平均スコア</p>
              </div>
              <div className="flex gap-1">
                {([
                  { key: 'region', label: '地域' },
                  { key: 'age', label: '年代' },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDemoTab(tab.key)}
                    className={`px-3 py-1 rounded-4 text-oln-14B-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500 ${
                      demoTab === tab.key
                        ? 'bg-blue-900 text-white'
                        : 'bg-solid-gray-50 text-solid-gray-600 hover:bg-solid-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {demoTab === 'region' && (
              <DemographicBar data={regionData} height={220} color="#0031D8" />
            )}
            {demoTab === 'age' && (
              <DemographicBar data={ageData} height={220} color="#E8854A" />
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  )
}
