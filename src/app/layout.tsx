import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: '日高郡 Well-Being指標ダッシュボード',
  description: '和歌山県日高郡の住民300人のWell-Being指標を可視化するダッシュボード',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased pt-[68px] sm:pt-24 flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">{children}</div>
        <div className="mt-8 sm:mt-16">
          <Footer />
        </div>
      </body>
    </html>
  )
}
