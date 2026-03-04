'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { CATEGORIES } from '@/data/constants'
import type { CategoryId } from '@/data/types'
import type { ExpenditureToWBFlow } from '@/data/budgetPageHelpers'

interface WBAllocationItem {
  readonly categoryId: CategoryId
  readonly amount: number
  readonly ratio: number
}

interface BudgetAllocationMapProps {
  readonly expenditureFlows: readonly ExpenditureToWBFlow[]
  readonly wellBeingAllocation: readonly WBAllocationItem[]
}

function formatOku(yen: number): string {
  return (yen / 100_000_000).toFixed(1)
}

export function BudgetAllocationMap({
  expenditureFlows,
  wellBeingAllocation,
}: BudgetAllocationMapProps) {
  const [showMapping, setShowMapping] = useState(false)

  const sortedAllocation = [...wellBeingAllocation].sort((a, b) => b.amount - a.amount)
  const totalWB = sortedAllocation.reduce((sum, a) => sum + a.amount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-std-17B-170 text-solid-gray-900">Well-Being予算の構成</h2>
            <p className="text-dns-14N-130 text-solid-gray-500 mt-0.5">
              6つのWell-Beingカテゴリへの予算配分
            </p>
          </div>
          <button
            onClick={() => setShowMapping(!showMapping)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-8 text-oln-14B-100 text-[#0031D8] hover:bg-blue-50 transition-colors"
          >
            <Image src="/icons/information_fill.svg" alt="" width={14} height={14} className="opacity-60" />
            分類ロジック
            <span className="text-[12px]">{showMapping ? '▲' : '▼'}</span>
          </button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Stacked Category Bar */}
        <div className="mb-4">
          <div className="w-full h-8 rounded-8 overflow-hidden flex">
            {sortedAllocation.map((item) => {
              const cat = CATEGORIES.find((c) => c.id === item.categoryId)
              const widthPct = totalWB > 0 ? (item.amount / totalWB) * 100 : 0
              if (widthPct < 1) return null

              return (
                <div
                  key={item.categoryId}
                  className="h-full flex items-center justify-center transition-all duration-300 first:rounded-l-8 last:rounded-r-8"
                  style={{ width: `${widthPct}%`, backgroundColor: cat?.color ?? '#999' }}
                  title={`${cat?.label}: ${formatOku(item.amount)}億円 (${item.ratio}%)`}
                >
                  {widthPct > 12 && (
                    <span className="text-[10px] font-bold text-white truncate px-1">
                      {cat?.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sortedAllocation.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.categoryId)
            return (
              <div key={item.categoryId} className="flex items-center gap-2 p-2 rounded-8 bg-solid-gray-50">
                <CategoryIcon categoryId={item.categoryId} size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-dns-14N-130 text-solid-gray-700 truncate">{cat?.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-oln-14B-100 text-solid-gray-900">
                      {formatOku(item.amount)}億
                    </span>
                    <span className="text-[11px] text-solid-gray-500">
                      ({item.ratio}%)
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Expandable Mapping Detail */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showMapping ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-solid-gray-200 pt-5">
            <h3 className="text-oln-14B-100 text-solid-gray-600 mb-4">
              歳出区分 → Well-Beingカテゴリ 配分ロジック
            </h3>
            <p className="text-dns-14N-130 text-solid-gray-500 mb-4">
              自治体の目的別歳出をWell-Beingの6カテゴリに按分しています。按分比率は各歳出区分の事業内容と
              Well-Beingカテゴリの関連度に基づきます。
            </p>

            <div className="space-y-3">
              {expenditureFlows.map((flow) => (
                <div key={flow.expenditureLabel} className="p-3 rounded-8 bg-solid-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: flow.expenditureColor }}
                    />
                    <span className="text-std-16B-170 text-solid-gray-900">
                      {flow.expenditureLabel}
                    </span>
                    <span className="text-dns-14N-130 text-solid-gray-500">
                      {formatOku(flow.expenditureAmount)}億円（{flow.expenditureRatio}%）
                    </span>
                  </div>

                  {flow.isWbMapped ? (
                    <div className="flex flex-wrap gap-2 ml-5">
                      {flow.mappings.map((m) => {
                        const cat = CATEGORIES.find((c) => c.id === m.wbCategoryId)
                        return (
                          <div
                            key={m.wbCategoryId}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-4 bg-white border border-solid-gray-200"
                          >
                            <span className="text-dns-14N-130 text-solid-gray-500">→</span>
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat?.color ?? '#999' }}
                            />
                            <span className="text-dns-14N-130 text-solid-gray-700">
                              {m.wbLabel}
                            </span>
                            <span className="text-oln-14B-100 text-solid-gray-900">
                              {Math.round(m.ratio * 100)}%
                            </span>
                            <span className="text-[11px] text-solid-gray-500">
                              ({formatOku(m.amount)}億)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-dns-14N-130 text-solid-gray-400 ml-5">
                      Well-Beingカテゴリ非対象
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
