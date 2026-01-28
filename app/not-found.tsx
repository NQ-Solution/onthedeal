'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

// 로고 컴포넌트 (fallback 포함)
function LogoWithFallback({ className = '' }: { className?: string }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className={`bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold ${className}`}>
        OD
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="OnTheDeal"
      className={className}
      onError={() => setImgError(true)}
    />
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <LogoWithFallback className="w-12 h-12" />
          <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl">
          {/* 404 */}
          <div className="text-9xl font-bold text-primary-500 mb-6">404</div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            요청하신 페이지가 없거나 현재 준비 중입니다.<br />
            아래 연락처로 문의해주시면 도움을 드리겠습니다.
          </p>

          {/* Contact Info - 심플한 디자인 */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              문의 연락처
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
              <a href="tel:02-1234-5678" className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                <p className="text-gray-500 mb-1">전화번호</p>
                <p className="text-2xl font-bold text-gray-900">02-1234-5678</p>
              </a>
              <a href="mailto:support@onthedeal.com" className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                <p className="text-gray-500 mb-1">이메일</p>
                <p className="text-xl font-bold text-gray-900">support@onthedeal.com</p>
              </a>
            </div>
          </div>

          {/* Buttons - 심플하게 */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/">
              <Button size="xl" className="text-xl px-10">
                홈으로 돌아가기
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outline" className="text-xl px-10">
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <LogoWithFallback className="w-10 h-10" />
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </Link>
          <p className="text-lg text-gray-500">© 2026 (주) 티투알웍스</p>
        </div>
      </footer>
    </div>
  )
}
