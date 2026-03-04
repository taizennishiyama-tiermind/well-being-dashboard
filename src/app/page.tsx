'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import { ScoreGauge } from '@/components/ui/ScoreGauge'
import { StatusBadge, StatusBar } from '@/components/ui/StatusBadge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { IllustrationPanel } from '@/components/ui/IllustrationPanel'
import { getResidents } from '@/data/sampleData'
import {
  aggregateCategories,
  getOverallScore,
  getTopSubIndicators,
  getBottomSubIndicators,
} from '@/data/aggregation'
import { getStatusLevel, getCategoryMeta, STATUS_CONFIG } from '@/data/constants'

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

export default function HomePage() {
  const residents = getResidents()
  const aggregated = aggregateCategories(residents)
  const overall = getOverallScore(residents)
  const overallStatus = getStatusLevel(overall)
  const topSubs = getTopSubIndicators(residents, 3)
  const bottomSubs = getBottomSubIndicators(residents, 3)

  return (
    <main className="page-enter mx-auto max-w-[1280px] px-5 xl:px-0 py-5 sm:py-6 space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <div className="relative bg-white border border-[#E5E7EB] rounded-[24px] overflow-hidden px-6 py-10 sm:py-14">
          <div className="absolute top-0 right-0 opacity-10">
            <Image
              src="/illustrations/l_01_rectangle_white.png"
              alt=""
              width={500}
              height={300}
              className="object-contain"
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 px-3 py-1 rounded-8 text-oln-14B-100">
                <Image src="/icons/me_fill.svg" alt="" width={16} height={16} className="opacity-70" />
                回答者 {residents.length}人
              </span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 px-3 py-1 rounded-8 text-oln-14B-100">
                <Image src="/icons/house_fill.svg" alt="" width={16} height={16} className="opacity-70" />
                7地域
              </span>
            </div>
            <p className="text-dns-14B-130 text-blue-900 mb-2">
              和歌山県日高郡内7地域の住民データから見える
            </p>
            <h1 className="text-std-28B-140 sm:text-std-36B-140 text-solid-gray-900 mb-2">
              日高郡のWell-Being指標
            </h1>
            <p className="text-dns-14N-130 text-solid-gray-600 mb-8 max-w-lg mx-auto">
              住民の実感（主観）と統計データ（客観）の両面から、
              まちの幸福度を6つの分野で可視化します。
            </p>

            <div className="flex flex-col items-center gap-6 mb-8">
              <ScoreGauge score={overall} size={180} strokeWidth={14} label="総合Well-Beingスコア" />
              <IllustrationPanel status={overallStatus} variant="hero" className="h-28" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#0031D8] text-white px-6 py-3 rounded-2xl text-oln-16B-100 hover:bg-[#0017C1] transition-colors"
              >
                <Image src="/icons/search_fill.svg" alt="" width={18} height={18} className="brightness-0 invert" />
                ダッシュボードを見る
              </Link>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 border border-[#0031D8] text-[#0031D8] px-6 py-3 rounded-2xl text-oln-16B-100 hover:bg-[#E8F1FE] transition-colors"
              >
                <Image src="/icons/information_fill.svg" alt="" width={18} height={18} />
                インサイトを確認
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Overview Grid */}
      <section>
        <h2 className="text-std-20B-160 text-solid-gray-900 mb-5">6つの指標カテゴリ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregated.map((cat) => {
            const meta = getCategoryMeta(cat.id)
            const avg = Math.round(((cat.avgSubjective + cat.avgObjective) / 2) * 10) / 10
            const status = getStatusLevel(avg)
            const borderColor = getStatusBorderColor(status)

            return (
              <Card key={cat.id} accent={borderColor}>
                <CardBody className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <CategoryIcon categoryId={cat.id} showLabel />
                    <div className="flex items-center gap-2">
                      <IllustrationPanel status={status} variant="inline" className="h-10" />
                      <StatusBadge status={status} size="sm" />
                    </div>
                  </div>

                  <p className="text-dns-14N-130 text-solid-gray-500 mb-3">{meta.description}</p>

                  {/* Visual Gap Bars */}
                  <div className="space-y-2">
                    <StatusBar
                      value={cat.avgSubjective}
                      max={10}
                      color="#E8854A"
                      height={6}
                      label="主観（住民実感）"
                    />
                    <StatusBar
                      value={cat.avgObjective}
                      max={10}
                      color="#0031D8"
                      height={6}
                      label="客観（統計データ）"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-dns-14N-130 text-solid-gray-500">ギャップ</span>
                      <span className={`text-oln-14B-100 ${cat.gap >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {cat.gap > 0 ? '+' : ''}{cat.gap.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Strengths & Weaknesses (Sub-indicator level) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardBody className="pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/complete_fill.svg" alt="" width={24} height={24} />
              <h3 className="text-std-17B-170 text-solid-gray-900">住民が高く評価している項目</h3>
            </div>
            <div className="space-y-3">
              {topSubs.map((sub, i) => (
                <div key={sub.label} className="flex items-center gap-3 p-3 bg-solid-gray-50 rounded-2xl">
                  <span className="text-std-17B-170 text-blue-900 w-6 text-center">{i + 1}</span>
                  <CategoryIcon categoryId={sub.categoryId} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-std-16B-170 text-solid-gray-900">{sub.label}</p>
                    <p className="text-dns-14N-130 text-solid-gray-500">
                      {sub.parentLabel} / 平均 {sub.avgScore.toFixed(1)}
                    </p>
                  </div>
                  <span
                    className="text-oln-16B-100 flex-shrink-0"
                    style={{ color: STATUS_CONFIG[getStatusLevel(sub.avgScore)].color }}
                  >
                    {sub.avgScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icons/attention_fill.svg" alt="" width={24} height={24} />
              <h3 className="text-std-17B-170 text-solid-gray-900">改善が期待される項目</h3>
            </div>
            <div className="space-y-3">
              {bottomSubs.map((sub, i) => (
                <div key={sub.label} className="flex items-center gap-3 p-3 bg-solid-gray-50 rounded-2xl">
                  <span className="text-std-17B-170 text-orange-700 w-6 text-center">{i + 1}</span>
                  <CategoryIcon categoryId={sub.categoryId} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-std-16B-170 text-solid-gray-900">{sub.label}</p>
                    <p className="text-dns-14N-130 text-solid-gray-500">
                      {sub.parentLabel} / 平均 {sub.avgScore.toFixed(1)}
                    </p>
                  </div>
                  <span
                    className="text-oln-16B-100 flex-shrink-0"
                    style={{ color: STATUS_CONFIG[getStatusLevel(sub.avgScore)].color }}
                  >
                    {sub.avgScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Quick Stats */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: 'me_fill.svg', value: String(residents.length), label: '回答者数' },
            { icon: 'house_fill.svg', value: '7', label: '対象地域' },
            { icon: 'health_fill.svg', value: '6', label: '評価カテゴリ' },
            { icon: 'history_fill.svg', value: '12', label: 'ヶ月分のトレンド' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardBody className="text-center py-5">
                <Image src={`/icons/${stat.icon}`} alt="" width={28} height={28} className="mx-auto mb-2 opacity-70" />
                <p className="text-std-24B-150 text-solid-gray-900">{stat.value}</p>
                <p className="text-dns-14N-130 text-solid-gray-500">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
