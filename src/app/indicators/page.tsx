'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatusBar } from '@/components/ui/StatusBadge'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import { IndicatorHeatmap, IndicatorComparisonBar } from '@/components/charts/dynamic'
import { OBJECTIVE_DOMAINS, OBJECTIVE_INDICATORS, getIndicatorsByDomain, getIndicatorMeta } from '@/data/objectiveIndicators'
import { getObjectiveIndicatorValues, getIndicatorValue, getDomainAverageScore } from '@/data/objectiveData'
import { BUDGET_PROGRAMS } from '@/data/budgetData'
import { CATEGORIES } from '@/data/constants'
import type { ObjectiveDomainId } from '@/data/types'

export default function IndicatorsPage() {
  const [selectedDomain, setSelectedDomain] = useState<ObjectiveDomainId>('livingEnvironment')
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null)

  const allValues = getObjectiveIndicatorValues()
  const domain = OBJECTIVE_DOMAINS.find((d) => d.id === selectedDomain)!
  const domainIndicators = getIndicatorsByDomain(selectedDomain)
  const domainValues = allValues.filter((v) =>
    domainIndicators.some((i) => i.id === v.indicatorId)
  )
  const domainAvg = getDomainAverageScore(selectedDomain)

  // トップ/ボトム指標
  const sortedByScore = [...domainValues].sort((a, b) => b.normalizedScore - a.normalizedScore)
  const topIndicators = sortedByScore.slice(0, 3)
  const bottomIndicators = sortedByScore.slice(-3).reverse()

  // 選択された指標の詳細
  const selectedMeta = selectedIndicatorId ? getIndicatorMeta(selectedIndicatorId) : null
  const selectedValue = selectedIndicatorId ? getIndicatorValue(selectedIndicatorId) : null
  const relatedPrograms = selectedMeta
    ? BUDGET_PROGRAMS.filter((p) => p.relatedIndicatorIds.includes(selectedMeta.id))
    : []
  const relatedCategories = selectedMeta
    ? selectedMeta.relatedCategories.map((cId) => CATEGORIES.find((c) => c.id === cId)).filter(Boolean)
    : []

  return (
    <main className="page-enter mx-auto max-w-[1280px] px-5 xl:px-0 py-5 sm:py-6 space-y-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Image src="/icons/information_fill.svg" alt="" width={24} height={24} className="opacity-60" />
        <div>
          <h1 className="text-std-24B-150 text-solid-gray-900">客観指標データ</h1>
          <p className="text-dns-14N-130 text-solid-gray-500">
            {OBJECTIVE_INDICATORS.length}指標の詳細分析 - 全国・県との比較
          </p>
        </div>
      </div>

      {/* Domain Selector — Card-based 3-column */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {OBJECTIVE_DOMAINS.map((d) => {
          const isActive = d.id === selectedDomain
          const avg = getDomainAverageScore(d.id)
          const indicatorCount = getIndicatorsByDomain(d.id).length

          return (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDomain(d.id)
                setSelectedIndicatorId(null)
              }}
              className={`
                relative text-left w-full rounded-2xl border-2 overflow-hidden transition-all
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500
                ${isActive
                  ? 'bg-white shadow-lg border-transparent'
                  : 'bg-white/60 hover:bg-white border-transparent hover:shadow-md'
                }
              `}
            >
              {/* Color bar at top */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: isActive ? d.color : '#D9DCE2' }}
              />
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Image src={`/icons/${d.icon}`} alt="" width={20} height={20} className="opacity-70" />
                  <p className={`text-std-16B-170 ${isActive ? '' : 'text-solid-gray-900'}`} style={isActive ? { color: d.color } : {}}>
                    {d.label}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dns-14N-130 text-solid-gray-500">
                    {indicatorCount}指標
                  </span>
                  <span className="text-std-17B-170" style={{ color: isActive ? d.color : '#4A4C56' }}>
                    {avg}<span className="text-dns-14N-130 text-solid-gray-400">/100</span>
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Domain Summary — Row 1: Score + National Comparison */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardBody className="flex flex-col items-center py-6">
              <ScoreGauge
                score={domainAvg / 10}
                size={120}
                strokeWidth={10}
                label="ドメイン平均"
              />
              <p className="text-std-24B-150 mt-2" style={{ color: domain.color }}>
                {domainAvg}
                <span className="text-dns-14N-130 text-solid-gray-500">/100</span>
              </p>
              <p className="text-dns-14N-130 text-solid-gray-500 mt-1">
                {domainIndicators.length}指標
              </p>
            </CardBody>
          </Card>

          {/* National Comparison Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-std-16B-170 text-solid-gray-900">全国比較</h3>
            </CardHeader>
            <CardBody>
              {(() => {
                const SAME_LEVEL_THRESHOLD = 3
                const above = domainValues.filter((v) => v.normalizedScore > v.nationalAverage + SAME_LEVEL_THRESHOLD).length
                const below = domainValues.filter((v) => v.normalizedScore < v.nationalAverage - SAME_LEVEL_THRESHOLD).length
                const sameLevel = domainValues.length - above - below
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-dns-14N-130 text-blue-900">全国平均以上</span>
                        <span className="text-oln-14B-100 text-blue-900">{above}指標</span>
                      </div>
                      <StatusBar value={above} color="#264AF4" height={6} max={domainValues.length} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-dns-14N-130 text-solid-gray-500">同水準（±3pt）</span>
                        <span className="text-oln-14B-100 text-solid-gray-500">{sameLevel}指標</span>
                      </div>
                      <StatusBar value={sameLevel} color="#D4920B" height={6} max={domainValues.length} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-dns-14N-130 text-red-900">全国平均以下</span>
                        <span className="text-oln-14B-100 text-red-900">{below}指標</span>
                      </div>
                      <StatusBar value={below} color="#D32F2F" height={6} max={domainValues.length} />
                    </div>
                  </div>
                )
              })()}
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Top + Bottom Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top Indicators */}
          <Card>
            <CardHeader>
              <h3 className="text-std-16B-170 text-blue-900">強み（上位3）</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              {topIndicators.map((v) => {
                const meta = getIndicatorMeta(v.indicatorId)
                const diff = v.normalizedScore - v.nationalAverage
                return (
                  <button
                    key={v.indicatorId}
                    onClick={() => setSelectedIndicatorId(v.indicatorId)}
                    className="w-full text-left hover:bg-solid-gray-50 rounded-4 px-3 py-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-dns-14N-130 text-solid-gray-700 truncate mr-2">
                        {meta?.label ?? v.indicatorId}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-oln-14B-100 text-blue-900">
                          {v.normalizedScore}
                        </span>
                        <span className="text-dns-14N-130 text-blue-700">
                          +{diff.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardBody>
          </Card>

          {/* Bottom Indicators */}
          <Card>
            <CardHeader>
              <h3 className="text-std-16B-170 text-red-900">課題（下位3）</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              {bottomIndicators.map((v) => {
                const meta = getIndicatorMeta(v.indicatorId)
                const diff = v.normalizedScore - v.nationalAverage
                return (
                  <button
                    key={v.indicatorId}
                    onClick={() => setSelectedIndicatorId(v.indicatorId)}
                    className="w-full text-left hover:bg-solid-gray-50 rounded-4 px-3 py-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-dns-14N-130 text-solid-gray-700 truncate mr-2">
                        {meta?.label ?? v.indicatorId}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-oln-14B-100 text-red-900">
                          {v.normalizedScore}
                        </span>
                        <span className="text-dns-14N-130 text-red-700">
                          {diff.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Indicator Heatmap */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: domain.color }}
              />
              <h2 className="text-std-17B-170 text-solid-gray-900">{domain.label} - 指標一覧</h2>
            </div>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              クリックで詳細を表示。色は正規化スコア（0-100）を反映
            </p>
          </CardHeader>
          <CardBody>
            <IndicatorHeatmap
              domain={domain}
              indicators={domainIndicators}
              values={domainValues}
              onSelectIndicator={setSelectedIndicatorId}
              selectedIndicatorId={selectedIndicatorId}
            />
          </CardBody>
        </Card>
      </section>

      {/* Selected Indicator Detail */}
      {selectedMeta && selectedValue && (
        <section className="mb-8">
          <Card accent={domain.color}>
            <CardHeader>
              <h2 className="text-std-17B-170 text-solid-gray-900">{selectedMeta.label}</h2>
              <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">{selectedMeta.description}</p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Score & Comparison */}
                <div>
                  <div className="text-center mb-4">
                    <p className="text-std-24B-150" style={{ color: domain.color }}>
                      {selectedValue.normalizedScore}
                      <span className="text-dns-14N-130 text-solid-gray-500">/100</span>
                    </p>
                    <p className="text-dns-14N-130 text-solid-gray-500">正規化スコア</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-dns-14N-130 text-solid-gray-600">当自治体</span>
                        <span className="text-oln-14B-100" style={{ color: domain.color }}>{selectedValue.normalizedScore}</span>
                      </div>
                      <StatusBar value={selectedValue.normalizedScore} color={domain.color} height={8} max={100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-dns-14N-130 text-solid-gray-600">県平均</span>
                        <span className="text-oln-14B-100 text-purple-700">{selectedValue.prefectureAverage}</span>
                      </div>
                      <StatusBar value={selectedValue.prefectureAverage} color="#5B6FAF" height={8} max={100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-dns-14N-130 text-solid-gray-600">全国平均</span>
                        <span className="text-oln-14B-100 text-solid-gray-500">{selectedValue.nationalAverage}</span>
                      </div>
                      <StatusBar value={selectedValue.nationalAverage} color="#D4920B" height={8} max={100} />
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4">
                  <div className="p-3 bg-solid-gray-50 rounded-8">
                    <p className="text-oln-14B-100 text-solid-gray-600 mb-1">データソース</p>
                    <p className="text-dns-14N-130 text-solid-gray-700">{selectedMeta.source}</p>
                  </div>
                  <div className="p-3 bg-solid-gray-50 rounded-8">
                    <p className="text-oln-14B-100 text-solid-gray-600 mb-1">単位</p>
                    <p className="text-dns-14N-130 text-solid-gray-700">{selectedMeta.unit}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-solid-gray-50 rounded-8">
                      <p className="text-oln-14B-100 text-solid-gray-600 mb-1">前年スコア</p>
                      <p className="text-std-16B-170 text-solid-gray-900">{selectedValue.previousYearScore}</p>
                      <p className={`text-dns-14N-130 ${selectedValue.normalizedScore >= selectedValue.previousYearScore ? 'text-green-900' : 'text-red-900'}`}>
                        {selectedValue.normalizedScore >= selectedValue.previousYearScore ? '↑' : '↓'}
                        {Math.abs(selectedValue.normalizedScore - selectedValue.previousYearScore).toFixed(1)}
                      </p>
                    </div>
                    <div className="p-3 bg-solid-gray-50 rounded-8">
                      <p className="text-oln-14B-100 text-solid-gray-600 mb-1">全国順位</p>
                      <p className="text-std-16B-170 text-solid-gray-900">{selectedValue.rank}位</p>
                      <p className="text-dns-14N-130 text-solid-gray-500">/ {selectedValue.totalMunicipalities}市町村</p>
                    </div>
                  </div>
                </div>

                {/* Related Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-oln-14B-100 text-solid-gray-600 mb-2">関連カテゴリ</p>
                    <div className="flex flex-wrap gap-2">
                      {relatedCategories.map((cat) => cat && (
                        <span
                          key={cat.id}
                          className="px-3 py-1 rounded-8 text-dns-14N-130 text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {relatedPrograms.length > 0 && (
                    <div>
                      <p className="text-oln-14B-100 text-solid-gray-600 mb-2">関連予算事業</p>
                      <div className="space-y-2">
                        {relatedPrograms.map((prog) => (
                          <div key={prog.id} className="p-2 bg-blue-50 rounded-8">
                            <p className="text-dns-14N-130 text-blue-900 font-bold">{prog.name}</p>
                            <p className="text-dns-14N-130 text-solid-gray-500">{prog.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {/* Comparison Chart — Top Indicators */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">強み指標 TOP6 — 全国・県比較</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              {domain.label}ドメインで全国平均を上回る指標
            </p>
          </CardHeader>
          <CardBody>
            {(() => {
              const topIds = new Set(sortedByScore.slice(0, 6).map((v) => v.indicatorId))
              const topMetas = domainIndicators.filter((i) => topIds.has(i.id))
              return (
                <IndicatorComparisonBar
                  indicators={topMetas}
                  values={domainValues}
                  height={300}
                  maxItems={6}
                />
              )
            })()}
          </CardBody>
        </Card>
      </section>

      {/* Comparison Chart — Bottom Indicators */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-std-17B-170 text-solid-gray-900">課題指標 TOP6 — 全国・県比較</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              {domain.label}ドメインで改善が期待される指標
            </p>
          </CardHeader>
          <CardBody>
            {(() => {
              const bottomIds = new Set(sortedByScore.slice(-6).map((v) => v.indicatorId))
              const bottomMetas = domainIndicators.filter((i) => bottomIds.has(i.id))
              return (
                <IndicatorComparisonBar
                  indicators={bottomMetas}
                  values={domainValues}
                  height={300}
                  maxItems={6}
                />
              )
            })()}
          </CardBody>
        </Card>
      </section>
    </main>
  )
}
