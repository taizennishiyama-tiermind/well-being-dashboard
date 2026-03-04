'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'ホーム' },
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/indicators', label: '客観指標' },
  { href: '/budget', label: '予算分析' },
  { href: '/insights', label: 'インサイト' },
] as const

export function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-2 py-1.5 sm:px-2.5 sm:py-3 xl:px-6 xl:py-4">
      {/* Main Header Container with rounded background (marumie pattern) */}
      <div className="bg-white rounded-2xl sm:rounded-[20px] px-3 py-2 sm:py-3 xl:px-6 xl:py-0 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 xl:h-16">
          {/* Logo and Title */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 hover:opacity-80 transition-opacity"
          >
            <Image src="/icons/municipality_fill.svg" alt="" width={24} height={24} className="sm:w-7 sm:h-7" />
            <span className="text-[14px] sm:text-[17px] font-bold text-[#1f2937]">
              日高郡 Well-Being指標
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 flex-1 justify-end"
            aria-label="メインナビゲーション"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#E8F1FE] text-[#0031D8]'
                      : 'text-[#1f2937] hover:text-[#264AF4] hover:bg-[#E8F1FE]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center flex-1 justify-end lg:hidden">
            <button
              className="p-2 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="メニュー"
              aria-expanded={isMobileMenuOpen}
            >
              <Image src="/icons/menu_fill.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden pb-3 pt-2 border-t border-[#E5E7EB] mt-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold ${
                    isActive
                      ? 'bg-[#E8F1FE] text-[#0031D8]'
                      : 'text-[#1f2937] hover:bg-[#E8F1FE]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
