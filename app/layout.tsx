import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

// SEO 메타데이터 (onthedeal.com)
export const metadata: Metadata = {
  title: {
    default: 'OnTheDeal - B2B 식자재 거래 플랫폼',
    template: '%s | OnTheDeal',
  },
  description: '식자재 구매자와 공급자를 직접 연결하는 B2B 거래 플랫폼. 더 나은 가격, 더 신선한 식자재, 더 편리한 거래.',
  keywords: ['B2B', '식자재', '도매', '한우', '축산물', '농산물', '식당', '납품', '온더딜'],
  authors: [{ name: 'OnTheDeal' }],
  creator: 'OnTheDeal',
  publisher: 'OnTheDeal',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://onthedeal.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://onthedeal.com',
    siteName: 'OnTheDeal',
    title: 'OnTheDeal - B2B 식자재 거래 플랫폼',
    description: '식자재 구매자와 공급자를 직접 연결하는 B2B 거래 플랫폼',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OnTheDeal - B2B 식자재 거래 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnTheDeal - B2B 식자재 거래 플랫폼',
    description: '식자재 구매자와 공급자를 직접 연결하는 B2B 거래 플랫폼',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 구글 서치 콘솔 및 네이버 웹마스터 인증 (나중에 추가)
    // google: 'your-google-verification-code',
    // other: { 'naver-site-verification': 'your-naver-code' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} break-keep`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
