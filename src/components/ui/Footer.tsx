'use client'

import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'ホーム', href: '/' },
  { label: 'ダッシュボード', href: '/dashboard' },
  { label: '客観指標', href: '/indicators' },
  { label: '予算分析', href: '/budget' },
  { label: 'インサイト', href: '/insights' },
] as const

export function Footer() {
  return (
    <footer className="w-full bg-[#0A1029] px-5 sm:px-8 lg:px-[117px] pt-8 sm:pt-12 pb-6 sm:pb-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-white/10">
          {/* Branding */}
          <div className="flex flex-col gap-3">
            <p className="text-[20px] font-bold text-white tracking-wide">
              日高郡 Well-Being指標
            </p>
            <p className="text-[13px] text-white/50 max-w-xs leading-relaxed">
              和歌山県日高郡の住民の実感と統計データの両面から、地域の幸福度を可視化するダッシュボードです。
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
              ページ一覧
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-[12px] text-white/30">
            &copy; 2026 Well-Being指標ダッシュボード
          </p>
          <p className="text-[11px] text-white/25">
            サンプルデータ300人分 / デジタル庁デザインシステム準拠
          </p>
        </div>
      </div>
    </footer>
  )
}
